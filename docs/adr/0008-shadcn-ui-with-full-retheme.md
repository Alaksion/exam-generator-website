# shadcn/ui primitives with a full retheme, not the defaults

We're adopting shadcn/ui as a component generator for accessible primitives (button, dialog, dropdown-menu, form, tabs, table, badge — pulled in as needed, not the full catalog), amending ADR 0004's "without a heavy component library." Primitives are sourced from Base UI — shadcn's own currently-recommended underlying library, and the actively maintained successor to Radix from the same team — rather than Radix UI directly. We decided against shipping shadcn's default theme because its stock font (Inter/Geist), radius (`rounded-lg`), palette (zinc + indigo), and shadow (`shadow-sm`) are widely recognized as the generic "AI-generated app" look. Instead, generated components are treated as scaffolding: we immediately override font pairing, color palette, radius scale, and shadow/border treatment with our own tokens, and reserve fully bespoke (non-shadcn-derived) components for domain-specific moments (Score, Breakdown, Quiz progress) where visual identity matters most.

## Considered Options

- **No component library (status quo per ADR 0004)** — rejected because hand-rolling accessible dialogs/dropdowns/forms from scratch is a real cost for little benefit when an accessible primitive library already solves it.
- **Vanilla shadcn/ui defaults** — rejected because the default theme is immediately recognizable and reads as templated/unconsidered.
- **Radix UI as the underlying primitive library** — rejected in favor of Base UI, shadcn's current recommendation and the same team's newer library; Radix is stable but no longer the actively evolving option.
- **React Aria as the underlying primitive library** — rejected without strong reason to prefer Adobe's accessibility-first primitives over shadcn's own recommended default.
- **Full custom design system built from scratch** — rejected as more investment than this project currently warrants; revisit if the retheme approach proves insufficient.

