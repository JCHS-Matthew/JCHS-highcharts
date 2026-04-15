# legacy/

Byte-exact snapshot of the JCHS-Highcharts plugin files currently hosted on S3
and loaded by every JCHS interactive chart/map published from ~2019 onward.

**Do not edit these files to match the repo's `src/` tree.** The point of this
directory is to preserve what is actually running in production, independently
of any in-flight work happening in `src/`. CRLF line endings are intentional
and are pinned via `.gitattributes` (`legacy/** -text`).

## Snapshot provenance

Files were pulled on 2026-04-14 from:

| Local path                             | Source URL                                                                                 |
| -------------------------------------- | ------------------------------------------------------------------------------------------ |
| `legacy/src/js/JCHS-highcharts.js`     | `https://s3.amazonaws.com/jchs-app-source-data/JCHS-highchartrs/src/js/JCHS-highcharts.js` |
| `legacy/src/js/JCHS-highcharts--map.js`| `https://s3.amazonaws.com/jchs-app-source-data/JCHS-highchartrs/src/js/JCHS-highcharts--map.js` |
| `legacy/src/css/JCHS-highcharts.css`   | `https://s3.amazonaws.com/jchs-app-source-data/JCHS-highchartrs/src/css/JCHS-highcharts.css` |

Note the bucket path contains a typo (`highchartrs`, not `highcharts`). It is
load-bearing — existing interactives hard-code this path and we should not
"fix" it.

SHA-256 of the initial snapshot (before any edits in this directory):

```
16f438d0a11d1571df02030c3aeb1c71d483972ddec24d56ecd16a3a4879ed2e  legacy/src/js/JCHS-highcharts.js
5a143b236b83ac623bf49d9bb35afc7b3e3da904485f23ba94cc167b584ffe13  legacy/src/js/JCHS-highcharts--map.js
30b7daf2d62b9a54c1beafd80329d344e3cb0fec39de628836e3146c11d2f7a3  legacy/src/css/JCHS-highcharts.css
```

## Related S3 assets (not mirrored here)

GeoJSON shapefiles consumed by map interactives live in a separate bucket:

- `https://harvard-jchs.s3.amazonaws.com/interactive-tools/geojson/us_cbsas.geojson`
- `https://harvard-jchs.s3.amazonaws.com/interactive-tools/geojson/us_states_simplified_highcharts.geojson`

Per-interactive `script.js` / `style.css` bundles live under
`https://harvard-jchs.s3.us-east-1.amazonaws.com/interactive-tools/<section>/<year>/<slug>/dist/`.

## How production loads this code

Every interactive's HTML loads (via script tags):

```
code.jquery.com/jquery-3.1.1.min.js
code.highcharts.com/6.2.0/js/highcharts.js
code.highcharts.com/maps/6.2.0/js/modules/map.js
code.highcharts.com/6.2.0/js/modules/exporting.js
<the two legacy/src/js/ files above>
```

and its `style.css` `@import`s `legacy/src/css/JCHS-highcharts.css`.

Highcharts is pinned to **6.2.0** (released August 2018). jQuery is load-bearing
inside the plugin (`createSearchBoxes`, modal init, `$.get` calls).

## Divergence from `src/`

At the moment this snapshot was taken, `legacy/` and the repo's `src/` tree
had drifted from each other in both directions:

**Only in `legacy/` (S3 has, repo does not):**
- `JCHS-highcharts.js`: `logoURL` switched `http://` → `https://`
- `JCHS-highcharts.js`: `numFormat` rewritten (~50 lines) to fix a bug where
  the repo's one-liner `H.numberFormat(n, -1, '.', ',')` didn't preserve input
  decimals as documented. The S3 version defaults to "max 2 decimals" for
  bare `numFormat(x)` calls.
- `JCHS-highcharts.js`: the modal init block (`$('.JCHS-chart__modal')...`)
  was moved into the main file.
- CSS: minor whitespace/indentation changes; some comments reformatted.

**Only in `src/` (repo has, S3 does not):**
- `JCHS-highcharts--map.js`: explicit `event` parameter on the map point
  click handler (commits `c7db5dd` + `e472935`). Without this, the handler
  relies on `window.event`, which is an IE-era global Firefox never
  implemented. **Production maps are currently broken in Firefox.**
- `JCHS-highcharts--map.js`: `H.pick(..., '')` fallback on GEOID lookup.
- `JCHS-highcharts--map.js`: has the modal init block (before the S3 move).
- CSS: a `.highcharts-legend-item span { color: #000; }` rule that does not
  exist on S3.

The Firefox fix is applied to `legacy/` in a follow-up commit so that this
directory reflects the *intended* v1 of the plugin, not the accidentally
broken-in-Firefox copy that currently lives on the bucket. **The live S3
files have NOT been updated** — any re-upload is a separate conversation
with the team that owns the bucket.
