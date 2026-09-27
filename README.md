# PMP Practice Lab

A buildless, browser-only practice engine for the July 2026 PMP examination content outline, with PMBOK Guide Eighth Edition context. No account, API key, database, analytics, or runtime dependency.

**Live app:** [teivovo.github.io/pmp-practice-lab](https://teivovo.github.io/pmp-practice-lab/)

## Run locally

Install Node.js if it is not already present, then run from this repository:

```sh
node pmp-practice/serve.cjs
```

Open http://127.0.0.1:4173. This local server only serves static files; all answers, grading, timers, and storage run in your browser. For saved progress, use HTTP/HTTPS rather than opening `index.html` as a `file://` URL.

## Practice modes

- **Study:** randomized or ordered by topic; filter by domain, topic, or format. Check each answer to see explanation, correct choices, encouragement, and guidance. A checked response is locked so the recorded score reflects the original answer.
- **Timed practice:** 80 seconds per selected question, pausable, with feedback after submission.
- **Full mock:** 180 unique questions, 240 minutes, two optional 10-minute breaks, and no explanations until final submission. The mock timer continues when the tab is closed or the learner leaves. Sections lock when submitted. Breaks end automatically after 10 minutes; leaving the page does not extend them.

The fixed bank contains **59 People / 74 Process / 47 Business Environment** items, rounding the official 33% / 41% / 26% weighting to 180. It uses 72 predictive and 108 agile/hybrid items, and covers all 26 ECO tasks. Repeated sessions reuse this bank in different orders; no questions are generated at runtime.

Six linked cases contain three questions each. The full mock places these 18 items first, followed by two sections of 81 independent items. **These section sizes are our simulation choice, not a PMI-published fixed allocation.** Unlike the official exam's 170 scored plus 10 unscored items, all 180 practice items receive equal weight. Multiple-response and matching items require an exact complete answer. This educational score is not PMI's psychometric scoring model or a pass prediction.

Formats: single response, multiple response, shared cases and exhibits, chart interpretation, matching, chart matching, SVG hotspots, and pull-down lists. Drag-and-drop matching has a keyboard/touch dropdown alternative. The visual exhibits are original SVG diagrams, not screenshots of PMI questions. Format proportions are not claimed to match undisclosed PMI proportions.

## Progress storage

Two first-party cookies store the current session and the eight most recent summary results. The current session is compactly encoded to stay below the 4 KB per-cookie limit, even with 180 answers. Cookies are path-scoped to the hosted project, use `SameSite=Strict`, use `Secure` over HTTPS, and expire after one year. Every answer and flag saves immediately, with periodic timer checkpoints.

The save indicator verifies cookie read-back. If the browser blocks cookies or storage fails, a warning appears and the session remains usable only in memory. Clearing site data or changing browser/profile loses the save. There is no cross-device synchronization. Use one tab per practice session. First-party cookies accompany static requests to your host; they are not processed by this app's server because it has no backend. Question content and answer keys are public client assets, so this is a learning tool rather than a secure assessment platform.

## Publish to GitHub Pages

1. Push this repository to your chosen GitHub repository, using the `main` or `master` branch.
2. In the repository, open **Settings → Pages → Build and deployment → Source** and select **GitHub Actions**.
3. Open **Actions → Publish PMP Practice Lab → Run workflow**, or push a new commit to `main` or `master`.
4. The completed deployment exposes the Pages URL, normally `https://USERNAME.github.io/REPOSITORY/`.

The included `.github/workflows/pages.yml` checks the bank and scoring and publishes only the six static app files. Relative asset URLs and cookie paths support a GitHub Pages project subdirectory. No build service or server-side processing is required. Alternatively, upload the six app files directly to any static host.

## Tests

```sh
node --test pmp-practice/tests/*.test.cjs
```

Tests cover bank uniqueness and coverage, exact scoring, linked-case grouping, filtered selection, full-session cookie size/round-trip, and saved-state validation.

The timer tests also cover time spent away from the page, break exclusion, break overrun, expiry, and paused practice. Browser checks verified wrong-answer guidance, selection limits, cookie restoration, matching via dropdowns, keyboard hotspots, both section locks and breaks, final-review-only behavior, and mobile layout. Drag-and-drop is implemented with native browser events; the automated browser interaction did not establish a successful pointer drag, so use the verified dropdown alternative if your browser does not support dragging. These checks validate the engine, not the exam difficulty of the authored content.

## Research and limitations

Research checked 27 September 2026 against these primary sources:

- [PMI: July 2026 PMP Exam Content Outline](https://www.pmi.org/-/media/pmi/documents/public/pdf/certifications/new-pmp-examination-content-outline-2026.pdf)
- [PMI: Updated PMP exam](https://www.pmi.org/certifications/project-management-pmp/new-exam)
- [PMI: PMBOK Guide, Eighth Edition](https://www.pmi.org/standards/pmbok)

The ECO, rather than PMBOK alone, defines the tested work. The latest guide's public overview identifies value, quality, accountable leadership, sustainability, empowered teams, and tailoring as important themes. We have not reproduced the guide or claimed page-level validation against its full copyrighted text.

All practice questions and rationales are original educational content. They imitate publicly described situational formats, not actual or recalled certification items. They have not undergone PMI-style psychometric calibration or independent review by a certified PMP trainer. For high-stakes preparation, use them alongside official materials. No affiliation, endorsement, exam-difficulty equivalence, or pass guarantee is implied. PMP and PMBOK are Project Management Institute trademarks.
