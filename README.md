# NTUT ECE Roadmap

A small personal credit tracker and semester planner. Plain HTML, CSS and JavaScript: no framework, build step, package install, server API, or database.

Open `index.html` directly, or serve the repository with `python3 -m http.server 8000`. GitHub Pages continues to serve `master` at https://tamako-yaki.github.io/ntut-roadmap/.

## Pages

- **修課紀錄**: all 44 course records from 113-1 through 114-2, grouped into collapsible semesters. Includes stages, course numbers/codes, EMI, zero-credit courses and withdrawals.
- **選課計劃**: existing future course selections and cross/free credits, with workload and projected totals.
- **學分狀況**: earned vs projected category totals, remaining gaps, and completed general-education courses.

## Architecture

| File | Responsibility |
| --- | --- |
| `index.html` | Page shell and dialogs |
| `assets/styles.css` | Responsive presentation |
| `data/transcripts.js` | Transcript course records and reported semester statistics |
| `data/plan.js` | Future course options and existing graduation targets |
| `assets/model.js` | Pure earned-credit and projection calculations |
| `assets/storage.js` | Local persistence and import validation |
| `assets/app.js` | Rendering and interaction |
| `tests/credits.test.cjs` | Transcript reconciliation, projections and imports |

Deferred classic scripts share a single `Roadmap` namespace. This deliberately keeps direct file opening working without a module server or bundler. Transcript facts, planning rules, calculations and UI are separate; there is one calculation path for summaries.

The original `ntut_roadmap.jsx` duplicated the application and depended on an environment-specific `window.storage` API. It is removed to avoid maintaining two implementations; it remains in Git history. React offers little benefit at this scope.

## Source of truth and limits

The supplied `113-1.pdf`, `113-2.pdf`, `114-1.pdf`, and `114-2.pdf` are the source for course names, numbers/codes, stages, required/elective/general-education flags, credits, grades, EMI and semester statistics. Original PDFs and personal identifiers are not included in this public repository. Source filenames and print dates are recorded in the data.

| Semester | Earned credits | Reported average |
| --- | ---: | ---: |
| 113-1 | 19 | 87.3 |
| 113-2 | 19 | 83.0 |
| 114-1 | 23 | 86.4 |
| 114-2 | 19 | 84.3 |
| Total | 80 | — |

W withdrawals earn zero credits. Numeric passing scores (60+) and P earn the course's credits. Zero-credit requirements remain visible. In 114-2, the transcript reports 19 enrolled credits as well as 19 earned credits, excluding the two W courses (6 credits). The old unsupported class/department rankings and cumulative average are no longer shown. Semester averages use the printed one-decimal figures, rather than reconstructing an official average from rounded data.

Graduation targets (28/63/21/20 = 132), course-to-bucket assignments and elective overflow recognition remain **existing planning assumptions**, not facts established by these transcripts. `bucket` is explicitly separate from transcript `type`. General-education courses total 10 earned credits and are already included in the common-required bucket. The transcripts do not establish their dimensions; the former unverified app-bug claim and dimension breakdown have been replaced with the actual course list. Future required courses are assumed to be passed in projections, never counted as earned history. This is a planning aid, not an official graduation audit.

To add a later transcript, append a semester to `data/transcripts.js`, retaining a distinct semester/course-number ID, and verify its sum against the reported earned credits. Reconcile the future plan at the same time so a completed semester is no longer projected. To change future course options or verified targets, edit `data/plan.js`.

## Saved plans

Selections remain local to the browser/device. Existing keys `ntut-roadmap-checked` and `ntut-roadmap-cross` and the version-1 JSON export format are preserved. Export/import moves selections between devices; it does not modify the transcript source records. Unknown stale course/semester IDs are ignored. Invalid imports are rejected before replacing the current plan. Cross/free inputs accept integers from 0 to 20. Storage failures show an export-backup message.

## Verification

Run `node --test tests/credits.test.cjs` (Node is only needed for tests). No npm dependencies are required. For UI changes, check history, planner, credit summary, saved-plan reload, export/import, and narrow-screen table scrolling.
