# Busymad — living spec

Iterative product/data spec. Update this file as we learn more.

## Product intent

Busymad is a web / responsive mobile app that shows a **map of BiciMAD station availability at a chosen time of day**.

- Time slider at **1h** intervals (30 min later if data supports it).
- **Rating** view mode: per-station **mean occupancy across the 24h**. Hover shows a **precomputed percentile classifier** (baked into `stations_summer2022.json` by `npm run data` / deploy): quintiles of mean occupancy among stations for that day type → *muy bueno* / *bueno* / *regular* / *malo* / *muy malo*. Occupancy cutoffs at P20/P40/P60/P80 live in `meta.ratingCutoffs`.
- Color gradient: **red (low bikes)** → **green (high bikes)**.
- Primary metric: **occupancy rate** `dock_bikes / total_bases` (not raw bike counts).
- **Season toggle:** `summer` (Jun–Aug typical day) vs `all-year` (full-year typical day).
- **Day-type toggle:** `weekday` vs `weekend`.

v0 focus is **data feasibility + hourly pattern check**, not the map yet.

## Data provenance

| Source | URL | Claimed content | Status |
|--------|-----|-----------------|--------|
| 216343 disponibilidad | [datos.madrid.es](https://datos.madrid.es/dataset/216343-0-bicimad-disponibilidad) | Historical availability Aug 2015 – Jan 2022 | **Not usable** for hourly occupancy. Citywide daily CSV only (~169 KB). |
| 900034 históricos viajes+estaciones | [datos.madrid.es](https://datos.madrid.es/dataset/900034-0-bicimad-viajes-estaciones) | Anonymized trips **and** station operational status, Apr 2017 – Feb 2023 | **Primary historical source**. Yearly ZIPs. Last complete summer: **2022**. |
| EMT históricos 2017–2023 | [datos.emtmadrid.es](https://datos.emtmadrid.es/dataset/historicos-de-bicimad-2017_2023) | Same as 900034 | Mirror; `202206/07/08-json.zip` = station snapshots. |
| 300242 estaciones día/hora | [datos.madrid.es](https://datos.madrid.es/dataset/300242-0-bicimad-estaciones) | Monthly hourly station status since Jul 2018 | **Locked** (CKAN 403 / auth denied). |
| GBFS live | [station_status](https://madrid.publicbikesystem.net/customer/gbfs/v2/es/station_status) | Real-time bikes/docks per station | Live only. We self-collect hourly via `scripts/collect_gbfs.py`. |

### Verification notes (2026-08-24)

**2025 / 2026 per-station occupancy: NOT publicly available.** After Feb 2023, open data only has daily trip totals + live GBFS.

- **216343**: citywide daily (`MEDIA_BICICLETAS_DISPONIBLES`, usos). Not per-station.
- **900034 2022**: JSONL snapshots `{"_id": "2022-06-01T00:43:51…", "stations":[{dock_bikes, total_bases, …}]}` ~hourly (~709/month), ~264 stations.
- **Chosen summer for first viz**: **Jun / Jul / Aug 2022**.
- **Decision**: both — 2022 comparison **and** GBFS collector going forward.

## Metric & aggregation rules

- `occupancy = dock_bikes / total_bases`
- Drop closed stations: `activate != 1` or `no_available == 1`
- Bin: **1 hour**
- First viz: citywide mean occupancy by hour-of-day, one line per month, weekday vs weekend

## Network caveat

~264 stations in summer 2022 vs ~681 today (GBFS). A 2022 typical-day map will not match the current station set.

## Hourly GBFS collector (self-built 2025/2026+)

See [README.md](README.md). Recommendation:

1. **Best for reliable hourly**: GitHub Actions cron (`.github/workflows/collect-gbfs.yml`) — runs while Mac sleeps. Writes `data/collected/gbfs_station_status_YYYY-MM-DD.jsonl` (one file per UTC day, all stations per snapshot). Repo should be public so the schedule fires.
2. **Best local-on-Mac**: `launchd` LaunchAgent (`scripts/com.busymad.gbfs.plist`) — native, but **skips hours while asleep**.

## Out of scope for v0

- Live map / MapLibre
- PWA shell
- 30-minute interpolation
- Trip-derived demand
- Backend / database

## Open questions

- ~~Does 300242 still publish 2024–2026 monthly dumps?~~ **No** — auth-locked.
- ~~2022 summer vs GBFS collector?~~ **Both.**
- ~~Do Jun/Jul/Aug follow the same daily pattern?~~ **Yes** (citywide) — see findings.
- Per-station: do individual stations still share a stable daily shape across months? (next)
- ~~Map: weekday-only typical day, or also weekend toggle?~~ **Both toggles required** — weekday/weekend and summer/all-year.

## Findings from first comparison

Chart: [viz/summer2022.html](viz/summer2022.html) · data: [data/aggregates/summer2022_hourly.json](data/aggregates/summer2022_hourly.json)

**Citywide Jun / Jul / Aug 2022 follow the same daily pattern.**

| Day type | Mean abs diff between months |
|----------|------------------------------|
| Weekday | ~0.5–0.7 percentage points |
| Weekend | ~0.3–0.5 percentage points |

- Peak occupancy: early morning (~04–06)
- Dip: evening (~19–21)
- Absolute levels sit in a narrow band (~39–45% mean)

**Implication for the map slider:** do not expose per-month controls. Build **summer** (Jun–Aug) and **all-year** typical-day profiles, each split by **weekday** / **weekend**, and drive the map with those two toggles plus the time slider. Confirm again once we build per-station aggregates — spatial redistribution can still differ by month even when the citywide mean does not.
