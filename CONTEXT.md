# Mock Exams Website

Domain language for the React web app that consumes the `exam-generator` backend API.

## Language

## Identity & authorization

**User**:
The authenticated entity that uses the app, identified by its Cognito `sub`. The backend resolves the caller from the ID token in the `Authorization: Bearer` header and scopes data (notably exams) to the User through their `sub`.
_Avoid_: Account, member, person.

**Role**:
The authorization level a User holds: `customer` or `admin`. Exposed by `GET /v1/me` and used to drive role-aware UI; the backend still enforces role with `403` regardless of the UI.
_Avoid_: Permission, access level, tier.

**Customer**:
A User with the `customer` role — the normal end-user who browses the Catalog and takes Exams.
_Avoid_: Client, user (where the role matters).

**Admin**:
A User with the `admin` role, who additionally manages Certifications.
_Avoid_: Moderator, superuser, manager.

**Session**:
The User's signed-in state, carried as a Cognito ID token sent as a `Bearer` header. The `ID`/`Access` tokens live only in memory; Amplify v6 owns token refresh from its own persisted storage, so a reload (or a new tab) restores the ID/Access tokens via `fetchAuthSession({ forceRefresh })`, and a `localStorage` marker records that a session existed so the app can skip the login prompt across window closes. The app treats the Session as live while `/v1/me` succeeds; on `401` it refreshes then re-tries, and on failure forces a re-login.
_Avoid_: Login state, auth, session token.

**Sign out**:
The action that ends the User's Session: it clears the in-memory tokens and the `localStorage` marker and returns the User to the login screen. Local only — it does not call a Cognito global-signout endpoint in this MVP.
_Avoid_: Log out, logout, disconnect.

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
The list of the signed-in User's own ready exams, fetched from `GET /v1/exams` and scoped to the caller. Personal to each User, not shared.
_Avoid_: Library, My exams, Shared exams, Global history.

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

**Topic**:
A discrete subject area within a Domain of a Certification's config, e.g. `Amazon S3`. Named and non-empty, but the name alone does not define what the Topic covers — that is the job of its Topic Context.
_Avoid_: Subject, module, unit.

**Topic Context**:
The free-form prose (20–1500 characters, trimmed) describing what a Topic actually covers. Required for every Topic on create and update, returned by the Certification API on every response, and used to scope the LLM prompt during Exam generation. Not present on any Exam artifact.
_Avoid_: description (ambiguous — already the Certification-level field), notes, topic summary.
