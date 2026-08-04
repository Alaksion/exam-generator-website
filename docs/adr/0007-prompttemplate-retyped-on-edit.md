# ~~promptTemplate is retyped in full on every certification edit~~ (superseded)

> **Superseded**: `config.promptTemplate` was removed from the certification API (`POST`/`PUT /v1/certifications`), along with `config.modelId` and the `version` field. The problem this ADR addressed (an edit form with no previous `promptTemplate` value to pre-fill) no longer exists, so the decision is vacated. See the current `CertificationConfig`/`CertificationConfigInput` schema in `openapi.yaml`.

## Original decision (no longer applies)

`config.promptTemplate` was required on both `POST /v1/certifications` and `PUT /v1/certifications/{id}`, but no read endpoint ever returned it — `PublicCertificationConfig` stripped it from every response. This meant the Certification management edit form had no prior value to pre-fill: the admin had to retype the entire prompt template from scratch every time they edited any field on a certification, or the `PUT` request failed validation.

We chose to show this field blank on edit with an explicit warning, rather than caching the last-typed value in browser storage keyed by certification id. A client-side cache would work on the same browser/device but silently fail (falling back to blank) on any other browser, device, or after clearing storage — which is worse than a consistently blank field, since it creates an intermittent trap rather than an obvious one. The trade-off we accepted was that every edit to a certification required retyping a potentially long prompt template in full, even to change an unrelated field like `name` or `isActive`.
