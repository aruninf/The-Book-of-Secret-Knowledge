# AGENTS.md

Docs-curation repo. The product is `README.md` (~4400 lines); plus a best-of
web viewer in `web/` (Vite + React, deployed to GitHub Pages).

## Structure

- `README.md` — the entire book: TOC + chapters of curated links. Edit here.
- `web/` — best-of browser: search/filter over curated picks in `web/src/data.js`.
  Source of truth for links stays `README.md`; `data.js` is a hand-picked shortcut.
- `static/img/` — README preview image only.
- `.github/CONTRIBUTING.md` — PR rules. `.github/workflows/deploy-pages.yml` deploys `web/`.

## Editing `README.md`

- Match the existing entry format exactly: inline HTML inside `<p>` blocks:
  `&nbsp;&nbsp; <a href="URL"><b>Name</b></a> - description.<br>`
- Keep chapter/section headings and `[TOC]` backlinks as-is; new entries go in the correct existing subsection, not a new top-level chapter.
- Bar is "good quality stuff only" (README Contributing section) — no link dumps.
- URLs marked `*` are temporarily unavailable: do not delete without confirming permanently expired.
- Markdown + inline HTML only. No scripts, no generated files.

## Verification

- `README.md` edits: no test/build/lint. Verify by previewing Markdown and checking link placement.
- `web/` app: `cd web && npm ci && npm run build`. Deploys automatically on push to `master` (Pages).
- Broken-link check (from `.github/CONTRIBUTING.md`):
  `for i in $(sed -n 's/.*href="\([^"]*\).*/\1/p' README.md | grep -v "^#"); do _rcode=$(curl -s -o /dev/null -w "%{http_code}" "$i"); if [[ "$_rcode" != "2"* ]]; then echo " -> $i - $_rcode"; fi; done`
- Expect some non-2xx hits (redirects, bot-blocking); only act on confirmed-dead links per the `*` rule above.

## Commits / PRs

- Base PRs on `main`.
- All commits require a `signed-off-by` trailer (see `.github/CONTRIBUTING.md` for the `prepare-commit-msg` hook snippet).
- PR description: one line, plus problem/solution explanation.
