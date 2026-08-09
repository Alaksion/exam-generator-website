# Exam status fallback is a static screen; readiness is surfaced passively

The screen at `/exams/:id/status` is a static "generation takes a while" interstitial. It performs no status polling, no status fetch, no READY redirect, and no failure detection. A READY exam is reached by the "Start exam" action in History; letting the user know their exam finished is deferred to an out-of-band readiness notification (backend feature, on the roadmap).

- **Removed**: the polling loop in `useExamStatus` (exponential backoff `refetchInterval`), and with it the status screen's auto-redirect to `/exams/:id` on READY, its FAILED handling, and its inline "Generate new exam" retry.
- **Kept**: the status screen as a static fallback describing what the user just did (certification name passed via `location.state`, generically if absent).
- **Added**: "Start exam" opens a READY exam from History (`/exams/:id`).
- **Deferred**: real readiness notification from the backend, which has no notification path today; tracked as backend backlog.

We chose this over keeping interval polling because exam generation is long-running and users will leave the page; an idle polling client both wastes requests and can only notify the user while they happen to be looking. React in the browser cannot push in-app; the honest contract is that readiness is learned passively (History list shows status, window-focus refetch reconnects a returning tab) until the backend ships a real notification path. The status screen's job is reduced to setting the expectation that generation takes a while.

If the backend notification path ships, a future change can make that notification land the user on their ready exam directly; the static screen and History "Start exam" entry remain the fallbacks.