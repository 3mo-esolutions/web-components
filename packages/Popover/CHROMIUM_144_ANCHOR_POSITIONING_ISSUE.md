# Chromium 144+ CSS Anchor Positioning Breaking Changes

**Date**: January 19, 2026
**Status**: Deferred - Using FloatingUI fallback for Chromium >= 144
**Affected Chromium versions**: 144+

## Problem Summary

Chromium 144 introduced breaking changes to CSS anchor positioning:

1. **Non-tree-scoped container-name matching** - Anchor names are now global across shadow DOM boundaries instead of being scoped to each shadow tree
2. **CSS anchor positioning with transforms** - (secondary issue)

### Symptoms
- Multiple components using the same static `anchor-name` (e.g., `--mo-popover-container`) conflict with each other
- `::slotted()` selectors can no longer set `anchor-name` or `position-anchor` properties
- Popovers position incorrectly or don't position at all

### Affected Components
- `mo-popover` / `mo-popover-container`
- `mo-menu` (nested menus)
- `mo-split-button`
- `mo-field-select`
- `mo-field-date-time` and date/time fields
- `mo-data-grid` column headers
- `mo-navigation-item`

## Current Workaround

Force FloatingUI fallback for Chromium >= 144:

```typescript
static get supported() {
    if (!CSS.supports('anchor-name: --name')) {
        return false
    }
    const match = navigator.userAgent.match(/Chrom(?:e|ium)\/(\d+)/)
    if (match && parseInt(match[1], 10) >= 144) {
        return false // Force FloatingUI for Chromium 144+
    }
    return true
}
```

## Attempted Solutions

### 1. Unique Anchor Names via JavaScript ❌
**Approach**: Generate unique anchor names per instance (e.g., `--mo-button--abc123def`) and set them via JS instead of CSS.

```typescript
private static generateAnchorName(anchor: HTMLElement) {
    return `--${anchor.id || anchor.tagName.toLowerCase()}--${Math.random().toString(36).substring(2, 15)}`
}

private tetherTo(anchor = this.host.anchor) {
    if (!anchor) return

    const popover = this.host
    const cssRoot = PopoverCssAnchorPositionController.getCssRoot(popover)

    // Generate unique anchor name if not already set
    if (!anchor.style.anchorName) {
        anchor.style.anchorName = PopoverCssAnchorPositionController.generateAnchorName(anchor)
    }

    // Set position-anchor on the cssRoot
    cssRoot.style.positionAnchor = anchor.style.anchorName
}
```

**Result**: Didn't work reliably. Even when DevTools showed correct `anchor-name` and `position-anchor` values being set, positioning still failed.

### 2. Explicit `position: fixed` on host ❌
**Approach**: Add explicit `position: fixed` to the popover host since CSS anchor positioning requires `position: fixed` or `position: absolute`.

```css
:host {
    position: fixed;
    position-visibility: always;
}
```

**Result**: Made things worse.

### 3. `getCssRoot` traversal for intermediate components ❌
**Approach**: Handle the `cssRoot` chain where `mo-menu` wraps `mo-popover` and needs `position-anchor: inherit`.

```typescript
private static getCssRoot(element: HTMLElement): HTMLElement {
    const key = 'cssRoot'
    let root: HTMLElement = element
    while (root) {
        const newRoot = (root as any)[key] as HTMLElement | undefined
        if (!newRoot) break
        root.style.positionAnchor = 'inherit'
        root = newRoot
    }
    return root
}
```

**Result**: Menus worked partially but other components didn't. First render had alignment issues.

## Potential Future Solutions to Explore

### 1. CSS `anchor-scope` Property
MDN documentation mentions `anchor-scope` which limits anchor name visibility to a subtree:

```css
.scoped-container {
    anchor-scope: all; /* or specific names like --my-anchor */
}
```

This could re-scope anchor names within shadow boundaries. **Needs investigation** - check browser support and whether it works across shadow DOM.

### 2. Wait for Browser Fixes
The Chromium team may address the shadow DOM scoping regression in future versions.

### 3. Popover API Implicit Anchoring
MDN mentions implicit anchor associations via the Popover API:
- Using `popovertarget` and `id` attributes
- Using `commandfor` and `id` attributes
- Programmatically via `showPopover()` with `source` option

This might provide automatic anchoring without explicit CSS anchor names.

## Key Technical Notes

### CSS Anchor Positioning Requirements
Per MDN, anchor positioning requires:
1. `anchor-name: --name` on the anchor element
2. `position: fixed` or `position: absolute` on the positioned element
3. `position-anchor: --name` on the positioned element
4. `position-area` (or `anchor()` function in inset properties) for actual positioning

### The `cssRoot` Pattern
Some components like `mo-menu` wrap `mo-popover` internally. The `cssRoot` property creates a chain:
- `mo-menu` has `cssRoot` pointing to its internal `mo-popover`
- This allows the menu to be the positioning root while popover handles the actual popover behavior

### Files That Were Modified (and reverted)
- `PopoverCssAnchorPositionController.ts` - main controller changes
- `PopoverContainer.ts` - removed static anchor-name CSS
- `SplitButton.ts` - removed static anchor-name CSS
- `FieldSelect.ts` - removed static anchor-name CSS
- `NestedMenuItem.ts` - removed static anchor-name CSS
- `NavigationItem.ts` - removed static anchor-name CSS
- `FieldDateTimeBase.ts` - removed static anchor-name CSS
- `DataGridColumnHeader.ts` - removed static anchor-name CSS
- `Popover.stories.ts` - removed static anchor CSS from stories
- `Menu.stories.ts` - removed static anchor CSS from stories

## References

- [MDN: Using CSS anchor positioning](https://developer.mozilla.org/en-US/docs/Web/CSS/CSS_anchor_positioning/Using)
- [MDN: anchor-scope property](https://developer.mozilla.org/en-US/docs/Web/CSS/anchor-scope)
- Chromium release notes for version 144 (check for anchor positioning changes)

## Next Steps When Revisiting

1. Check if Chromium has fixed the shadow DOM scoping issue
2. Test `anchor-scope: all` on shadow hosts
3. Investigate Popover API implicit anchoring
4. Consider if a hybrid approach could work (CSS for simple cases, JS adjustment for edge cases)
5. Monitor CSS Anchor Positioning spec for updates on shadow DOM handling
