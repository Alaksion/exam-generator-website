# E2E tests use MSW and a mock server

End-to-end tests will run against a local mock server rather than a deployed instance of the backend API. We will use Mock Service Worker (MSW) for unit and component tests, and a simple HTTP mock server for Playwright E2E tests.

We chose this over testing against a real deployed backend because the mock server gives us deterministic, fast, and isolated tests that can run in CI without managing dev environments or API keys. The trade-off is that the mock must be kept in sync with the backend API contract; we will use the OpenAPI spec as the source of truth and update the mocks whenever the contract changes.
