#!/usr/bin/env python3
"""Aggregate per-station hourly occupancy for summer 2022 (Jun–Aug).

Reads monthly JSONL dumps and writes a compact JSON file for the map frontend.
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

    payload = {
        "meta": {
            "season": "summer",
            "year": 2022,
            "months": ["june", "july", "august"],
            "metric": "occupancy = dock_bikes / total_bases (open stations only)",
            "dayTypes": ["weekday", "weekend"],
            "hours": list(range(24)),
            "n_snapshots": result["n_snapshots"],
            "n_stations": result["n_stations"],
        },
        "stations": result["stations"],
        "profiles": result["profiles"],
    }

    args.out.parent.mkdir(parents=True, exist_ok=True)
    args.out.write_text(json.dumps(payload, separators=(",", ":")), encoding="utf-8")
    print(f"Wrote {args.out} ({result['n_stations']} stations, {result['n_snapshots']} snapshots)")


if __name__ == "__main__":
    main()
