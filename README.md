# React + TypeScript + Vite

This template provides a minimal setup to get React working in Vite with HMR and some Oxlint rules.

## UI

Components come from [shadcn/ui](https://ui.shadcn.com) (`Base UI` primitives, `base-nova` style) — see [ADR 0008](../docs/adr/0008-shadcn-ui-with-full-retheme.md). Generated components under `src/components/ui/` are scaffolding: the visual theme is fully custom, not shadcn's defaults. Tokens live in `src/index.css`:

- **Font**: [Fraunces](https://fonts.google.com/specimen/Fraunces) (`font-heading`, serif, headings) paired with [Public Sans](https://fonts.google.com/specimen/Public+Sans) (`font-sans`, body/UI).
- **Palette**: "ink navy" primary over a cool-neutral base (`--primary`, `--background`, etc. in `:root`/`.dark`), replacing shadcn's default zinc + indigo. Destructive stays a classic red.
- **Radius**: sharp (`--radius: 0.125rem`) instead of shadcn's default soft `rounded-lg`.
- **Shadow**: flat + bordered — all `--shadow-*` tokens are zeroed out in `@theme`; depth comes from `border`/`ring` utilities, not box-shadow.

To add a new primitive: `npx shadcn@latest add <component>` from the repo root. It will already pick up these tokens without per-component overrides.

**Known CLI quirk**: `shadcn add` resolves the `@/*` import alias via the root `tsconfig.json`'s `compilerOptions.paths`/`baseUrl`, not the referenced `tsconfig.app.json`. If a future refactor removes those from the root config, the CLI will silently write files into a literal `./@/` directory instead of `src/`.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Oxc](https://oxc.rs)
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/)

## React Compiler

The React Compiler is not enabled on this template because of its impact on dev & build performances. To add it, see [this documentation](https://react.dev/learn/react-compiler/installation).

## Expanding the Oxlint configuration

If you are developing a production application, we recommend enabling type-aware lint rules by installing `oxlint-tsgolint` and editing `.oxlintrc.json`:

```json
{
  "$schema": "./node_modules/oxlint/configuration_schema.json",
  "plugins": ["react", "typescript", "oxc"],
  "options": {
    "typeAware": true
  },
  "rules": {
    "react/rules-of-hooks": "error",
    "react/only-export-components": ["warn", { "allowConstantExport": true }]
  }
}
```

See the [Oxlint rules documentation](https://oxc.rs/docs/guide/usage/linter/rules) for the full list of rules and categories.
