# trackman lab — 2026 College Statcast

A Baseball Savant–style site built from 2026 college TrackMan pitch data (Feb 13 – May 24, 2026: ~1.96M pitches, ~6.5k games).

Static site — no server. Everything under `data/` is precomputed JSON:

| File | Contents |
|---|---|
| `data/meta.json` | league averages, pitch-type averages, qualifiers, team names |
| `data/hitters.json`, `data/pitchers.json` | season leaderboards (90+ metrics, percentiles) |
| `data/arsenal.json`, `data/batter_types.json` | pitcher × pitch type and batter × pitch type |
| `data/teams.json` | team batting, pitching, outs above expected, framing, running game |
| `data/ps/<n>.json` | player detail pages, sharded by id hash (256 shards) |
| `data/g/<date>.json` | box scores and PA-by-PA game feeds per date |

Pages: home, leaderboards (Custom, Percentile Rankings, Expected Stats, Exit Velocity & Barrels, Batted Ball Profile, Plate Discipline, Swing/Take, Run Value, Standard, Pitch Arsenal Stats, Pitch Arsenals, Pitch Movement, Spin, Velocity, Release/Extension, Team OAE, Team Framing, Running Game, Team Batting/Pitching), player pages (Statcast / Standard / Splits / Game Logs with Overview, Breakdowns, Zones, Rolling views), team pages, scoreboard + game feeds, compare players, pitch movement visual and a glossary of methods.

Methods (expected stats, count-based run values, team OAE, framing) are documented on the in-site Glossary page.
