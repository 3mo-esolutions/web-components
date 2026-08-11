# Plan: Modernize the light theme's surfaces

> Status: **planned** — implemented once and reverted to keep the seed-derivation release non-breaking.
> The dark theme is already Material Design 3-like; the light theme is still closer to Material Design 2.

## Problem

Two separate issues, both light-theme only:

### 1. The surface containers do not tier at all

Three of the five container roles are *literally* the surface, so any component reaching for a
"one step up/down" surface gets no visual change whatsoever:

```css
--mo-color-surface-container-lowest: light-dark(var(--mo-color-surface), …); /* == surface */
--mo-color-surface-container-low:    light-dark(var(--mo-color-surface), …); /* == surface */
--mo-color-surface-container:        var(--mo-color-surface);               /* == surface */
--mo-color-surface-container-high:    color-mix(…, foreground 4%);          /* only these two */
--mo-color-surface-container-highest: color-mix(…, foreground 8%);          /*  actually tier */
```

M3 *does* tier in light theme, just subtly — tones 100 / 96 / 94 / 92 / 90, i.e. steps of ~2 tones.
The current dark theme tiers properly (`black 64%` / `black 32%` / surface / `+4%` / `+8%`).

### 2. The background is an M2-era mid-gray canvas

`--mo-color-background` light is `color-mix(rgb(220, 220, 220), seed 14%)` → `#bdced9`, about tone 82.
That is the M2 "gray canvas + white paper" pattern. M3 light backgrounds sit at tone ~98 (`#f7f9ff`),
which is what makes M3 light themes read as airy rather than dated.

## Proposed values

Measured with seed `#0077c8` (all light theme; **dark theme stays byte-identical**):

| Role | Current | Proposed | Proposed formula | M3 reference |
|---|---|---|---|---|
| `background` | `#bdced9` (t82) | `#f2f6f9` (t97) | `color-mix(in srgb, rgb(250, 250, 251), seed 3%)` | `#f7f9ff` (t98) |
| `surface` | `#f0f7fc` | `#fafcfe` (t98.5) | `color-mix(in srgb, white, seed 2%)` | t98 |
| `surface-container-lowest` | `= surface` | `#ffffff` | `white` | `#ffffff` (t100) |
| `surface-container-low` | `= surface` | `#f2f5f6` | `color-mix(in srgb, surface, foreground 3%)` | `#f1f4f9` (t96) |
| `surface-container` | `= surface` | `#edf0f1` | `color-mix(in srgb, surface, foreground 5%)` | `#ebeef3` (t94) |
| `surface-container-high` | `#e8ebec`* | `#e8ebec` | `color-mix(in srgb, surface, foreground 7%)` | `#e6e8ee` (t92) |
| `surface-container-highest` | `#e3e6e7`* | `#e3e6e7` | `color-mix(in srgb, surface, foreground 9%)` | `#e0e2e8` (t90) |

\* `-high` / `-highest` currently use a single scheme-independent value (4% / 8%). Going to 7% / 9% in light
requires splitting them into `light-dark()`, keeping 4% / 8% for dark.

The container steps land essentially on M3's reference tones.

## Why this was held back

`--mo-color-background` going from tone 82 to tone 97 changes the look of **every** application screen —
far more visible than the accent derivation. It also interacts with things this repository cannot see:

- App-level backgrounds/illustrations picked to sit on a mid-gray canvas
- `--mo-shadow` was tuned against a gray canvas; on near-white it will read differently (possibly too weak)
- Any app hard-coding `#bdced9`-adjacent colors to "match" the background
- `mo-card` (filled) is `surface` + `--mo-shadow`: with background at t97 and surface at t98.5 the card/canvas
  contrast becomes very subtle, so cards may need `surface-container-low` or a stronger shadow instead

## Deliberate deviation from M3, if implemented

Keep background at tone ~97 rather than M3's 98, so that `mo-card` surfaces still separate from the canvas
(the Gmail pattern: slightly gray canvas under white cards). Fully M3-pure would make `background == surface`
and rely on shadows/outlines alone — a bigger component-level change.

## Suggested rollout

1. Ship the seed-derivation release first (done — this document exists because of that).
2. Land the **container tiering** alone (items in the table except `background`/`surface`). It is low-risk:
   the three flat roles have no differentiated appearance to lose, so nothing can regress visually —
   only components that already opted into a container role gain the intended step.
3. Land `background` + `surface` separately, as a deliberate visual release, together with:
   - a review of `--mo-shadow` / `--mo-shadow-deep` against the lighter canvas
   - a decision on `mo-card`'s filled background role
   - release notes flagging it, since apps may need to adjust their own surfaces
4. The leak knobs (`--mo-color-background-leak-percent`, `--mo-color-surface-leak-percent`) keep working, but
   their sensible defaults change with the lighter bases (14% / 6% on a mid-gray base vs 3% / 2% on near-white) —
   apps overriding them will need new values.

## Verification checklist

- [ ] `Demo / Photos` story in light theme — canvas/card/toolbar separation
- [ ] `Theme / Colors` story — all five container swatches must be visibly distinct in light theme
- [ ] `mo-data-grid` (header, footer, `ModdableDataGrid`'s modebar which uses `surface-container-low`)
- [ ] `mo-dialog` (uses `--md-sys-color-surface-container-high`)
- [ ] Dark theme unchanged — assert `background` `#0c1118` and `surface` `#19232d` still resolve identically

## Related

- `color-derivation-plan.md` — the status colors (green/yellow/red/blue), also outstanding.
