# Per-user Cognito identity replaces the shared API key; History becomes per-user

The app moves from a single shared `x-api-key` gate to per-user Cognito identity: the browser drives SRP login against Cognito, sends the ID token as `Authorization: Bearer`, resolves the caller via `GET /v1/me` (revealing `role`: `customer`/`admin`), and scopes exams to the caller's `sub`. Because the backend now scopes `GET /v1/exams` and `DELETE /v1/exams/{id}` to the owner, History is no longer global and shared — it shows only the signed-in User's own exams, and Delete applies only to exams they own.

Status: accepted; supersedes ADR 0001 and ADR 0002.

Considered options: keeping the shared key (operationally simple, trusted-small-audience) vs. per-user identity (required once the app is public or multi-tenant, enables ownership and roles). We chose per-user identity because 0002 explicitly forecast needing exactly this before per-user scoping was safe.

Consequences: the login (SRP email/password) UI is pulled into this slice; signup, forgot-password, and Google/Apple social remain deferred and land later against the same Cognito pool. Tokens live in memory (ID/Access) with only the RefreshToken in `sessionStorage`; on `401` the app refreshes once and retries, then forces re-login. Admin capabilities are gated in the UI (nav + route guard); the backend enforces roles with `403` regardless of the UI.
