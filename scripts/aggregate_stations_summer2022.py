#!/usr/bin/env python3
"""Build per-station hourly bike availability for the BusyMAD map.

Sources:
  1. Summer 2022 open-data dumps (Jun–Aug) — historical typical day
  2. Recent GBFS snapshots in data/collected/ — current network + short-run means

Matching: 2022 ↔ GBFS by nearest lat/lon (greedy, ≤ MATCH_RADIUS_M).
Blend for matched stations: 70% 2022 + 30% mined (per hour / day type when both exist).
New GBFS-only stations are added at 100% mined. Unmatched 2022 stations stay 100% 2022.

Primary metric is absolute available bikes (`dock_bikes` / `num_bikes_available`).
"""

from __future__ import annotations

import argparse
import json
import math
import statistics
import urllib.request
from collections import defaultdict
from datetime import datetime
from pathlib import Path
from zoneinfo import ZoneInfo

ROOT = Path(__file__).resolve().parents[1]
MONTH_FILES = [
    "202206.json",
    "202207.json",
    "202208.json",
]
COLLECTED_DIR = ROOT / "data" / "collected"
STATION_INFO_URL = "https://madrid.publicbikesystem.net/customer/gbfs/v2/es/station_information"
STATION_INFO_CACHE = COLLECTED_DIR / "station_information.json"
MADRID_TZ = ZoneInfo("Europe/Madrid")

# Rating averages exclude overnight (00–05); hourly profiles still keep all 24h.
RATING_HOURS = tuple(range(6, 24))

# Quintile edges for Rating labels (fraction of stations with lower mean bikes).
RATING_PERCENTILE_EDGES = (0.2, 0.4, 0.6, 0.8)
RATING_TIERS = ("veryBad", "bad", "fair", "good", "veryGood")

# Domain stops for the hourly red→green palette (fraction of all hourly means).
COLOR_PERCENTILE_EDGES = (0.0, 0.25, 0.5, 0.75, 0.95)

# Blend: historical keeps the majority when both sources have a cell.
HIST_WEIGHT = 0.7
MINED_WEIGHT = 0.3
MATCH_RADIUS_M = 150.0


def is_open(station: dict) -> bool:
    return station.get("activate") == 1 and station.get("no_available") == 0


def available_bikes(station: dict) -> float | None:
    bases = station.get("total_bases") or 0
    if bases <= 0:
        return None
    bikes = station.get("dock_bikes")
    if bikes is None:
        return None
    return float(bikes)


def day_type(dt: datetime) -> str:
    return "weekend" if dt.weekday() >= 5 else "weekday"


def mean_over_hours(hourly: list[float | None], hours: tuple[int, ...] = RATING_HOURS) -> float | None:
    """Mean bike count over selected hours (default: 06–23, no overnight)."""
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


def value_at_percentile(sorted_vals: list[float], p: float) -> float | None:
    """Linear-interpolated value at percentile p in [0, 1]."""
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
    """Precompute mean bikes, percentile, and rating tier per station / day type."""
    means: dict[str, list[float | None]] = {}
    percentiles: dict[str, list[float | None]] = {}
    ratings: dict[str, list[str | None]] = {}
    cutoffs: dict[str, dict[str, float]] = {}

    for dtype, rows in profiles.items():
        day_means = [mean_over_hours(row) for row in rows]
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
            if (cutoff := value_at_percentile(sorted_means, edge)) is not None
        }

    return {
        "meanBikes": means,
        "percentile": percentiles,
        "rating": ratings,
        "cutoffs": cutoffs,
        "tiers": list(RATING_TIERS),
        "percentileEdges": list(RATING_PERCENTILE_EDGES),
    }


def color_bike_stops(profiles: dict[str, list[list[float | None]]]) -> list[float]:
    """Absolute bike-count stops for the hourly color gradient."""
    vals: list[float] = []
    for rows in profiles.values():
        for row in rows:
            vals.extend(v for v in row if v is not None)
    sorted_vals = sorted(vals)
    stops: list[float] = []
    for edge in COLOR_PERCENTILE_EDGES:
        cutoff = value_at_percentile(sorted_vals, edge)
        if cutoff is None:
            continue
        if stops and cutoff < stops[-1]:
            cutoff = stops[-1]
        stops.append(cutoff)
    if not stops:
        return [0.0, 3.0, 6.0, 10.0, 15.0]
    if stops[0] > 0:
        stops[0] = 0.0
    return stops


def empty_profile() -> list[float | None]:
    return [None] * 24


def fill_hourly_gaps(hourly: list[float | None]) -> list[float | None]:
    """Fill null hours with the average of the nearest known hours on each side (24h wrap)."""
    n = len(hourly)
    if n == 0 or all(v is None for v in hourly) or all(v is not None for v in hourly):
        return list(hourly)

    out = list(hourly)
    for h in range(n):
        if out[h] is not None:
            continue
        left_val: float | None = None
        right_val: float | None = None
        for step in range(1, n):
            v = hourly[(h - step) % n]
            if v is not None:
                left_val = v
                break
        for step in range(1, n):
            v = hourly[(h + step) % n]
            if v is not None:
                right_val = v
                break
        if left_val is not None and right_val is not None:
            out[h] = round((left_val + right_val) / 2, 4)
        elif left_val is not None:
            out[h] = left_val
        elif right_val is not None:
            out[h] = right_val
    return out


def fill_profiles(profiles: dict[str, list[list[float | None]]]) -> dict[str, list[list[float | None]]]:
    return {
        dtype: [fill_hourly_gaps(row) for row in rows] for dtype, rows in profiles.items()
    }


def blend_hourly(
    hist: list[float | None] | None,
    mined: list[float | None] | None,
    *,
    mined_weight: float = MINED_WEIGHT,
) -> list[float | None]:
    """Per-hour blend. Missing side → use the other; both missing → None."""
    hist_w = 1.0 - mined_weight
    h = hist or empty_profile()
    m = mined or empty_profile()
    out: list[float | None] = []
    for hv, mv in zip(h, m):
        if hv is not None and mv is not None:
            out.append(round(hist_w * hv + mined_weight * mv, 4))
        elif hv is not None:
            out.append(hv)
        elif mv is not None:
            out.append(mv)
        else:
            out.append(None)
    return out


def haversine_m(lat1: float, lon1: float, lat2: float, lon2: float) -> float:
    r = 6371000.0
    p1, p2 = math.radians(lat1), math.radians(lat2)
    dp = math.radians(lat2 - lat1)
    dl = math.radians(lon2 - lon1)
    a = math.sin(dp / 2) ** 2 + math.cos(p1) * math.cos(p2) * math.sin(dl / 2) ** 2
    return 2 * r * math.asin(math.sqrt(a))


def process_files(paths: list[Path]) -> dict:
    meta: dict[int, dict] = {}
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
                    bikes = available_bikes(st)
                    if bikes is None:
                        continue
                    buckets[(sid, dtype, hour)].append(bikes)
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
    return {
        "n_snapshots": n_snapshots,
        "n_stations": len(stations),
        "stations": stations,
        "profiles": profiles,
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


def load_station_information() -> list[dict]:
    """GBFS station_information (live fetch with disk cache fallback)."""
    info: dict | None = None
    try:
        req = urllib.request.Request(STATION_INFO_URL, headers={"User-Agent": "busymad-gbfs/0.1"})
        with urllib.request.urlopen(req, timeout=60) as resp:
            info = json.load(resp)
        STATION_INFO_CACHE.parent.mkdir(parents=True, exist_ok=True)
        STATION_INFO_CACHE.write_text(json.dumps(info), encoding="utf-8")
        print(f"  ← station_information (live) → {STATION_INFO_CACHE}")
    except Exception as exc:  # noqa: BLE001 — fall back to cache for offline builds
        if STATION_INFO_CACHE.exists():
            info = json.loads(STATION_INFO_CACHE.read_text(encoding="utf-8"))
            print(f"  ← station_information (cache; live failed: {exc})")
        else:
            raise RuntimeError(f"Cannot load station_information: {exc}") from exc

    assert info is not None
    out: list[dict] = []
    for s in info.get("data", {}).get("stations", []):
        sid = s.get("station_id")
        if sid is None or s.get("lat") is None or s.get("lon") is None:
            continue
        try:
            nid = int(sid)
        except (TypeError, ValueError):
            continue
        out.append(
            {
                "id": nid,
                "name": s.get("name") or str(sid),
                "lat": float(s["lat"]),
                "lon": float(s["lon"]),
                "totalBases": int(s.get("capacity") or 0),
            }
        )
    return out


def gbfs_is_open(station: dict) -> bool:
    if station.get("is_installed") is False:
        return False
    if station.get("is_renting") is False and station.get("is_returning") is False:
        return False
    status = station.get("status")
    if status and status not in ("IN_SERVICE", "active", "Active"):
        return False
    return True


def process_gbfs(collected_dir: Path) -> dict:
    """Aggregate collected GBFS JSONL into weekday/weekend hourly bike means."""
    paths = sorted(collected_dir.glob("gbfs_station_status_*.jsonl"))
    if not paths:
        return {
            "n_snapshots": 0,
            "stations": {},
            "profiles": {},
            "days": [],
        }

    info_by_id = {s["id"]: s for s in load_station_information()}
    buckets: dict[tuple[int, str, int], list[float]] = defaultdict(list)
    seen_meta: dict[int, dict] = {}
    n_snapshots = 0
    days: set[str] = set()

    for path in paths:
        print(f"  ← {path}")
        with path.open(encoding="utf-8") as f:
            for line in f:
                line = line.strip()
                if not line:
                    continue
                obj = json.loads(line)
                collected = obj.get("collected_at")
                if not collected:
                    continue
                dt = datetime.fromisoformat(collected.replace("Z", "+00:00")).astimezone(MADRID_TZ)
                dtype = day_type(dt)
                hour = dt.hour
                n_snapshots += 1
                days.add(dt.date().isoformat())

                for st in obj.get("stations", []):
                    if not gbfs_is_open(st):
                        continue
                    raw_id = st.get("station_id")
                    if raw_id is None:
                        continue
                    try:
                        sid = int(raw_id)
                    except (TypeError, ValueError):
                        continue
                    bikes = st.get("num_bikes_available")
                    if bikes is None:
                        continue
                    buckets[(sid, dtype, hour)].append(float(bikes))
                    if sid not in seen_meta:
                        if sid in info_by_id:
                            seen_meta[sid] = dict(info_by_id[sid])
                        else:
                            # Status-only fallback (no coordinates) — skip adding later
                            seen_meta[sid] = {
                                "id": sid,
                                "name": str(sid),
                                "lat": None,
                                "lon": None,
                                "totalBases": 0,
                            }

    profiles: dict[int, dict[str, list[float | None]]] = {}
    stations: dict[int, dict] = {}
    for sid, meta in seen_meta.items():
        if meta.get("lat") is None or meta.get("lon") is None:
            continue
        # Prefer freshest info capacity/name/coords when available
        if sid in info_by_id:
            meta = dict(info_by_id[sid])
        stations[sid] = meta
        profiles[sid] = {}
        for dtype in ("weekday", "weekend"):
            hourly: list[float | None] = []
            for hour in range(24):
                vals = buckets.get((sid, dtype, hour), [])
                hourly.append(round(statistics.mean(vals), 4) if vals else None)
            profiles[sid][dtype] = hourly

    return {
        "n_snapshots": n_snapshots,
        "stations": stations,
        "profiles": profiles,
        "days": sorted(days),
    }


def match_stations(
    hist_stations: list[dict],
    gbfs_stations: dict[int, dict],
    radius_m: float = MATCH_RADIUS_M,
) -> tuple[dict[int, int], set[int], set[int]]:
    """Greedy nearest-neighbour match. Returns hist_id→gbfs_id, unmatched hist, unmatched gbfs."""
    pairs: list[tuple[float, int, int]] = []
    for hs in hist_stations:
        hid = int(hs["id"])
        for gid, gs in gbfs_stations.items():
            dist = haversine_m(hs["lat"], hs["lon"], gs["lat"], gs["lon"])
            if dist <= radius_m:
                pairs.append((dist, hid, gid))
    pairs.sort()

    hist_to_gbfs: dict[int, int] = {}
    used_hist: set[int] = set()
    used_gbfs: set[int] = set()
    for _dist, hid, gid in pairs:
        if hid in used_hist or gid in used_gbfs:
            continue
        used_hist.add(hid)
        used_gbfs.add(gid)
        hist_to_gbfs[hid] = gid

    unmatched_hist = {int(s["id"]) for s in hist_stations} - used_hist
    unmatched_gbfs = set(gbfs_stations.keys()) - used_gbfs
    return hist_to_gbfs, unmatched_hist, unmatched_gbfs


def merge_datasets(hist: dict, gbfs: dict, *, mined_weight: float = MINED_WEIGHT) -> dict:
    hist_stations: list[dict] = hist["stations"]
    hist_index = {int(s["id"]): i for i, s in enumerate(hist_stations)}
    gbfs_stations: dict[int, dict] = gbfs["stations"]
    gbfs_profiles: dict[int, dict[str, list[float | None]]] = gbfs["profiles"]

    hist_to_gbfs, unmatched_hist, unmatched_gbfs = match_stations(hist_stations, gbfs_stations)

    stations: list[dict] = []
    profiles: dict[str, list[list[float | None]]] = {"weekday": [], "weekend": []}
    sources: list[str] = []

    # 1) Matched: GBFS identity + blended profiles
    for hid, gid in sorted(hist_to_gbfs.items(), key=lambda kv: kv[1]):
        hi = hist_index[hid]
        meta = dict(gbfs_stations[gid])
        stations.append(meta)
        sources.append("blend")
        for dtype in ("weekday", "weekend"):
            profiles[dtype].append(
                blend_hourly(
                    hist["profiles"][dtype][hi],
                    gbfs_profiles.get(gid, {}).get(dtype),
                    mined_weight=mined_weight,
                )
            )

    # 2) Unmatched historical (no nearby GBFS station)
    for hid in sorted(unmatched_hist):
        hi = hist_index[hid]
        stations.append(dict(hist_stations[hi]))
        sources.append("hist")
        for dtype in ("weekday", "weekend"):
            profiles[dtype].append(list(hist["profiles"][dtype][hi]))

    # 3) New GBFS stations
    for gid in sorted(unmatched_gbfs):
        stations.append(dict(gbfs_stations[gid]))
        sources.append("gbfs")
        for dtype in ("weekday", "weekend"):
            profiles[dtype].append(list(gbfs_profiles.get(gid, {}).get(dtype) or empty_profile()))

    # Temporary: fill hours without GBFS samples from neighbouring hours.
    profiles = fill_profiles(profiles)

    ratings = build_ratings(profiles)
    return {
        "stations": stations,
        "profiles": profiles,
        "ratings": ratings,
        "colorBikeStops": color_bike_stops(profiles),
        "n_matched": len(hist_to_gbfs),
        "n_hist_only": len(unmatched_hist),
        "n_gbfs_only": len(unmatched_gbfs),
        "sources": sources,
        "gbfs_days": gbfs.get("days", []),
        "gbfs_snapshots": gbfs.get("n_snapshots", 0),
        "hist_snapshots": hist.get("n_snapshots", 0),
    }


def main() -> None:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument(
        "--input-dir",
        type=Path,
        default=ROOT / "data" / "raw" / "summer2022",
    )
    parser.add_argument(
        "--collected-dir",
        type=Path,
        default=COLLECTED_DIR,
    )
    parser.add_argument(
        "--out",
        type=Path,
        default=ROOT / "public" / "data" / "stations_summer2022.json",
    )
    parser.add_argument(
        "--mined-weight",
        type=float,
        default=MINED_WEIGHT,
        help="Relative weight for mined GBFS cells when blending (default 0.3).",
    )
    parser.add_argument(
        "--skip-gbfs",
        action="store_true",
        help="Build from summer 2022 only (no GBFS blend).",
    )
    args = parser.parse_args()

    print("Processing summer 2022 station files:")
    paths = find_month_files(args.input_dir)
    hist = process_files(paths)
    print(f"  hist stations={hist['n_stations']} snapshots={hist['n_snapshots']}")

    if args.skip_gbfs:
        hist_profiles = fill_profiles(hist["profiles"])
        ratings = build_ratings(hist_profiles)
        merged = {
            "stations": hist["stations"],
            "profiles": hist_profiles,
            "ratings": ratings,
            "colorBikeStops": color_bike_stops(hist_profiles),
            "n_matched": 0,
            "n_hist_only": hist["n_stations"],
            "n_gbfs_only": 0,
            "gbfs_days": [],
            "gbfs_snapshots": 0,
            "hist_snapshots": hist["n_snapshots"],
        }
    else:
        print("Processing GBFS collected snapshots:")
        gbfs = process_gbfs(args.collected_dir)
        print(
            f"  gbfs stations={len(gbfs['stations'])} snapshots={gbfs['n_snapshots']} days={gbfs['days']}"
        )
        merged = merge_datasets(hist, gbfs, mined_weight=args.mined_weight)
        print(
            f"  merge matched={merged['n_matched']} hist_only={merged['n_hist_only']} "
            f"gbfs_only={merged['n_gbfs_only']} mined_weight={args.mined_weight}"
        )

    ratings = merged["ratings"]
    n_stations = len(merged["stations"])
    payload = {
        "meta": {
            "season": "summer",
            "year": 2022,
            "months": ["june", "july", "august"],
            "metric": "available bikes (absolute count; independent of capacity)",
            "dayTypes": ["weekday", "weekend"],
            "hours": list(range(24)),
            "ratingHours": list(RATING_HOURS),
            "n_snapshots": merged["hist_snapshots"] + merged["gbfs_snapshots"],
            "n_stations": n_stations,
            "ratingTiers": ratings["tiers"],
            "ratingPercentileEdges": ratings["percentileEdges"],
            "ratingCutoffs": ratings["cutoffs"],
            "colorBikeStops": merged["colorBikeStops"],
            "sources": {
                "historical": "summer2022 open data (Jun–Aug 2022)",
                "mined": "GBFS station_status snapshots",
                "minedDays": merged["gbfs_days"],
                "minedSnapshots": merged["gbfs_snapshots"],
                "histSnapshots": merged["hist_snapshots"],
                "blend": {
                    "histWeight": 1.0 - args.mined_weight,
                    "minedWeight": args.mined_weight,
                    "matchRadiusM": MATCH_RADIUS_M,
                    "matched": merged["n_matched"],
                    "histOnly": merged["n_hist_only"],
                    "gbfsOnly": merged["n_gbfs_only"],
                },
            },
        },
        "stations": merged["stations"],
        "profiles": merged["profiles"],
        "meanBikes": ratings["meanBikes"],
        "percentile": ratings["percentile"],
        "rating": ratings["rating"],
    }

    args.out.parent.mkdir(parents=True, exist_ok=True)
    args.out.write_text(json.dumps(payload, separators=(",", ":")), encoding="utf-8")
    print(f"Wrote {args.out} ({n_stations} stations)")
    print(f"  colorBikeStops: {merged['colorBikeStops']}")
    for dtype, cuts in ratings["cutoffs"].items():
        print(f"  rating cutoffs [{dtype}] (bikes): {cuts}")


if __name__ == "__main__":
    main()
