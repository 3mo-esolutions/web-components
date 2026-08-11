# Discussion: An abstraction for slot-owning & default-content getter pairs

> Status: **discussion** — no code change; collects options for a recurring pattern.

## The pattern today

For a slot `x`, components grow up to four members with distinct responsibilities:

```ts
/* 1 */ protected get xsTemplate() { return html`…<slot name='x'>${this.xDefaultTemplate}</slot>…` }
/* 2 */ protected get xDefaultTemplate() { return html.nothing }
/* 3 */ get xElements() { return this.slotController.getAssignedElements('x') }
/* 4 */ get hasX() { return this.xDefaultTemplate !== html.nothing || this.xElements.length > 0 }
```

1. **The owner** — holds the `<slot>` and its chrome. Internal composition seam: subclasses override and
   render **before or after** `super.xsTemplate` (e.g. `FetchableDataGrid` prepends its refetch button,
   `EntityDataGrid` prepends its create button). *Not* replaceable from the outside.
2. **The default content** — what the slot shows when nothing is slotted. Overridable by subclasses *and*
   replaceable from the outside by slotting (native slot fallback semantics).
3. **The assigned elements** — external contributions.
4. **The presence signal** — gates surrounding chrome (e.g. the whole toolbar renders `html.nothing` when
   every `hasX` is false).

Occurrences: `DataGrid` (toolbar, toolbar-action, filter, sum, primary-action — 5 pairs), `Dialog` (4),
`TimelineItem` (3), `EntityDialog` (2), plus the CSS-flavored sibling in `Card`/`Alert`
(`?data-empty=…` + `[data-empty] { display: none }`).

## Why it needs attention (evidence, not taste)

1. **The dual-seam visibility trap.** `hasX` only sees seam 2. A subclass contributing through seam 1
   is invisible to it. This has now bitten **three times** with the same slot:
   - the original `hasFabs` production workaround (`override get hasFabs() { return true }`),
   - `hasPrimaryAction` missing the `primaryActionDefaultTemplate` (fixed by including it),
   - `EntityDataGrid`'s create button moving from seam 2 to seam 1, silently un-rendering the whole toolbar
     (fixed by restoring the manual `hasPrimaryAction` override).
   The contract "if you touch seam 1, remember to also override `hasX`" is unenforced and self-repeating.
2. **Sentinel identity checks.** `xDefaultTemplate !== html.nothing` cannot recognize a template that
   *renders* nothing (conditional internals), and it evaluates an overridable getter for a boolean —
   so every subclass getter must be pure and cheap, twice per render. Nothing enforces that either.
3. **Naming collisions.** `toolbarActionDefaultTemplate` vs `toolbarActionsTemplate` (one letter apart,
   different responsibilities), now also `primaryActionDefaultTemplate` vs `primaryActionsTemplate`.
   TypeScript's own "did you mean …" suggestions confuse them.
4. **Boilerplate** — four members × five slots in DataGrid alone, hand-wired every time.

## Requirements for any replacement

- (R1) Default content stays native slot fallback → replaceable from outside, overridable by subclasses.
- (R2) An owner seam that is *not* reachable from outside, where subclasses compose **before/after super**.
- (R3) A single presence signal that covers *both* seams and slotted elements — without manual wiring.
- (R4) Presence must be consultable during render (chrome like `#toolbar` is gated on it).
- (R5) No purity requirement leaks: don't evaluate overridable getters solely to derive booleans (or make
  that explicit and single-evaluated).

## Candidate designs

### A. `TemplatedSlot` controller (declare once, derive everything)

One declaration object per slot; members 3 & 4 are derived, member 1 stays a plain getter:

```ts
class TemplatedSlot<THost> implements ReactiveController {
	constructor(host: THost, name: string, options?: {
		default?: () => HTMLTemplateResult    // seam 2, still overridable via host getter indirection
	})
	get template(): HTMLTemplateResult       // <slot name=…>${default}</slot>
	get elements(): Array<Element>           // replaces xElements
	get hasContent(): boolean                // replaces hasX — default-is-nonEmpty || elements.length
}

// usage
readonly primaryActionSlot = new TemplatedSlot(this, 'primary-action', { default: () => this.primaryActionDefaultTemplate })
protected get primaryActionsTemplate() { return html`${this.primaryActionSlot.template}` }  // seam 1 unchanged
```

- ✔ R1/R2/R4 trivially; kills members 3 & 4 as hand-written code
- ✘ R3 only half-solved: seam-1 contributions still invisible unless declared (see C for the fix)
- ✔ Emptiness check centralized: one `isEmpty(template)` util (deep-checks `html.nothing`, empty strings,
  all-empty values) instead of N sentinel comparisons — softens problem 2 without solving R5

### B. DOM-derived presence (`data-empty` generalized — the Card approach)

Stop *predicting* emptiness; observe it. Render chrome **always**, mark it after render, hide via CSS:

```ts
// SlotController extension
hasFlattenedContent(name: string) {  // assignedNodes({ flatten: true }) → covers slotted AND fallback
	…and toggles [data-empty] on the slot / a host attribute
}
```

```css
#toolbar:not(:has(> :not([data-empty]))) { display: none; }
```

- ✔ R3 completely: whatever ends up in the flat tree counts — seam 1, seam 2, slotted, doesn't matter
  *by construction*. The dual-seam trap becomes unrepresentable.
- ✔ R5: no getter evaluation for booleans at all
- ✘ R4 inverted: presence is post-render state, so JS `hasX` consumers (there are external ones —
  it is public API) need a render-then-measure cycle or a `slotchange`-driven reactive property
- ✘ Chrome is in the DOM even when "hidden" (a11y/testing must use visibility, not presence — the test
  suite already learned this lesson the hard way)
- Precedent in-house: `Card`, `Alert`; this is the same idea promoted from CSS trick to contract.

### C. Declared contributions (make seam 1 visible to the presence signal)

Keep both seams, but a seam-1 contributor must *declare* its contribution instead of just rendering it:

```ts
// EntityDataGrid
readonly createAction = this.primaryActionSlot.contribute({
	when: () => !!this.create && !this.createHidden,
	template: () => html`<mo-loading-button …>`,
	position: 'before',   // R2: before/after the slot — replaces manual `${x}${super.y}` ordering
})
```

`hasContent` = any active contribution || non-empty default || assigned elements. The manual
`hasPrimaryAction` override, the `primaryActionsTemplate` override *and* the super-call ordering all
collapse into one declaration. This is A + the missing R3 half; B's CSS can still be layered on top.

- ✔ R1–R5
- ✘ The biggest departure: composition moves from "override a getter, call super" (familiar lit idiom)
  to a registration API. Mixed hierarchies (some subclasses declaring, some overriding) during migration
  would be confusing — this only pays off if adopted consistently.

## Recommendation

**A as the floor, C as the ceiling, B's flatten-check as the shared primitive.**

Concretely: build `TemplatedSlot` in `@3mo/slot-controller` with `template`/`elements`/`hasContent`,
where `hasContent` uses the flattened-tree check (B) *plus* declared contributions (C) when present.
Migrate `DataGrid` first (it has all five pairs and both bugs); keep the public `hasX`/`xElements`
getters as thin delegates so nothing breaks. Whether to also migrate the getter-override composition
style (C proper) can be decided per component after seeing `DataGrid` in the new shape — it is additive.

Non-goals for the first step: `Dialog`/`TimelineItem`/`EntityDialog` migrations, `Card`/`Alert`
unification. They follow the same recipe once the primitive is proven.
