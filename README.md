# BusyMAD

BiciMAD station availability over the day — interactive map with summer 2022 historical data.

Living spec: [SPEC.md](SPEC.md)

## What’s here

- **Interactive map** — Astro + MapLibre, 259 stations, hourly occupancy (Jun–Aug 2022)
- **Summer 2022 comparison chart** — [viz/summer2022.html](viz/summer2022.html)
- **GBFS collector** — builds our own hourly history from the live feed (for future all-year / live modes)

## Local development

```bash
npm install
npm run dev
# → http://127.0.0.1:4322/  (Spanish)
# → http://127.0.0.1:4322/en/  (English)
```

Landing demos (`public/demo/`) come from local captures in `media/` (gitignored). Re-encode after new recordings:

```bash
./scripts/encode-demo-media.sh
# → public/demo/hourly.gif + rating.png
```

Regenerate station aggregates from raw JSONL (includes Rating quintiles / cutoffs):

```bash
npm run data
# → public/data/stations_summer2022.json
#   meanOccupancy (06–23), percentile, rating per station; meta.ratingCutoffs at P20/P40/P60/P80
```

Build for production:

```bash
npm run build
npm run preview
```

## Install as app (Android WebAPK)

Chrome on Android can install a real **WebAPK** (clean icon in the app drawer, `standalone` without the browser bar) only over **HTTPS** — e.g. [https://busymad.dev](https://busymad.dev) or an HTTPS tunnel. Opening the site via `http://192.168.…` only creates a **shortcut** with a Chrome badge.

1. On the phone, open **https://busymad.dev** in **Chrome** (not Firefox — Firefox cannot mint WebAPKs).
2. When Chrome offers install (or the banner’s **Instalar** button appears), install it.
3. Delete any **old** home-screen icon that still has the Chrome logo badge, then open only the new app icon.
4. Optional checks: `chrome://webapk-list`, or remote DevTools → Application → Manifest + Service Workers.

Local `npm run preview` over HTTP on a LAN IP will not behave like Cursor’s installed app.

PWA tooling uses `@vite-pwa/astro` (Astro 7 needs `npm install --legacy-peer-deps` until the integration declares a peer for Astro 7).

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
# Paths in the plist already point at /Users/danielg/busymad and Homebrew python3
cp scripts/com.busymad.gbfs.plist ~/Library/LaunchAgents/
launchctl load ~/Library/LaunchAgents/com.busymad.gbfs.plist
# immediate test:
launchctl start com.busymad.gbfs
# or:
python3 scripts/collect_gbfs.py
```

Logs: `data/collected/launchd.out.log` / `launchd.err.log`

Unload later:

```bash
launchctl unload ~/Library/LaunchAgents/com.busymad.gbfs.plist
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

## License

Copyright © 2026 Daniel Vilela García.

BusyMAD (code, UI, design, documentation, and original visualizations) is licensed under [CC BY-NC-ND 4.0](https://creativecommons.org/licenses/by-nc-nd/4.0/): non-commercial use only, no derivatives, attribution required. See [LICENSE](LICENSE), [COPYRIGHT](COPYRIGHT), and [NOTICE](NOTICE).

BiciMAD / EMT / City of Madrid data and OpenStreetMap tiles are not covered by that licence. Data attribution: **Powered by EMT de Madrid** ([emtmadrid.es](https://www.emtmadrid.es)). EMT terms: [mobilitylabs.emtmadrid.es/sip/terms-of-use](https://mobilitylabs.emtmadrid.es/sip/terms-of-use).
