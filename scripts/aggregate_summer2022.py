#!/usr/bin/env python3
"""Aggregate Jun/Jul/Aug BiciMAD station occupancy into hourly citywide profiles.

Reads monthly JSONL dumps (each line: {_id: ISO timestamp, stations: [...]}).
Writes a small JSON aggregate for the comparison chart.
"""

from __future__ import annotations

import argparse
import json
import statistics
from collections import defaultdict
from datetime import datetime
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
MONTH_FILES = {
    6: "202206.json",
    7: "202207.json",
    8: "202208.json",
}
MONTH_NAMES = {6: "June", 7: "July", 8: "August"}


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


def process_month(path: Path) -> dict:
    # key: (day_type, hour) -> list of citywide mean occupancy per snapshot
    buckets: dict[tuple[str, int], list[float]] = defaultdict(list)
    n_snapshots = 0
    station_ids: set[int] = set()

    with path.open(encoding="utf-8") as f:
        for line in f:
            line = line.strip()
            if not line:
                continue
            obj = json.loads(line)
            dt = datetime.fromisoformat(obj["_id"])
            rates = []
            for st in obj.get("stations", []):
                if not is_open(st):
                    continue
                rate = occupancy(st)
                if rate is None:
                    continue
                rates.append(rate)
                station_ids.add(st["id"])
            if not rates:
                continue
            buckets[(day_type(dt), dt.hour)].append(statistics.mean(rates))
            n_snapshots += 1

    series = {"weekday": [None] * 24, "weekend": [None] * 24}
    counts = {"weekday": [0] * 24, "weekend": [0] * 24}
    for (dtype, hour), vals in buckets.items():
        series[dtype][hour] = round(statistics.mean(vals), 4)
        counts[dtype][hour] = len(vals)

    return {
        "n_snapshots": n_snapshots,
        "n_stations_seen": len(station_ids),
        "hourly_mean_occupancy": series,
        "hourly_snapshot_counts": counts,
    }


def main() -> None:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument(
        "--input-dir",
        type=Path,
        default=ROOT / "data" / "raw" / "summer2022",
        help="Directory containing 202206.json, 202207.json, 202208.json",
    )
    parser.add_argument(
        "--out",
        type=Path,
        default=ROOT / "data" / "aggregates" / "summer2022_hourly.json",
    )
    args = parser.parse_args()

    # Accept either flat dir or nested extract paths
    candidates = [
        args.input_dir,
        args.input_dir / "june",
        ROOT / "data" / "raw" / "summer2022" / "june",
        ROOT / "data" / "raw" / "summer2022" / "extracted",
    ]

    months_out = {}
    for month, filename in MONTH_FILES.items():
        path = None
        for base in candidates:
            p = base / filename
            if p.exists():
                path = p
                break
        # Also search recursively under input-dir
        if path is None:
            found = list(args.input_dir.rglob(filename))
            if found:
                path = found[0]
        if path is None:
            raise FileNotFoundError(f"Missing {filename} under {args.input_dir}")
        print(f"Processing {MONTH_NAMES[month]} ← {path}")
        months_out[MONTH_NAMES[month].lower()] = {
            "month": month,
            "year": 2022,
            "source_file": str(path.name),
            **process_month(path),
        }

    payload = {
        "metric": "occupancy = dock_bikes / total_bases (open stations only)",
        "year": 2022,
        "months": ["june", "july", "august"],
        "day_types": ["weekday", "weekend"],
        "hours": list(range(24)),
        "data": months_out,
    }
    args.out.parent.mkdir(parents=True, exist_ok=True)
    args.out.write_text(json.dumps(payload, indent=2), encoding="utf-8")
    print(f"Wrote {args.out}")


if __name__ == "__main__":
    main()
