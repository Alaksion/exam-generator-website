# Frontend stack: Vite, React Router, TanStack Query, Tailwind, Vitest + Playwright

The web app will be built with Vite, using React Router v6 for client-side navigation. Server state (certifications, exams, polling, downloads) will be managed by TanStack Query (React Query) for built-in caching, polling, and error handling. Styling will use Tailwind CSS. Testing will use Vitest with React Testing Library for unit/component tests and Playwright for end-to-end tests.

We chose Vite over Create React App because it is the modern default for static React apps and produces a fast dev/build experience. TanStack Query removes the need to hand-write polling and retry logic for exam generation. Tailwind keeps the UI lightweight without a heavy component library. Playwright gives us confidence in the full exam flow without requiring a deployed backend in every test.
