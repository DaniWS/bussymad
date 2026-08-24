# bussymad

BiciMAD station availability over the day — data exploration first, map/PWA later.

Living spec: [SPEC.md](SPEC.md)

## What’s here

- **Summer 2022 comparison** — citywide hourly occupancy Jun vs Jul vs Aug  
  Open: [viz/summer2022.html](viz/summer2022.html) (serve the repo root so `fetch` works)
- **GBFS collector** — builds our own hourly history from the live feed (needed because public occupancy archives stop in Feb 2023)

```bash
# View the chart
python3 -m http.server 8765
# open http://127.0.0.1:8765/viz/summer2022.html
```

## Hourly collection from this Mac

**Problem:** a laptop sleeps. `cron` / `launchd` jobs do **not** run while macOS is asleep, so you will miss hours overnight or when the lid is closed.

### Recommended: GitHub Actions (reliable 24/7)

Already in the repo: [`.github/workflows/collect-gbfs.yml`](.github/workflows/collect-gbfs.yml)

- Runs every hour at `:05` UTC on GitHub’s runners
- Appends one line to `data/collected/gbfs_station_status_YYYY-MM-DD.jsonl` (UTC) and commits it
- Daily files stay ~4 MB, under GitHub’s 100 MB file cap
- Works even when this Mac is off. The repo should stay **public** so the hourly cron actually fires (and Actions minutes stay free).

Enable Actions on the GitHub repo, then either wait for the schedule or run **Actions → Collect GBFS hourly → Run workflow**.

### Optional: local `launchd` (when Mac is awake)

Native macOS scheduler — better than `cron` on modern Macs, but still sleep-bound.

```bash
# Paths in the plist already point at /Users/danielg/bussymad and Homebrew python3
cp scripts/com.bussymad.gbfs.plist ~/Library/LaunchAgents/
launchctl load ~/Library/LaunchAgents/com.bussymad.gbfs.plist
# immediate test:
launchctl start com.bussymad.gbfs
# or:
python3 scripts/collect_gbfs.py
```

Logs: `data/collected/launchd.out.log` / `launchd.err.log`

Unload later:

```bash
launchctl unload ~/Library/LaunchAgents/com.bussymad.gbfs.plist
```

### Practical combo

Use **GitHub Actions as the source of truth**. Optionally also run `launchd` locally for redundancy or offline experiments. Prefer Actions if you only want one.

Keeping the Mac awake with `caffeinate` or disabling sleep is possible but noisy for a laptop — not recommended.

## Historical ETL (already run for summer 2022)

```bash
python3 scripts/aggregate_summer2022.py \
  --input-dir data/raw/summer2022/extracted
# → data/aggregates/summer2022_hourly.json
```

Raw yearly dumps live under `data/raw/` (gitignored).
