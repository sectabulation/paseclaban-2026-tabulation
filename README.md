# PaSEClaban 2026 — Tabulation Site (Draft v3)

Surigao Education Center Intramurals, October 27–30, 2026.

## Access
- Site opens in **view mode** (Overall · Per Event · Breakdown).
- **Admin sign-in:** click the SEC logo (top-left).
- Username `admin`; password stored only in Apps Script Script Properties (`EDITOR_PASSWORD`).

## Scoring (Guidelines on the Overall Tabulation of Points)
- Points per rank: Category A / B / C table, ranks 1–10 (Art. II).
- Each division (Men's/Women's/Mixed) = separate event.
- Single-representative: points by official rank (Art. III).
- Multi-representative: placement points per sub-event summed, teams re-ranked, awarded by new rank (Art. IV).
- Ties: shared points of occupied ranks, 2 decimals (Art. VI §1).
- Default: 0 points. DQ: 0 points, rank vacant (Art. VI §3–4).
- Only events marked **Final** count. Departments tabulated separately.
- Events seeded from Annex A (27 College–HS, 19 Elementary).
- Multi-representative input: admin adds/renames/removes sub-events (Singles, Doubles, each swimming event) or entrants (Chess players, candidates) in the Results dialog. Each cell: rank, Default, or DQ.
  - Sub-event ranking (Badminton, Table Tennis, Swimming): each sub-event ranked separately.
  - Single-list ranking (Chess, Little Mr./Ms.): all entrants ranked in one list.
  - Ties inside a sub-event or list share placement points.

## Files
- `index.html` — whole site.
- `assets/` — SEC logo, team logos.
- `apps-script/Code.gs` — Google Sheets backend.

## Backend (live)
- Google Sheet: **PaSEClaban 2026 Tabulation** (rbresullar@sec.edu.ph) — tabs Data / Standings / Results.
- Apps Script project: **PaSEClaban 2026 Tabulation API**, Web App (Execute as Me, Access Anyone).
- After editing `Code.gs`: Deploy → Manage deployments → Edit → Version: New version (keeps the same URL).

## Go live (reference)
1. Google Sheet → Extensions → Apps Script → paste `Code.gs`.
2. Script Properties → `EDITOR_PASSWORD`.
3. Deploy → Web app → Execute as Me · Access Anyone → copy URL.
4. Set `CONFIG.API_URL` in `index.html`.
5. Push to GitHub, enable Pages.
