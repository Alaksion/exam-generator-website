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
The list of active certifications available for generating an Exam.
_Avoid_: Certification list, course catalog.

**Exam**:
A generated, immutable practice exam belonging to a single certification.
_Avoid_: Test, quiz, assessment.

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
