# Testing and evaluation

Use the root README to install dependencies, apply migrations and start both services. Run tests against isolated data. Keep prompts and bearer credentials out of shared logs.

## Automated checks

From the repository root, after installing the backend development requirements and frontend dependencies as described in the README, run:

```sh
(cd backend && .venv/bin/python -m pytest)
(cd frontend && npm test && npm run build)
(cd frontend && npm run test:e2e)
```

The build includes the TypeScript check. The browser suite starts a separate API and Vite server and uses an isolated SQLite database. It uses system Chromium when available. To install the Playwright-managed browser, run `npx playwright install chromium` from `frontend/`. An existing Chromium binary can be selected with `PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH`.

## Phase 1 verification

| Journey | Expected observation |
| --- | --- |
| Catalog | Open Explore, find Ooty, and check the place name, coordinates and reference source supplied by the API. A search with no matches yields an empty state. |
| Brief | Enter the Hyderabad–Ooty request, save it, reopen it and verify the original text. Check that a missing or incorrect credential prevents retrieval. |
| Database | Apply migrations to an empty database, repeat the upgrade, and read a saved brief after restarting the service with the same database. |
| Navigation | Move between the landing page, Explore and Planner using keyboard controls. Check visible focus and layout at phone and desktop widths. |
| Rendering | Try the globe with normal motion, reduced motion and unavailable WebGL. Search, navigation and planning should remain reachable. |
| Service outage | Disconnect the API, retry the affected action and check that the UI gives recoverable feedback. A failed write must not appear as a saved brief. |

## Later evaluation

For the four-day Hyderabad–Ooty case, compare the parsed state with the requested constraints. Verify every budget total from its line items and check activity durations against travel buffers. Compare the original and approved itinerary after a simulated rain disruption. Exercise missing credentials, provider timeouts and exhausted retries. Validate PDF content against the persisted itinerary.

For research runs, record the commit, model and parameters, provider or fixture versions, input, time, retry count, cost, failure category and output. Use identical requests and evidence for the graph and single-model baseline. Report denominators, per-case failures and observed durations so another evaluator can reproduce the comparison.
