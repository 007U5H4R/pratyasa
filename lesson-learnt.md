# Lessons learnt: Pratyasa site

> Sources: Obsidian `Pratyasa/build-ledger.md` (cited as ledger:line) and `Pratyasa/progress.md`, plus repo commits.
> Note: the repo root is the deploy root, so a lesson file at the root would be published. Consider keeping it out of the deployed output.

## Lessons

### L1 — overflow-x:hidden was hiding a real overflow
- **Situation:** Grid `min-width:auto` caused horizontal overflow, and `overflow-x:hidden` on body was masking it. (2f13f6f, ledger:84-88)
- **Decision/Outcome:** It was fixed with `minmax(0,1fr)` and `min-width:0`. The body hack was removed so that the overflow probe can catch regressions. (2f13f6f, ledger:84-88)
- **Lesson → Future Rule:** **Future Rule:** never hide overflow with `overflow-x:hidden` on body. Fix the element that overflows.

### L2 — A no-JS test proved nothing
- **Situation:** Chrome 151's new headless mode ignores `--disable-javascript`, so the earlier no-JS test was not valid. (ledger, "CORRECTION" section)
- **Decision/Outcome:** It was re-tested by serving a copy with the script tag removed. (ledger, "CORRECTION" section)
- **Lesson → Future Rule:** **Future Rule:** check that a test's precondition really holds. Disable JS by removing the script, not with a browser flag.

### L3 — The mobile nav scrolled with no affordance
- **Situation:** The mobile nav scrolled sideways and nothing showed that it could. (80e22c9, ledger:126)
- **Decision/Outcome:** The nav got its own row and a fade edge. (80e22c9)
- **Lesson → Future Rule:** **Future Rule:** any horizontally scrolling region needs a visible affordance.

### L4 — HTTP 200 doesn't mean the page is public
- **Situation:** Vercel team-scoped URLs return HTTP 200 but serve the Vercel login page. Only the alias is public. (ledger:135-137)
- **Decision/Outcome:** The check moved to the public alias and to the page content. Status codes alone would have given a false pass. (ledger:135-137)
- **Lesson → Future Rule:** **Future Rule:** verify a deploy by its content at the public URL, never by status code alone.

### L5 — Canonical and OG URLs pointed at a host that was never enabled
- **Situation:** The canonical and og URLs still pointed at a github.io URL that was never enabled, so every shared link would have unfurled with a 404 image. (7c708ac, ledger:139)
- **Decision/Outcome:** They were repointed to the live host, and OG was verified by fetching as the real crawler user agents. (7c708ac, ledger:140-144)
- **Lesson → Future Rule:** **Future Rule:** after any host change, regenerate the absolute canonical and OG URLs, and fetch them as the crawlers do.

### L6 — A public repo needs consent to publish personal details
- **Situation:** The deploy was held because a public repo would have published personal details. (ledger:103)
- **Decision/Outcome:** It went ahead only after explicit consent. (ledger:103)
- **Lesson → Future Rule:** **Future Rule:** check what personal data becomes public before making a repo or site public.

### L7 — The dev server can fake a JS bug
- **Situation:** `python3 -m http.server` dropped app.js under headless load, which looked like a JS bug. (progress.md:43)
- **Decision/Outcome:** It was switched to ThreadingHTTPServer. (progress.md:43)
- **Lesson → Future Rule:** **Future Rule:** use a threaded static server for automated browser tests. Rule out the test server before debugging the app.

### L8 — Code review is still worth running on a static site
- **Situation:** Code review produced 8 findings. (progress.md:45)
- **Decision/Outcome:** All of them were fixed. (progress.md:45)
- **Lesson → Future Rule:** **Future Rule:** don't skip review because a site is "only static".

## Reusable Rules for Future Projects
- Verify deploys by their public content, not status codes (L4).
- Verify that test preconditions really hold (L2).
- No overflow masking on body (L1).

## Candidate Global CLAUDE.md Improvements
- "Prove it against reality" could add: an HTTP 200 from a protected preview URL is not proof that the page is public (L4).
