# Mock Exams Website

The React + TypeScript frontend for a guided mock-exam generator. It lets users
browse a catalog of IT certifications (AWS, Azure, GCP), generate practice
exams, take them, and review their score and per-domain breakdown. Built with
**Vite**, **React 19**, **Tailwind CSS 4**, and **AWS Amplify (Cognito)** for
auth.

The app is a client to the serverless `exam-generator` backend — it does no
exam generation itself.

## Related repositories

- [**exam-generator**](https://github.com/Alaksion/exam-generator) — the
  serverless backend (API Gateway + Lambda + DynamoDB + Bedrock) that exposes
  the REST API and the Cognito user pool this app signs into. Its CloudFormation
  stack outputs (`ApiUrl`, `UserPoolId`, `UserPoolClientId`, `AuthDomain`) are
  what you copy into `.env`.
- [**exam-generator-shared-infra**](https://github.com/Alaksion/exam-generator-shared-infra)
  — shared AWS infrastructure. It hosts the **GitHub OIDC provider** that the
  CI/CD deploy workflow in this repo assumes a role through.

## Architecture

A classic Vite SPA. Auth (sign-up, sign-in, social sign-in, session refresh) is
driven directly against **Cognito** by the client (see ADR 0004); all data calls
go to the backend API with a Cognito ID token as a `Bearer` header (see
`src/lib/api.ts`). The domain vocabulary is documented in
[`CONTEXT.md`](./CONTEXT.md).

## Prerequisites

- [Node.js 22](https://nodejs.org/) (the CI pipeline runs on Node 22)
- `npm`

## Getting started

### 1. Install dependencies

```bash
npm install
```

### 2. Configure environment variables

Copy the example file and fill in the values:

```bash
cp .env.example .env
```

The app reads its configuration from Vite env vars at **build time**. Without
the Cognito values, the app runs but sign-in flows won't work; without
`VITE_API_BASE`, API calls hit the current origin and 404.

| Variable                     | Required | Description                                                                                    |
| ---------------------------- | -------- | ---------------------------------------------------------------------------------------------- |
| `VITE_API_BASE`              | Yes      | Base URL for all backend calls, e.g. `https://xxxx.execute-api.us-east-1.amazonaws.com/dev`     |
| `VITE_USER_POOL_ID`          | Yes      | Cognito user pool id (from the backend stack's `UserPoolId` output)                             |
| `VITE_USER_POOL_CLIENT_ID`   | Yes      | Cognito app client id (from the backend stack's `UserPoolClientId` output)                      |
| `VITE_USER_POOL_DOMAIN`      | No       | Cognito Hosted UI domain (from the backend stack's `AuthDomain` output); enables social sign-in |
| `VITE_OAUTH_CALLBACK_PATH`   | No       | Browser route receiving the OAuth code (defaults to `/auth/callback`)                           |
| `VITE_SOCIAL_GOOGLE_ENABLED` | No       | Toggle Google sign-in (`true`/`false`); only effective when `VITE_USER_POOL_DOMAIN` is set       |
| `VITE_SOCIAL_APPLE_ENABLED`  | No       | Toggle Apple sign-in (`true`/`false`); only effective when `VITE_USER_POOL_DOMAIN` is set        |

### 3. Run the dev server

```bash
npm run dev
```

Opens the app at `http://localhost:5173` (Vite defaults). The backend and its
Cognito pool must be reachable — see the [backend repo](https://github.com/Alaksion/exam-generator)
to deploy or emulate one.

## Scripts

| Command             | Description                              |
| ------------------- | ---------------------------------------- |
| `npm run dev`       | Start the Vite dev server with HMR       |
| `npm run build`     | Type-check and build to `dist/`          |
| `npm run preview`   | Preview the production build locally     |
| `npm test`          | Run the test suite (Vitest, watch mode)  |
| `npm run test:run`  | Run the test suite once (CI)             |
| `npm run lint`      | Lint with Oxlint                         |

## Testing

Tests use **Vitest** with **Testing Library** and **Mock Service Worker** (MSW)
to mock the backend API at the `fetch` boundary — no live backend needed for the
test suite:

```bash
npm run test:run
```

See [ADR 0006](docs/adr/0006-e2e-mock-server.md) for why the API is mocked, and
the mock handlers in `src/mocks/handlers.ts`.

## Deployment

The site is a static build served from S3 + CloudFront. Two things are involved:

- **`infra/static-site.yaml`** — a CloudFormation template (private S3 bucket +
  CloudFront via Origin Access Control) provisioned per stage. Driven locally by
  the [`Makefile`](./Makefile) (`make deploy-site STAGE=dev`, `make url`).
- **`.github/workflows/deploy.yml`** — the CI/CD path. Trigger it from the
  **Actions** tab → **Deploy** → **Run workflow**, choosing an environment. It
  runs tests/lint, builds with the environment's `VITE_*` secrets, provisions
  the infra stack, syncs `dist/`, and invalidates CloudFront.

For local deploys, ensure the **GitHub OIDC provider** exists in the target
account first — it is owned by [exam-generator-shared-infra](https://github.com/Alaksion/exam-generator-shared-infra)
and must be set up there once (see its README). The Makefile's `deploy-oidc`
target provisions the deploy role in each account.

## UI

Components come from [shadcn/ui](https://ui.shadcn.com) (`Base UI` primitives,
`base-nova` style) — see [ADR 0008](docs/adr/0008-shadcn-ui-with-full-retheme.md).
Generated components under `src/components/ui/` are scaffolding: the visual theme
is fully custom, not shadcn's defaults. Tokens live in `src/index.css`:

- **Font**: [Fraunces](https://fonts.google.com/specimen/Fraunces)
  (`font-heading`, serif, headings) paired with
  [Public Sans](https://fonts.google.com/specimen/Public+Sans) (`font-sans`,
  body/UI).
- **Palette**: "ink navy" primary over a cool-neutral base (`--primary`,
  `--background`, etc. in `:root`/`.dark`), replacing shadcn's default zinc +
  indigo. Destructive stays a classic red.
- **Radius**: sharp (`--radius: 0.125rem`) instead of shadcn's default soft
  `rounded-lg`.
- **Shadow**: flat + bordered — all `--shadow-*` tokens are zeroed out in
  `@theme`; depth comes from `border`/`ring` utilities, not box-shadow.

To add a new primitive:

```bash
npx shadcn@latest add <component>
```

It picks up these tokens without per-component overrides.

**Known CLI quirk**: `shadcn add` resolves the `@/*` import alias via the root
`tsconfig.json`'s `compilerOptions.paths`/`baseUrl`, not the referenced
`tsconfig.app.json`. If a future refactor removes those from the root config, the
CLI will silently write files into a literal `./@/` directory instead of `src/`.

## Linting

The project lints with **Oxlint** (`.oxlintrc.json`). To enable type-aware lint
rules, install `oxlint-tsgolint` and set `options.typeAware: true` in the config.
See the [Oxlint rules documentation](https://oxc.rs/docs/guide/usage/linter/rules).

## License

MIT