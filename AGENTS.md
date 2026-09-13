# Antigravity & Hermes — Unified Multi-Agent Architecture

This workspace operates under a unified two-agent collaborative system pairing **Google Antigravity** and **Nous Research Hermes Agent** to support artist **Taymah Hendi** and her release **"Zero To 40"**.

---

## 1. Agent Roles & Specialization

| Dimension | **Antigravity** (Lead Architect & Pair Programmer) | **Hermes Agent** (Autonomous Operations & Growth Engine) |
| :--- | :--- | :--- |
| **Primary Focus** | User interaction, UI/UX, code generation, deployments, pair programming. | Background automation, 10K streams growth engine, long-running agent tasks. |
| **Runtime** | Antigravity IDE / Advanced Agentic Coding | Python 3.11 (`%LOCALAPPDATA%\hermes`), Portable Git, Node 22, OpenCode Zen. |
| **Core Responsibilities** | - Website design & styling (`index.html`, `growth/index.html`)<br>- GitHub Pages & Cloudflare deployments<br>- Human checkpoint reviews & UI walkthroughs | - Pre-Save velocity & Release Radar indexing<br>- Mailchimp 72 VIP DJ service sync<br>- Spotify curator pitching & TikTok sound hooks<br>- Social Content Studio & Pitch Command Center automation<br>- Continuous learning & memory loops |

---

## 2. Shared Project Context

* **Artist**: Taymah Hendi (UK Singer-Songwriter)
* **Active Single**: "Zero To 40" (Genre: Dancehall / R&B / Afro-Fusion)
* **Master Assets**:
  - Full Master: `assets/zero-to-40.mp3` (320kbps MP3)
  - 30s Preview: `assets/zero-to-40-preview.mp3`
  - Artwork: `assets/cover-art.jpg`
* **Official YouTube**: `https://www.youtube.com/@TAYMAHHENDI`
* **Live Site**: `https://tonytouch.github.io/taymahhendi-site/`
* **Growth Control Engine**: LOCAL-ONLY — launch with `scripts/start-growth-dashboard.cmd` (serves 127.0.0.1:8240). Removed from the public internet 2026-09-13; never re-publish `growth/*`
* **Mailchimp Audience**: `7d217c5c74` (us10 datacenter, 72 VIP DJs & tastemakers)
* **Track Catalog & Curator CRM**: `growth/catalog.json` (Zero To 40 seeded), `growth/curators.json` (20 curators across Groover, DailyPlaylists, SubmitHub, Spotify editorial & direct email)
* **Secrets policy**: API keys are read from the environment (`GEMINI_API_KEY`, `MAILCHIMP_API_KEY`, `GITHUB_TOKEN`) — never hardcoded in scripts
* **Artist Access is LOCAL-ONLY (2026-09-13, owner decision)**: the growth dashboard is no longer published anywhere. `dist/growth/` is deleted (Cloudflare Pages publishes `dist/`), `push-growth-github.ps1` no longer lists growth files (with a hard guard that blocks them), and `take-growth-offline.ps1` purges the already-published `growth/` copies from the GitHub repo. To use the dashboard: `scripts/start-growth-dashboard.cmd` (or `.ps1`) — serves `127.0.0.1:8240` and opens the login page; nothing leaves this PC. The login still verifies a SHA-256 hash (`PASSWORD_HASH` const, plaintext nowhere in the repo); change it with `python scripts/set_growth_password.py "newpass" --apply`. Engine, cron, digests, and Telegram delivery are unaffected — they run locally via Hermes. Never re-add `growth/*` or `dist/growth/*` to any deploy; `verify-live-pages.ps1` / `check-live-login.ps1` FAIL if growth pages ever reappear online.

---

## 3. Two-Way Execution Protocol

1. **Antigravity to Hermes**:
   - Run Hermes with Gemini Pro (`gemini-3.1-pro-preview`):
     ```powershell
     .\hermes-pro.ps1 -z "<TASK>"
     ```
   - Run Hermes with Gemini 3.8 Flash (`gemini-3.8-flash`):
     ```powershell
     .\hermes.ps1 -z "<TASK>"
     ```
   - Switch Hermes default model:
     ```powershell
     & "C:\Users\tony\AppData\Local\hermes\hermes-agent\venv\Scripts\python.exe" scripts\set_gemini_pro.py
     & "C:\Users\tony\AppData\Local\hermes\hermes-agent\venv\Scripts\python.exe" scripts\set_gemini_flash.py
     ```
   - Programmatic Python bridge:
     ```python
     from scripts.hermes_bridge import run_hermes_task, GEMINI_PRO, GEMINI_FLASH
     result = run_hermes_task("Research dancehall DJs in London", model=GEMINI_PRO)
     ```
   - Or execute the growth engine bridge (now also runs the Social Content Engine + Playlist Pitch Agent):
     ```powershell
     & "C:\Users\tony\AppData\Local\hermes\hermes-agent\venv\Scripts\python.exe" "scripts\hermes_growth_engine.py"
     ```
   - Or run the new engines directly:
     ```powershell
     & "C:\Users\tony\AppData\Local\hermes\hermes-agent\venv\Scripts\python.exe" "scripts\social_content_engine.py" --dry-run
     & "C:\Users\tony\AppData\Local\hermes\hermes-agent\venv\Scripts\python.exe" "scripts\playlist_pitch_agent.py" --report
     ```

2. **Hermes to Antigravity**:
   - Hermes persists campaign state, runs, and approval items to `growth/` artifacts.
   - Any external pitch, broadcast submission, or mass email requires human checkpoint approval before dispatch.
   - Antigravity surfaces pending approvals to the artist in the dashboard.

---

## 4. Autonomous Engines (added 2026-09)

### Social Content Studio (`scripts/social_content_engine.py`)
Generates content packs for every active track in `growth/catalog.json` across TikTok, IG Reels, YT Shorts, X, Story CTA and Spotify Canvas. Templates run offline; with `GEMINI_API_KEY` set, drafts are enriched with Gemini hook variations. Writes `growth/content-calendar.json` (posting queue) and `growth/content-history.json` (run log). The dashboard's Social Content Studio mirrors the same engine in-browser with localStorage state.

### Playlist Pitch Agent (`scripts/playlist_pitch_agent.py`)
Builds personalized submission kits for all 20 curators in `growth/curators.json`, per platform (Groover briefs, DailyPlaylists submissions, SubmitHub messages, ≤500-char Spotify editorial pitches, direct-email letters). Kits park in `growth/pitch-dispatch-queue.json` with status `pending_approval`; only kits the operator flips to `approved` are written as ready-to-paste briefs into `growth/dispatch-outbox/` on `--dispatch`. **No automated submission ever occurs without human approval.**

### Scheduled Automation (Hermes cron, added 2026-09-12)
- Job **"Taymah Growth Daily"** (`hermes cron list` — id `b1b98bbdb5c7`): runs daily at **09:00 UTC (10:00 London)** via the gateway scheduler, `--no-agent` mode (no LLM cost — pure script run).
- It executes `~/.hermes/scripts/growth_daily_run.sh` (Hermes home: `C:/Users/tony/AppData/Local/hermes/scripts/`), which runs `scripts/growth_daily_run.py` from the repo.
- Each run: generates content packs (templates + Gemini enrichment), rebuilds/refreshes curator kits, collects due follow-ups, appends the campaign-tracker rollup, then delivers a digest to **Telegram** (stdout = digest; diagnostics to stderr). Digests also persist to `growth/digests/digest-YYYY-MM-DD.{md,json}` + `latest.md`.
- **Weekly playlist refresh** (Mondays, or `--refresh` to force): `scripts/refresh_playlists.py` re-scans the Soundplate reggae-dancehall + R&B pages and the SubmitLink catalog, genre-filters for the Zero To 40 lane (reggaeton explicitly excluded), dedupes by fingerprint, and appends new open playlists to `growth/curators.json` (max 5 per source per run, tagged `new_from_refresh`). Full finds land in `growth/playlist-refresh-history.json`. Self-test: `python scripts/refresh_playlists.py --selftest`.
- **Campaign tracker**: `scripts/campaign_tracker.py` logs every dispatched pitch with cost, curator response, and streams, then computes cost-per-add per curator. Kits marked submitted/added/declined in the dashboard auto-log. CLI: `--add --curator cur-00X --cost 2`, `--response sub-00X --status added`, `--streams sub-00X --value N`, `--report`. Data: `growth/campaign-log.json`; digest carries the blended rollup (spend, adds, reply rate, cost/add).
- The orchestrator loads `hermes/.env` + workspace `.env` itself, so scheduled runs always have keys regardless of shell context.
- The posting calendar self-heals: past-dated posts drop, fresh drafts slot under a 4/day cap (`--max-per-day`), leftovers stay as prunable unscheduled drafts.
- Useful commands: `hermes cron run b1b98bbdb5c7` (fire now), `hermes cron runs b1b98bbdb5c7` (history), `hermes cron pause/resume b1b98bbdb5c7`, `hermes cron doctor`.

### Dashboard sections
`growth/index.html` now includes: Track Catalog (multi-song foundation, add/remove tracks), Social Content Studio (generate → approve → schedule on a 7-day calendar), Pitch Command Center (kit generation, filters, copy/email/open actions, submitted → added/declined status with 7-day follow-up reminders), and Campaign Tracker (per-curator cost-per-add table, response/stream logging, manual submission logging). All state in localStorage (`th_catalog`, `th_curators_v2`, `th_content_packs`, `th_pitch_state`, `th_campaign_log`) with `catalog.json`/`curators.json` hydration on load. Loads and saves use matching keys — keep it that way.
