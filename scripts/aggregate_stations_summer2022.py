#!/usr/bin/env python3
"""Aggregate per-station hourly occupancy for summer 2022 (Jun–Aug).

Reads monthly JSONL dumps and writes a compact JSON file for the map frontend.

Also computes Rating-mode fields at build time from the dataset:
  - mean occupancy per station / day type over waking hours (06–23), excluding overnight
  - empirical percentile among stations
  - quintile category (veryBad … veryGood) from those percentiles
  - occupancy cutoffs at P20/P40/P60/P80 for each day type
"""

from __future__ import annotations

import argparse
import json
import statistics
from collections import defaultdict
from datetime import datetime
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
MONTH_FILES = [
    "202206.json",
    "202207.json",
    "202208.json",
]

# Rating averages exclude overnight (00–05); hourly profiles still keep all 24h.
RATING_HOURS = tuple(range(6, 24))

# Quintile edges for Rating labels (fraction of stations with lower mean occupancy).
RATING_PERCENTILE_EDGES = (0.2, 0.4, 0.6, 0.8)
RATING_TIERS = ("veryBad", "bad", "fair", "good", "veryGood")


def is_open(station: dict) -> bool:
    return station.get("activate") == 1 and station.get("no_available") == 0


def occupancy(station: dict) -> float | None:
    bases = station.get("total_bases") or 0
    if bases <= 0:
        return None
    bikes = station.get("dock_bikes")
    if bikes is None:
        return None
    return bikes / bases


def day_type(dt: datetime) -> str:
    return "weekend" if dt.weekday() >= 5 else "weekday"


def mean_occupancy(hourly: list[float | None], hours: tuple[int, ...] = RATING_HOURS) -> float | None:
    """Mean occupancy over selected hours (default: 06–23, no overnight)."""
    vals = [hourly[h] for h in hours if h < len(hourly) and hourly[h] is not None]
    if not vals:
        return None
    return round(statistics.mean(vals), 4)


def percentile_rank(sorted_vals: list[float], value: float) -> float:
    """Empirical percentile of value among sorted_vals (ascending). Ties use mid-rank."""
    n = len(sorted_vals)
    if n <= 1:
        return 0.5
    lo = 0
    while lo < n and sorted_vals[lo] < value:
        lo += 1
    hi = lo
    while hi < n and sorted_vals[hi] == value:
        hi += 1
    mid = (lo + hi - 1) / 2
    return mid / (n - 1)


def rating_tier(percentile: float) -> str:
    if percentile >= RATING_PERCENTILE_EDGES[3]:
        return RATING_TIERS[4]
    if percentile >= RATING_PERCENTILE_EDGES[2]:
        return RATING_TIERS[3]
    if percentile >= RATING_PERCENTILE_EDGES[1]:
        return RATING_TIERS[2]
    if percentile >= RATING_PERCENTILE_EDGES[0]:
        return RATING_TIERS[1]
    return RATING_TIERS[0]


def occupancy_cutoff(sorted_vals: list[float], p: float) -> float | None:
    """Linear-interpolated occupancy at percentile p in [0, 1]."""
    n = len(sorted_vals)
    if n == 0:
        return None
    if n == 1:
        return round(sorted_vals[0], 4)
    pos = p * (n - 1)
    lo = int(pos)
    hi = min(lo + 1, n - 1)
    frac = pos - lo
    return round(sorted_vals[lo] * (1 - frac) + sorted_vals[hi] * frac, 4)


def build_ratings(profiles: dict[str, list[list[float | None]]]) -> dict:
    """Precompute mean occupancy, percentile, and rating tier per station / day type."""
    means: dict[str, list[float | None]] = {}
    percentiles: dict[str, list[float | None]] = {}
    ratings: dict[str, list[str | None]] = {}
    cutoffs: dict[str, dict[str, float]] = {}

    for dtype, rows in profiles.items():
        day_means = [mean_occupancy(row) for row in rows]
        sorted_means = sorted(v for v in day_means if v is not None)
        day_pcts: list[float | None] = []
        day_ratings: list[str | None] = []
        for mean in day_means:
            if mean is None or not sorted_means:
                day_pcts.append(None)
                day_ratings.append(None)
                continue
            pct = round(percentile_rank(sorted_means, mean), 4)
            day_pcts.append(pct)
            day_ratings.append(rating_tier(pct))

        means[dtype] = day_means
        percentiles[dtype] = day_pcts
        ratings[dtype] = day_ratings
        cutoffs[dtype] = {
            f"p{int(edge * 100)}": cutoff
            for edge in RATING_PERCENTILE_EDGES
            if (cutoff := occupancy_cutoff(sorted_means, edge)) is not None
        }

    return {
        "meanOccupancy": means,
        "percentile": percentiles,
        "rating": ratings,
        "cutoffs": cutoffs,
        "tiers": list(RATING_TIERS),
        "percentileEdges": list(RATING_PERCENTILE_EDGES),
    }


def process_files(paths: list[Path]) -> dict:
    # station_id -> metadata (name, lat, lon, total_bases)
    meta: dict[int, dict] = {}
    # (station_id, day_type, hour) -> list of occupancy samples
    buckets: dict[tuple[int, str, int], list[float]] = defaultdict(list)
    n_snapshots = 0

    for path in paths:
        with path.open(encoding="utf-8") as f:
            for line in f:
                line = line.strip()
                if not line:
                    continue
                obj = json.loads(line)
                dt = datetime.fromisoformat(obj["_id"])
                dtype = day_type(dt)
                hour = dt.hour
                n_snapshots += 1

                for st in obj.get("stations", []):
                    sid = st["id"]
                    if not is_open(st):
                        continue
                    rate = occupancy(st)
                    if rate is None:
                        continue
                    buckets[(sid, dtype, hour)].append(rate)
                    if sid not in meta:
                        meta[sid] = {
                            "id": sid,
                            "name": st.get("name", ""),
                            "lat": float(st["latitude"]),
                            "lon": float(st["longitude"]),
                            "totalBases": st.get("total_bases", 0),
                        }

    station_ids = sorted(meta.keys())
    profiles: dict[str, list[list[float | None]]] = {"weekday": [], "weekend": []}

    for sid in station_ids:
        for dtype in ("weekday", "weekend"):
            hourly: list[float | None] = []
            for hour in range(24):
                vals = buckets.get((sid, dtype, hour), [])
                hourly.append(round(statistics.mean(vals), 4) if vals else None)
            profiles[dtype].append(hourly)

    stations = [meta[sid] for sid in station_ids]
    rating_block = build_ratings(profiles)

    return {
        "n_snapshots": n_snapshots,
        "n_stations": len(stations),
        "stations": stations,
        "profiles": profiles,
        "ratings": rating_block,
    }


def find_month_files(input_dir: Path) -> list[Path]:
    paths: list[Path] = []
    candidates = [
        input_dir,
        input_dir / "extracted",
        input_dir / "june",
        ROOT / "data" / "raw" / "summer2022" / "extracted",
    ]
    for filename in MONTH_FILES:
        path = None
        for base in candidates:
            p = base / filename
            if p.exists():
                path = p
                break
        if path is None:
            found = list(input_dir.rglob(filename))
            if found:
                path = found[0]
        if path is None:
            raise FileNotFoundError(f"Missing {filename} under {input_dir}")
        paths.append(path)
        print(f"  ← {path}")
    return paths


def main() -> None:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument(
        "--input-dir",
        type=Path,
        default=ROOT / "data" / "raw" / "summer2022",
    )
    parser.add_argument(
        "--out",
        type=Path,
        default=ROOT / "public" / "data" / "stations_summer2022.json",
    )
    args = parser.parse_args()

    print("Processing summer 2022 station files:")
    paths = find_month_files(args.input_dir)
    result = process_files(paths)
    ratings = result["ratings"]

    payload = {
        "meta": {
            "season": "summer",
            "year": 2022,
            "months": ["june", "july", "august"],
            "metric": "occupancy = dock_bikes / total_bases (open stations only)",
            "dayTypes": ["weekday", "weekend"],
            "hours": list(range(24)),
            "ratingHours": list(RATING_HOURS),
            "n_snapshots": result["n_snapshots"],
            "n_stations": result["n_stations"],
            "ratingTiers": ratings["tiers"],
            "ratingPercentileEdges": ratings["percentileEdges"],
            "ratingCutoffs": ratings["cutoffs"],
        },
        "stations": result["stations"],
        "profiles": result["profiles"],
        "meanOccupancy": ratings["meanOccupancy"],
        "percentile": ratings["percentile"],
        "rating": ratings["rating"],
    }

    args.out.parent.mkdir(parents=True, exist_ok=True)
    args.out.write_text(json.dumps(payload, separators=(",", ":")), encoding="utf-8")
    print(f"Wrote {args.out} ({result['n_stations']} stations, {result['n_snapshots']} snapshots)")
    for dtype, cuts in ratings["cutoffs"].items():
        print(f"  rating cutoffs [{dtype}]: {cuts}")


if __name__ == "__main__":
    main()
