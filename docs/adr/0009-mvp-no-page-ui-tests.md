# MVP avoids component-level UI tests for pages

For the MVP, we will not write React Testing Library component tests for pages (route-level components that compose UI and server state). Pages are covered by unit tests at their pure seams and by Playwright E2E tests; we deliberately skip RTL page tests in this phase.

- **Kept**: unit tests for pure logic (e.g. `src/lib/api.test.ts`, the api client and schema validation).
- **Kept**: E2E tests via Playwright against a mock server (see ADR 0006) that exercise full page flows.
- **Skipped for MVP**: RTL component tests that render a whole page (e.g. `NewCertificationPage`, list pages, error-boundary-on-mutation flows).

We chose this over testing every page in RTL because the MVP's page behaviour is dominated by glue (routing, TanStack Query wiring, form assembly) that changes frequently while the domain logic it calls is better tested directly at its seam. E2E tests already cover the user-facing page flows end to end, so the marginal reliability gained by per-page RTL tests does not justify their maintenance cost at this stage.

If a page accumulates non-trivial behaviour that lives nowhere else (something neither a pure unit test nor an E2E flow cleanly covers), we can reintroduce a targeted RTL test for just that page.
