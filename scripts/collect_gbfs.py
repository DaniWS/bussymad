#!/usr/bin/env python3
"""Collect live BiciMAD station occupancy from GBFS into daily JSONL files.

Usage:
  python3 scripts/collect_gbfs.py
  python3 scripts/collect_gbfs.py --out data/collected/gbfs_station_status_2026-08-24.jsonl

Default output is data/collected/gbfs_station_status_YYYY-MM-DD.jsonl (UTC),
so GitHub never sees a single file grow past the 100 MiB limit.

Designed to be run hourly via launchd or GitHub Actions.
"""

from __future__ import annotations

import argparse
import json
import sys
import urllib.request
from datetime import datetime, timezone
from pathlib import Path

STATUS_URL = "https://madrid.publicbikesystem.net/customer/gbfs/v2/es/station_status"
INFO_URL = "https://madrid.publicbikesystem.net/customer/gbfs/v2/es/station_information"
ROOT = Path(__file__).resolve().parents[1]
COLLECTED_DIR = ROOT / "data" / "collected"


def default_out_path(when: datetime | None = None) -> Path:
    day = (when or datetime.now(timezone.utc)).date().isoformat()
    return COLLECTED_DIR / f"gbfs_station_status_{day}.jsonl"


def fetch_json(url: str) -> dict:
    req = urllib.request.Request(url, headers={"User-Agent": "bussymad-gbfs-collector/0.1"})
    with urllib.request.urlopen(req, timeout=60) as resp:
        return json.load(resp)


def collect(out_path: Path, include_info: bool = False) -> dict:
    collected_at = datetime.now(timezone.utc).isoformat()
    status = fetch_json(STATUS_URL)
    stations = status.get("data", {}).get("stations", [])

    record: dict = {
        "collected_at": collected_at,
        "gbfs_last_updated": status.get("last_updated"),
        "ttl": status.get("ttl"),
        "n_stations": len(stations),
        "stations": [
            {
                "station_id": s.get("station_id"),
                "num_bikes_available": s.get("num_bikes_available"),
                "num_docks_available": s.get("num_docks_available"),
                "num_bikes_disabled": s.get("num_bikes_disabled"),
                "num_docks_disabled": s.get("num_docks_disabled"),
                "is_installed": s.get("is_installed"),
                "is_renting": s.get("is_renting"),
                "is_returning": s.get("is_returning"),
                "status": s.get("status"),
                "last_reported": s.get("last_reported"),
            }
            for s in stations
        ],
    }

    if include_info:
        info = fetch_json(INFO_URL)
        by_id = {s["station_id"]: s for s in info.get("data", {}).get("stations", [])}
        for st in record["stations"]:
            meta = by_id.get(st["station_id"], {})
            st["name"] = meta.get("name")
            st["lat"] = meta.get("lat")
            st["lon"] = meta.get("lon")
            st["capacity"] = meta.get("capacity")

    out_path.parent.mkdir(parents=True, exist_ok=True)
    with out_path.open("a", encoding="utf-8") as f:
        f.write(json.dumps(record, ensure_ascii=False) + "\n")

    return {
        "collected_at": collected_at,
        "n_stations": len(stations),
        "out": str(out_path),
    }


def main() -> int:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument(
        "--out",
        type=Path,
        default=None,
        help="JSONL path (default: data/collected/gbfs_station_status_YYYY-MM-DD.jsonl, UTC).",
    )
    parser.add_argument(
        "--with-info",
        action="store_true",
        help="Also join station_information (name/lat/lon/capacity). Heavier; use periodically.",
    )
    args = parser.parse_args()
    out_path = args.out if args.out is not None else default_out_path()
    try:
        summary = collect(out_path, include_info=args.with_info)
    except Exception as exc:  # noqa: BLE001 — log and exit non-zero for schedulers
        print(f"ERROR: {exc}", file=sys.stderr)
        return 1
    print(json.dumps(summary))
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
