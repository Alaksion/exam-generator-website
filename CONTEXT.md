# Mock Exams Website

Domain language for the React web app that consumes the `exam-generator` backend API.

## Language

**ApiKey**:
The shared backend secret that a user enters once and is sent in the `x-api-key` header on every API request. The same key is used by all users of a given deployment.
_Avoid_: API key, token, secret.

**Certification**:
A catalog entry describing an exam type that can be generated, e.g. `AWS Certified Cloud Practitioner`.
_Avoid_: Course, exam type.

**Catalog**:
The list of active certifications (`isActive: true`) available for generating an Exam. The backend returns the full `GET /v1/certifications` catalog; the app filters by `isActive`.
_Avoid_: Course, exam type, certification list.

**Certification management**:
The screens for creating and editing certifications (`POST`/`PUT /v1/certifications`), distinct from the Catalog. Deactivating a certification (`isActive: false`) removes it from the Catalog with no way back to it in the UI, since there is no `DELETE` endpoint for certifications and the mgmt list offers no inactive filter.
_Avoid_: Admin, admin panel.

**Exam**:
A generated, immutable practice exam belonging to a single certification.
_Avoid_: Test, quiz, assessment.

**ExamPlan**:
The blueprinted composition of an Exam before generation — question count, difficulty split, and domain/topic breakdown. Derived from a Certification's config and shown on the Generate page as weights plus approximate question counts, since the actual breakdown is decided during generation.
_Avoid_: Blueprint, composition, config.

**Generate** (the page):
The certification detail and confirmation screen (route `/certifications/:id`) reached by tapping a Certification in the Catalog. It shows the Certification's ExamPlan and a CTA to confirm exam generation. Confirm is blocked if the certification is inactive.
_Avoid_: Generate page, detail page, plan page, exam-generate.

**Readiness notification**:
An out-of-band notification that tells the user an Exam is READY. Not yet implemented by the backend (on the roadmap); the Generate-confirm status fallback screen never polls or refreshes status.
_Avoid_: Notification (unqualified), alert, push.

**ExamStatus**:
The lifecycle state of an exam: `GENERATING`, `READY`, or `FAILED`.
_Avoid_: Status (unqualified), state.

**History**:
The global list of all ready exams, fetched from `GET /v1/exams`. Not personal to a user in this MVP.
_Avoid_: Library, My exams, Shared exams.

**Quiz**:
The in-progress view of an Attempt where the user selects answers one question at a time.
_Avoid_: Exam view, question view.

**Review**:
The post-submission view of an Attempt, showing the Score, correct answers, and explanations.
_Avoid_: Results page, answer key.

**Question**:
A single multiple-choice item belonging to an exam.
_Avoid_: Item, prompt.

**Score**:
The percentage of questions answered correctly in an Attempt.
_Avoid_: Grade, result.

**Breakdown**:
A grouping of an Attempt's Score by Question domain, used for targeted study.
_Avoid_: Category breakdown, domain analysis.

**AnswerOption**:
One of the possible answers to a question. Exactly one option per question is marked as correct.
_Avoid_: Choice, answer, option (unqualified).

**Attempt**:
The user's set of selected answers for an exam, scored by the web app.
_Avoid_: Submission, response.

**Download**:
A time-limited presigned URL to an exam's PDF.
_Avoid_: PDF link, file URL.
