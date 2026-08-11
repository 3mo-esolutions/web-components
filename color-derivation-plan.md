# Plan: Scheme-adaptive status colors (green / yellow / red / blue)

> Status: **planned** — the first attempt was reverted; this document captures the corrected design.
> Prerequisites already shipped: seed-based accent derivation (`--mo-color-accent-seed` + `deriveColor()` in `@3mo/theme`).

## Goal

Make the four status colors scheme-adaptive the same way the accent color is, and standardize how components
(most importantly `mo-alert`) pair a *container* background with an *on-container* foreground —
matching Material Design 3's "custom colors" feature, which runs any additional semantic color
through the exact same tonal derivation as the primary color (M3's own `error` role set is the proof:
its dark theme color `#ffb4ab` is the error hue at tone 80, exactly like `primary`).

## Post-mortem of the first attempt (reverted)

The **role tokens were correct**, e.g. the derived `--mo-color-yellow-container` in dark theme was `#653e00` with
`#ffdab2` as its on-color — precisely the "deep hue-tinted background + pastel text" look of the reference designs
(shadcn, Obsidian themes, M3 error-container).

Two mistakes were made regardless:

1. **`mo-alert` never used the container tokens.** To preserve its `--mo-alert-color` API, its background was
   "approximated" as `color-mix(in srgb, var(--mo-alert-color), var(--mo-color-surface) 80%)`. In dark theme this
   mixes a tone-80 pastel (e.g. `#ffb964`) into a dark surface at 20% — the sRGB average lands at a mid-dark gray
   with its chroma collapsed to ≈ 0.02 (`#474138` for yellow): the muddy look. Mixing toward a dark color kills
   chroma; deriving the low tone directly from the hue (tone 30 at chroma ≈ 0.09) keeps it rich.
   **Lesson: containers must be derived from the hue via `deriveColor`, never mixed out of the adapted base color.**
2. **The base tokens changed globally without reviewing consumers.** `--mo-color-red` & friends are used as generic
   fills and story colors across apps; re-pinning them to tone 40 in light (e.g. red `rgb(221, 61, 49)` → `#b20003`)
   is correct *for text* but far too big a blast radius to ship as a side effect.

## Corrected design

### 1. Keep the current presets as seeds

`--mo-color-green/yellow/red/blue` stay **unchanged** (static, scheme-independent) and act as *seeds*, exactly like
`--mo-color-accent-seed`. This avoids the blast radius entirely.

### 2. Introduce derived role tokens per status color

For each hue, using `deriveColor()` from `@3mo/theme` with the measured sRGB gamut ceilings as chroma caps:

```ts
--mo-color-red-strong:        /* text/icon role: tone 40 light / tone 80 dark — naming TBD, see open questions */
--mo-color-red-container:     /* fill role:      tone 90 light / tone 30 dark */
--mo-color-on-red-container:  /* on-fill role:   tone 30 light / tone 90 dark */
```

Measured constants (oklch; hue from each seed, ceilings via binary search over the OKLab→sRGB gamut):

| Hue (seed) | oklch H | seed C | ceiling @ 48% (t40) | @ 83.5% (t80) | @ 91% (t90) | @ 40% (t30) |
|---|---|---|---|---|---|---|
| green `rgb(93, 170, 96)` | 144.7 | .131 | .152 | .265 | .173 | .127 |
| yellow `rgb(232, 152, 35)` | 69.7 | .152 | .104 | .130 | .067 | .087 |
| red `rgb(221, 61, 49)` | 28.8 | .199 | .197 | .091 | .047 | .164 |
| blue `rgb(0, 119, 200)` | 248.7 | .153 | .131 | .086 | .046 | .110 |

Reference outputs from the first attempt (the *token* values were good):
dark red `#ffb3a7` (M3's own dark error: `#ffb4ab`), light yellow text `#825100` (GitHub Primer's: `#9a6700`),
dark yellow-container pair `#653e00` / `#ffdab2`.

### 3. Rebuild `mo-alert` on the roles

- background: the hue's `container` role (opaque — no translucent stacking artifacts)
- icon + heading: the hue's `on-container` role
- body text: `on-container` slightly muted (e.g. `color-mix(in srgb, currentColor, transparent 10%)` as today)
- **Custom alert colors**: replace the `--mo-alert-color` override with a *seed*-based API (e.g. `--mo-alert-color-seed`),
  and derive container/on-container inside the component via `deriveColor('var(--mo-alert-color-seed)', …)`.
  This is the reusability requirement: any future custom color gets the same derivation at its point of use.
  Keep `--mo-alert-color` working (deprecated) by only applying the derivation when the seed is set.

### 4. Verification checklist before shipping

- [ ] Alert story in **both** schemes, all four types + one custom color — compare against the shadcn/Obsidian references
- [ ] Every other consumer of the four presets reviewed (grep `--mo-color-(green|yellow|red|blue)`) — they keep the seeds, so no visual change is expected anywhere else
- [ ] Photos demo + Colors story swatches (add rows for the new role tokens)
- [ ] Light theme: yellow *text* usages should migrate to the `-strong` role opportunistically (current seed yellow is 2.2:1 on white)

## Open questions

1. **Naming of the text/icon role**: `--mo-color-red-strong`? `-emphasis`? Or flip it — keep `--mo-color-red` as the
   adaptive role and expose `--mo-color-red-seed`? (Consistent with accent, but reintroduces the blast radius —
   would need a major release + migration notes.)
2. **Chroma caps vs browser gamut mapping**: dropping `min(c, …)` and relying on CSS Color 4 gamut mapping
   (chroma reduction at constant L/H) would make `deriveColor` hue-universal without measured caps — but browsers
   differ (clip vs chroma-reduction). Needs a cross-browser test before trusting it.
3. **`on-<hue>` solid-fill roles** (white / tone 20): only needed if solid status fills (badges) become a use case.
4. **Hue harmonization**: M3's `Blend.harmonize` shifts custom colors slightly toward the seed hue. Skipped for now;
   revisit if status colors feel disconnected from strongly-tinted brand accents.
