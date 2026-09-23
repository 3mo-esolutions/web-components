# Row context menus — capability, laziness and the cost of finding out

Status: **assessment, undecided.** This branch holds a ten-line proof of concept (`99bd0f4b`) which hides a
row's `⋮` button when that row's context menu resolves to `html.nothing`. This document collects every
scenario in the consuming application which such a feature would have to survive, so the decision can be
made with the real call sites in view rather than in the abstract.

Nothing here is implemented. The PoC as committed is **not** the shape to ship — see
[What the PoC does and why it cannot ship as-is](#what-the-poc-does-and-why-it-cannot-ship-as-is).

---

## 1. Where this comes from

`main` now materializes row context menus lazily: the `<mo-context-menu>` and everything in it is built by
the first right-click, not at idle for every rendered row. As part of that, the row's guard

```ts
${this.contextMenuTemplate === html.nothing ? html.nothing : popover(…)}   // before
${!this.dataGrid.hasContextMenu ? html.nothing : popover(…)}              // now
```

was replaced, because the old form **evaluated the consumer's `getRowContextMenuTemplate` on every render of
every row** purely to compare the result against `html.nothing` — measured at 600 calls for a 100-row grid
before any interaction — and never detected a consumer `nothing` anyway, since it compares the *wrapper*
template, which is never `nothing` while the property is set.

Three specs on `main` pin the new behaviour (`DataGrid.test.ts`, `Row context menu laziness`):

1. the template is **not evaluated** while no row has been right-clicked,
2. the `⋮` button and the right-click trigger are offered **without** evaluating it,
3. on right-click it is evaluated **first with that row's data**.

Verified: restoring the old guard fails exactly specs 1 and 2. **Any smart-capability feature must confront
these three specs explicitly** — either by satisfying them, or by consciously replacing them.

## 2. The question is contract, not performance

Evaluating a template function produces a `TemplateResult`, which is inert data. Rendering it is what
constructs elements, attaches listeners and runs directives. So:

| | evaluate the function | materialize the menu |
| --- | --- | --- |
| the consumer's function body | runs | runs |
| `mo-context-menu`, `mo-menu`, `mo-popover`, every item — constructed with shadow roots | — | yes |
| directives actually execute (`until` subscribes, `dialogLink` wires listeners) | — | yes |
| document click listener, controllers, idle scheduling | — | yes |

The lazy trigger keeps the entire right-hand column for every row nobody opens, **whether or not** the
function is evaluated once for a capability check. Evaluating once per row is not what made the old guard
expensive; evaluating per *render* was.

So the smart route does not cost the laziness win. What it costs is a **contract**: "your template function
may be evaluated speculatively, for rows the user never interacts with." That sentence would apply to all
138 call sites, to serve — as section 4 shows — about four of them.

### The lit fact this rests on

`` html`…` `` and `directive(…)` both return plain objects. A directive's **body** runs only when a part
commits it. But a directive's **arguments**, and every other expression in the template, run at evaluation:

```ts
until(orders[0].isInteractivePaymentPossible().then(…), html.nothing)
//    ^ this method call happens at evaluation; `until` itself does nothing yet
dialogLink(new DialogOrder({ … }))
//         ^ this construction happens at evaluation; the directive is inert
```

## 3. What the PoC does and why it cannot ship as-is

`99bd0f4b` renames `hasContextMenu` → `hasContextMenus` (function-defined) and adds:

```ts
hasContextMenu(record: DataRecord<TData>) {
	const contextMenu = this.host.getRowContextMenuTemplate?.([record.data])
	return !!contextMenu && contextMenu !== html.nothing
}
```

consumed from `contextMenuIconButtonTemplate`. Three problems, in order of severity:

1. **It evaluates per render**, from inside a template getter — reintroducing exactly the cost that was just
   removed, and failing the laziness specs.
2. **It probes a single row** (`[record.data]`) while the menu is a function *of the selection*. Section 4.A
   shows this is the largest category of real call sites.
3. **It only detects the literal `nothing`.** Sixteen further call sites return `nothing` from *nested*
   conditionals, producing a non-`nothing` template of conditionally-empty items — the `⋮` still shows and
   still opens an empty menu.

## 4. Survey of the consuming application

138 `getRowContextMenuTemplate` sites. 21 can return `html.nothing` for the whole template; three of those
are delegation wrappers (`DialogCustomer.Orders.ts:46`/`:73`, `ProductDispositionDetails.ts:77`), leaving 18
real ones, classified below.

### A. Gated on the *selection size* — a per-row probe answers a different question (8 sites)

```ts
override getRowContextMenuTemplate = (orders: Array<Order>) => orders.length !== 1 ? html.nothing : html`…`
```

| Site | Gate |
| --- | --- |
| `logistics/PagePicklists/DataGridPicklistOrder.ts:80` | `orders.length !== 1` |
| `logistics/PagePicklists/DataGridPicklistOrderPosition.ts:91` | `orderPositions.length !== 1` |
| `logistics/Picklists/DataGridPicklist.ts:103` | `picklists.length !== 1` |
| `logistics/Picklists/DataGridPicklistPosition.ts:49` | `positions.length === 0` |
| `logistics/PageShip/DataGridOrderParcelShip.ts:47` | `orderParcels.length > 1` |
| `finances/PageMatchTransaction/DataGridAccountingDocumentMatch.ts:73` | `documents.length > 1` |
| `_shared/file/DialogFiles/DataGridFiles.ts:28` | `files.length > 1 \|\| files[0].isDeleted` |
| `logistics/PageDeliveries/ModdableDataGridPurchaseDelivery.ts:100` | `items.every(i => i.supplierInvoiceId === …)` — cross-row |

A probe passing `[record.data]` always asks the single-row question. For these sites that yields "has a
menu", which is right for the `⋮` button but **says nothing about the multi-selection right-click**, which is
where these gates actually fire. Smart-hiding therefore fixes at most half of each of these sites, and the
remaining half is precisely the empty popover we would be trying to remove.

**Open question:** should the `⋮` button and the right-click be allowed to disagree? Today they cannot,
because neither consults the result.

### B. Gated on *host state* which changes at runtime, sometimes asynchronously (6 sites)

| Site | Gate | Kind |
| --- | --- | --- |
| `products/PageProducts/…/ModdableDataGridProduct.ts:176` | `this.hideActions` | `@property` |
| `products/DialogProduct/…/DataGridProductPrice.ts:87` | `this.readOnly` | `@property` |
| `returns/…/DataGridOrderReturnPosition.ts:122` | `this.readOnly` | `@property` |
| `inventory/PageStocktaking/DataGridRemainingStockBin.ts:56` | `!this.assignedOnly` | parameters property |
| `inventory/PageMinimumStockDefinitions/FetchableDataGridMinimumStockDefinition.ts:66` | `!this.shadowStocks.length` | **`@state` filled by `await Stock.getShadowStocks()`** |
| `logistics/DialogDelivery/DataGridPurchaseDeliveryPosition.ts:84` | `this.scanned`, `this.purchaseDelivery?.…` | property + async entity |

None of these depend on the row at all. Two consequences:

- They are **grid-level facts** and would be better expressed by not setting `getRowContextMenuTemplate` at
  all for that state, which makes `hasContextMenu` false and removes the column *and* the button through
  machinery that already exists — no speculation, no new contract.
- If a smart probe were memoized per row, these gates would make the memo **go stale**: `readOnly` flips,
  `shadowStocks` resolves after a fetch. The grid cannot know when to invalidate, because the gate lives in
  consumer state it cannot observe. Any memo would need an explicit invalidation API — more surface than the
  feature is worth.

### C. Genuinely per-row conditions — the only category the feature actually serves (4 sites)

| Site | Gate |
| --- | --- |
| `returns/PageOrderReturns/ModdableDataGridOrderReturn.ts:123` | `orderReturn.isDeleted` |
| `cashpoint/…/DataGridReceiptPosition.ts:9` | `!position.voucherFileId && !EpsonPrinter.isEnabled` (row + global) |
| `cashpoint/…/DataGridReceipt.ts:44` | `!receipt` — defensive, degenerate |
| `returns/PageCashpointReceiptReturn/PageCashpointReceiptReturn.ts:43` | `!receipt` — defensive, degenerate |

Two of the four are defensive guards against an absent row, not capability statements. **So the feature's
real audience is roughly two call sites out of 138.**

### D. `nothing` only in nested position — invisible to any capability check (~16 sites)

`PageCustomersData.ts:278`, `DataGridAccountingDocument.ts:73`, `ModdableDataGridVoucher.ts:68`,
`DataGridNote.ts:91`, `ModdableDataGridSupplierInvoice.ts:45`, `DataGridTransferPicklist.ts:58` and others.
The function returns a real template whose *items* are all conditionally empty. A capability check comparing
against `html.nothing` will always say "has a menu" here. If the goal is "never open an empty menu", this
category is untouched by the PoC's approach and needs the open-time fallback of section 6 instead.

## 5. The three complicated menus, and what they do at evaluation

These are the stress cases any speculative-evaluation contract has to be safe for.

### 5.1 `TradebyteSalesChannelContextMenuController` — the model to copy

```ts
readonly fetcher = new Task(this.host, SalesChannel.getForTradebyte, () => [])
private get salesChannels() { return this.fetcher.value ?? [] }
```

The fetch is owned by a `Task` bound to the **host**, so it runs when the host is connected and rendered.
The template function only reads `fetcher.value` and maps it. **Pure, cheap, safe to evaluate any number of
times.** This is the pattern the guidance in section 7 asks for.

### 5.2 `getProductTagsGroupsContextMenu` — the one to fix first

```ts
if (!Authorizations.has('erp.edit-product-tags')) { return html.nothing }
dataGrid[fetch] ??= ProductTagGroup.getAll()          // ← starts a request at EVALUATION
return until(dataGrid[fetch].then(groups => html`…`)) // ← a new .then on every evaluation
```

Two problems, both pre-existing and both real today:

- The request is kicked off **by evaluating the template**, not by rendering it. Under the old per-render
  guard this fired at grid render for menus nobody opened. Under `main`'s laziness it fires on first
  right-click, which is correct — but a capability probe would move it back to render time.
- The authorization gate is a **grid-wide** fact (category B), expressed per row.

Used by five grids: products, inventory positions, shop bundles, shopify products, tradebyte.

### 5.3 `OrderDataGridContextMenu` — 196 lines, the heaviest

At evaluation it runs roughly thirty `Authorizations.has` / `Configurations.get` / field checks, about forty
`t()` lookups, and **constructs five or six dialog components** (`DialogPdf`, `DialogOrder` ×2,
`DialogCustomer`, `DialogAccount`, plus `DialogOrder.fromOffer`). It also calls
`orders[0].isInteractivePaymentPossible()` — a network request on first call per sales channel, cached
afterwards in a static map.

**The dialog constructions are deliberate and are not a problem.** In this application the component class
carries its metadata — label, icon, authorization — through decorators, and `dialogLink` resolves it from the
instance; `Navigation.ts` does the same via `icon.get(this.ComponentConstructor)`. Constructing a custom
element is cheap by platform contract: everything with a cost waits for `connectedCallback`. Do **not**
propose a lazy/factory `dialogLink` to "fix" this.

What matters for this document is only that this function is expensive enough that evaluating it per row per
render was measurable, and that its `isInteractivePaymentPossible()` call is IO reached at evaluation.

## 6. If we never evaluate speculatively, what about empty menus?

The empty-popover problem is worth solving on its own, and can be solved **without** any speculation:

> When a materialized context menu has no items, do not show it.

This acts at open time on the real result, so it needs no contract, no memo, no invalidation, and it also
covers category D — which the capability check cannot. Worst case becomes "right-click does nothing" instead
of "an empty box appears". Note that today neither `Menu` nor `ContextMenu` refuses to open when empty, so
the 18 sites of section 4 currently produce an empty popover; this is a real bug independent of everything
else here.

## 7. Rules for writing a row context menu

These hold **today**, and are what makes a menu safe under either route. They should become part of the
`getRowContextMenuTemplate` documentation regardless of the decision.

1. **The template function must be cheap and free of side effects.** It may be called more than once, and it
   may be called for a menu the user never sees.
2. **Never start IO in the template function.** Own the fetch on the host and read its value:
   ```ts
   readonly fetcher = new Task(this.host, () => Thing.getAll(), () => [])   // ✅ runs when the host renders
   getTemplate = () => html`${this.fetcher.value?.map(…)}`
   ```
   ```ts
   host[cache] ??= Thing.getAll()                                          // ❌ IO at evaluation
   return until(host[cache].then(things => html`…`))
   ```
   *The template is lazy; the rendering may do IO.* A directive that fetches when it is **connected** is
   fine — that is rendering. A promise created while merely *building* the template is not.
3. **Constructing components is fine.** Dialogs and pages carry their metadata on the class, and cost
   nothing until connected. If a specific constructor does IO, fix that constructor.
4. **Express grid-wide capability at the grid, not per row.** If the whole grid has no menu for this user,
   configuration or mode, leave `getRowContextMenuTemplate` unset — the column and the button disappear
   through `hasContextMenu`. (Category B of section 4 is 6 sites doing this the hard way.)
5. **Prefer a disabled item with a reason over a hidden one.** More discoverable, and it sidesteps capability
   detection entirely. Many sites already do this with `?disabled=`.
6. **Only the literal `html.nothing` is ever detectable.** A template of conditionally-empty items is
   indistinguishable from a full one.

## 8. If the smart route is pursued anyway

The minimum shape which would not regress `main`:

- **Opt-in**, not default — the benefit is cosmetic at ~2 sites, the contract change touches 138.
- Probe **at row render, memoized per row per data change** — never inside a template getter, never in
  `DataRecord` (record building must stay pure and fast).
- **`⋮` button only.** Column reservation cannot be made smart under virtualization, since unrendered rows
  were never probed.
- An **invalidation** story for category B, or an explicit statement that gates on mutable host state are
  unsupported.
- Fix `getProductTagsGroupsContextMenu` first, so probing does not reintroduce fetch-at-render.
- Written contract: "the template may be evaluated speculatively; it must be pure."

### Tests to add (none of these exist yet)

- probe runs **once per row per data change**, not per render — the counterpart of `main`'s laziness specs
- a row whose menu is `nothing` shows no `⋮`, and its right-click opens nothing
- a row whose menu is non-empty is unaffected
- **selection mismatch**: a grid whose menu is `length !== 1 ? nothing : …` — assert the intended behaviour
  when a single row shows `⋮` but a multi-selection right-click yields nothing (category A)
- **stale memo**: flip `readOnly` after first render and assert the `⋮` updates (category B)
- **async gate**: resolve a fetch which populates the gate and assert the `⋮` updates (`shadowStocks`)
- the probe never triggers IO — spy on the fetcher, assert not called before the menu is opened

### Stories to add

- a grid mixing rows with and without menus, showing which rows carry a `⋮`
- the selection-mismatch case, made visible
- a "how to write a context menu" story pairing the `Task` pattern against the fetch-at-evaluation one

## 9. Recommendation

**Skip the capability feature; keep the laziness.** The route that solves the real problem for the fewest
moving parts:

1. Move category B's six sites to grid-level expression (unset the property) — application-side, no library
   change, semantically correct.
2. Add the open-time empty-menu fallback of section 6 — library-side, small, no contract.
3. Prefer disabled items over hidden ones for the remaining per-row cases.
4. Fix `getProductTagsGroupsContextMenu` to own its fetch on the host.
5. Document section 7 on `getRowContextMenuTemplate`.

That leaves roughly two call sites unserved, and both would be better as a disabled item with a reason.

If the decision goes the other way, section 8 is the checklist.
