# Fab

A web component for floating action buttons with an icon and an optional label, built on Material Web.

[![npm](https://img.shields.io/npm/v/@3mo/fab?style=flat-square&color=0077c8)](https://www.npmjs.com/package/@3mo/fab) [![Documentation](https://img.shields.io/badge/docs-storybook-ff4785?style=flat-square&logo=storybook&logoColor=white)](https://3mo-esolutions.github.io/web-components/?path=/docs/actions-floating-action-button--overview)

A floating action button for the primary action of a screen, extended with a label when it has text.

## Installation

```sh
npm install @3mo/fab
```

```ts
import '@3mo/fab'
```

[Server-side rendering](https://3mo-esolutions.github.io/web-components/?path=/docs/getting-started-installation--overview#server-side-rendering): Renders with Lit SSR and hydrates.

## Usage

```html
<mo-fab icon='add'></mo-fab>
```

## Examples

- [Extended](https://3mo-esolutions.github.io/web-components/?path=/story/actions-floating-action-button--extended) — Text in the default slot makes it an extended FAB, labelled beside its icon.
- [Dense](https://3mo-esolutions.github.io/web-components/?path=/story/actions-floating-action-button--dense) — `dense` makes it the small FAB, with or without a label.
- [Icon At End](https://3mo-esolutions.github.io/web-components/?path=/story/actions-floating-action-button--icon-at-end) — `iconAtEnd` moves the icon after the label, and follows the writing direction.
- [Icon Slot](https://3mo-esolutions.github.io/web-components/?path=/story/actions-floating-action-button--icon-slot) — The `icon` slot takes any content in place of the Material icon, such as an SVG drawn in the current color.
- [Parts](https://3mo-esolutions.github.io/web-components/?path=/story/actions-floating-action-button--parts) — The `button`, `ripple` and `focus-ring` parts can be restyled or hidden from outside.

## API

### `mo-fab`

#### Properties

| Name | Attribute | Type | Default | Description |
| --- | --- | --- | --- | --- |
| `icon` | `icon` | `MaterialIcon \| undefined` |  | The Material icon to display. |
| `dense` | `dense` | `boolean` | `false` | Makes it the small FAB. |
| `iconAtEnd` | `iconAtEnd` | `boolean` | `false` | Places the icon after the label. |

#### Slots

| Name | Description |
| --- | --- |
| (default) | The label, which makes it an extended FAB. |
| `icon` | Content in place of the icon. |

#### CSS parts

| Name | Description |
| --- | --- |
| `button` | The native button element. |
| `ripple` | The ripple effect. |
| `focus-ring` | The focus ring. |

## Links

- [Documentation](https://3mo-esolutions.github.io/web-components/?path=/docs/actions-floating-action-button--overview)
- [Changelog](https://3mo-esolutions.github.io/web-components/?path=/docs/actions-floating-action-button--overview)
- [Source](https://github.com/3mo-esolutions/web-components/tree/main/packages/Fab)

## License

MIT © 3MO GmbH