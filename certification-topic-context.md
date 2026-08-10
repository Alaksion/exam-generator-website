# Certification Catalog API — Topic Context contract change

**Audience:** Front-end repository maintainers.
**Scope:** The `Certification` create / update / read contract only. All other endpoints (Exams, generation, downloads) are **unchanged**.
**Backend reference:** issue #73 / PR #76 and issue #74 / PR #77 (ADR-0003). This is a **breaking change**.

---

## 1. What changed

Topics in a Certification's `config.domains[].topics` changed shape:

| | Old | New |
| --- | --- | --- |
| **Client request** (`create`/`update`) | topics submitted as bare strings: `"Amazon S3"` | objects: `{ "name": "Amazon S3", "context": "…" }` |
| **Stored / public response** | `{ "id", "name" }` | `{ "id", "name", "context" }` |

Each topic must now carry **Topic Context** — free-form prose describing what the topic actually covers. It is required, trimmed, and bounded to **20–1500 characters**.

The context is:
- required on **create** (`POST /v1/certifications`) and **update** (`PUT /v1/certifications/{id}`);
- returned in **all** public responses (list and detail);
- **not** present on any Exam artifact — generated exams, questions, and the PDF are untouched.

> A separate change scopes the LLM prompt to this context. It is prompt-side only and involves **no** FE-facing contract change.

---

## 2. Affected endpoints

| Method | Path | Change |
| --- | --- | --- |
| `POST` | `/v1/certifications` | Request body: topics now `{ name, context }` objects. |
| `GET` | `/v1/certifications` | Response `items[]` includes `config.domains[].topics[].context`. |
| `GET` | `/v1/certifications/{id}` | Response includes `config.domains[].topics[].context`. |
| `PUT` | `/v1/certifications/{id}` | Request body: topics now `{ name, context }` objects; response includes `context`. |

---

## 3. Contract shapes

### 3.1 Create request — `POST /v1/certifications`

```jsonc
{
  "provider": "aws",            // enum: aws | azure | gcp
  "code": "CLF-C02",            // string, min 1 — immutable after create
  "name": "AWS Certified Cloud Practitioner", // string, min 1
  "description": "Entry-level AWS certification.",
  "isActive": true,
  "config": {
    "questionCount": 10,                     // integer 1..100
    "difficultyDistribution": {
      "easy": 20, "medium": 50, "hard": 30   // non-negative ints, must sum to 100
    },
    "domains": [                             // at least 1
      {
        "name": "Cloud Concepts",            // string, min 1
        "weight": 50,                        // integer >= 1; all domain weights sum to 100
        "topics": [
          {
            "name": "Amazon S3",
            "context": "Amazon S3 is AWS persistent object storage. Covers the storage classes, bucket policies, versioning, lifecycle rules, static website hosting, and encryption at rest and in transit."
          }
        ]
      }
    ]
  }
}
```

### 3.2 Update request — `PUT /v1/certifications/{id}`

Same as create **minus** `provider` and `code`, which are immutable and must **not** be included (submitting them returns `400`).

The update replaces the whole `config` — the client sends the **full** config on every update. Any domain or topic omitted from the payload is dropped.

```jsonc
{
  "name": "AWS Certified Cloud Practitioner",
  "description": "Entry-level AWS certification.",
  "isActive": true,
  "config": {
    "questionCount": 10,
    "difficultyDistribution": { "easy": 20, "medium": 50, "hard": 30 },
    "domains": [
      {
        "name": "Cloud Concepts",
        "weight": 50,
        "topics": [
          { "name": "Amazon S3", "context": "…" },
          { "name": "Amazon EC2", "context": "…" }
        ]
      }
    ]
  }
}
```

### 3.3 Public response (create / list / detail / update)

The server returns the stored certification with **server-generated ids** for the certification, domains, and topics:

```jsonc
{
  "id": "11111111-1111-1111-1111-111111111111",
  "provider": "aws",
  "code": "CLF-C02",
  "name": "AWS Certified Cloud Practitioner",
  "description": "Entry-level AWS certification.",
  "isActive": true,
  "config": {
    "questionCount": 10,
    "difficultyDistribution": { "easy": 20, "medium": 50, "hard": 30 },
    "domains": [
      {
        "id": "22222222-2222-2222-2222-222222222222",
        "name": "Cloud Concepts",
        "weight": 50,
        "topics": [
          {
            "id": "33333333-3333-3333-3333-333333333333",
            "name": "Amazon S3",
            "context": "Amazon S3 is AWS persistent object storage. Covers the storage classes, bucket policies, versioning, lifecycle rules, static website hosting, and encryption at rest and in transit."
          }
        ]
      }
    ]
  }
}
```

`GET /v1/certifications` returns `{ "items": [ …Certification… ] }`.

---

## 4. Validation rules

### 4.1 Topic context — **new**

| Rule | Value |
| --- | --- |
| Required | yes — a topic without `context` is rejected |
| Type | string (objects/arrays/null rejected) |
| Trim | leading/trailing whitespace is stripped; a whitespace-only string is rejected as too short |
| Min length | **20** characters (after trim) |
| Max length | **1500** characters |
| Format | free-form prose — no structure enforced |

### 4.2 Unchanged rules

- `provider` ∈ `aws | azure | gcp`; `code` and `name` non-empty.
- `questionCount` integer 1–100.
- `difficultyDistribution.easy/medium/hard` non-negative integers summing to **100**.
- `domains` ≥ 1; `weight` integer ≥ 1; all domain weights sum to **100**.
- `topics[].name` non-empty.

### 4.3 Error format

Bad input returns `400` with the standard envelope:

```jsonc
{
  "error": "InvalidRequest",
  "message": "config.domains.0.topics.0.context: Required; config.domains.0.topics.1.context: String must contain at least 20 character(s)"
}
```

`message` is a `; `-separated list of `path: reason`. Paths are 0-indexed arrays joined with `.`. Common topic-context failures:

| Failed input | Path | Reason |
| --- | --- | --- |
| Topic sent as a bare string | `config.domains.0.topics.0` | `Expected string, received object` |
| `context` missing | `config.domains.0.topics.0.context` | `Required` |
| `context` < 20 chars (incl. whitespace-only) | `config.domains.0.topics.0.context` | `String must contain at least 20 character(s)` |
| `context` > 1500 chars | `config.domains.0.topics.0.context` | `String must contain at most 1500 character(s)` |
| `provider`/`code` in a PUT | — | `provider and code are immutable.`

---

## 5. Identity semantics on update (unchanged behavior, context now carried)

Topic/domain `id`s are server-managed. On `PUT`, the server relinks by **name**:

- **Matching topic name** in a domain → the stored **id is preserved** and the client-supplied `name` and `context` become authoritative.
- **New topic name** → receives a fresh id.
- **Renamed topic** → treated as delete + add (new id). The context does **not** silently follow a rename.

Same for domains: matching domain name → id preserved; renamed domain → new id.

---

## 6. Front-end migration notes

Concrete plan agreed with the front-end maintainers for the React web app. Topics are objects everywhere — there is no path that submits a bare-string topic.

1. **Types** — `src/lib/types.ts` retypes the request input: `DomainInput.topics` becomes `TopicInput[]` where `TopicInput = { name, context }`. The response-side `Topic` (returned by list/detail) gains a `context: string`. All `string[]` topic shapes are removed.
2. **Validation schema** — `src/lib/certification-schema.ts` validates each topic as `{ name, context }`: `name` non-empty and `context` **trimmed then bounded 20–1500**. The trim is enforced in the schema, so the parsed submit value carries a trimmed context and a whitespace-only context fails as too short. Invalid topics block submission (the submit button is disabled until the whole form parses).
3. **Topic editor** — the form's per-topic editor (in `DomainEditor`) shows a name field plus a context textarea with a **live character counter based on the trimmed length** (`{trimmed}/1500`) and flags out-of-range context inline. `topics` is built and submitted as `{ name, context }[]`.
4. **Round-trip guarantee** — the edit screen (`EditCertificationPage`) maps each response topic to `{ name, context }`, so the existing context is preserved through the GET→PUT round trip until the author changes it. No client code sends a bare-string array.
5. **Server 400s as toasts** — create/update mutations surface server-side `400 InvalidRequest` responses as error toasts (showing the server message) instead of failing silently.
6. **Reshape existing records / seed data** — every stored Certification record and the seed catalog must carry a valid context per topic (≥ 20 trimmed characters). In this repo the dev-time catalog lives in the msw mock server's seed (`src/mocks/handlers.ts`); it is reshaped with real context, and the mock validates context exactly as the backend does.
7. **Generated exams are unaffected** — no changes needed to anything that renders Exams, Questions, or the PDF.