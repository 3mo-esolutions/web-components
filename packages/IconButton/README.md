# Icon Button

A web component for icon-only buttons in regular or dense size, built on Material Web.

[![npm](https://img.shields.io/npm/v/@3mo/icon-button?style=flat-square&color=0077c8)](https://www.npmjs.com/package/@3mo/icon-button) [![Documentation](https://img.shields.io/badge/docs-storybook-ff4785?style=flat-square&logo=storybook&logoColor=white)](https://3mo-esolutions.github.io/web-components/?path=/docs/actions-icon-button--overview)

A round button showing only an icon, sized by its `font-size` and colored by the inherited `color`.

## Installation

```sh
npm install @3mo/icon-button
```

```ts
import '@3mo/icon-button'
```

## Usage

```html
<mo-icon-button icon='verified'></mo-icon-button>
```

## Examples

- [Color](https://3mo-esolutions.github.io/web-components/?path=/story/actions-icon-button--color) — The icon, its ripple and its focus ring take the inherited `color`.
- [Sizes](https://3mo-esolutions.github.io/web-components/?path=/story/actions-icon-button--sizes) — The button scales with its `font-size`, 20px by default.
- [Dense](https://3mo-esolutions.github.io/web-components/?path=/story/actions-icon-button--dense) — `dense` halves the padding around the icon, for tight spots such as a field or a table cell.
- [Disabled](https://3mo-esolutions.github.io/web-components/?path=/story/actions-icon-button--disabled) — A disabled button fades and ignores presses.
- [Icon Slot](https://3mo-esolutions.github.io/web-components/?path=/story/actions-icon-button--icon-slot) — The `icon` slot takes any content in place of the Material icon.
- [Parts](https://3mo-esolutions.github.io/web-components/?path=/story/actions-icon-button--parts) — The `button`, `ripple` and `focus-ring` parts can be restyled or hidden from outside.

## Accessibility

It does not pass `aria-label` on to its button yet, so its name is the name of its icon, such as "more_vert".

## API

### `mo-icon-button`

#### Properties

| Name | Attribute | Type | Default | Description |
| --- | --- | --- | --- | --- |
| `icon` | `icon` | `MaterialIcon` |  | The icon to display. |
| `disabled` | `disabled` | `boolean` | `false` | Disables the icon-button. |
| `dense` | `dense` | `boolean` | `false` | Reduces the size of the icon-button. |

#### Slots

| Name | Description |
| --- | --- |
| `icon` | Content in place of the icon. |

#### CSS parts

| Name | Description |
| --- | --- |
| `button` | The native button element wrapping the icon-button. |
| `ripple` | The ripple effect of the icon-button. |
| `focus-ring` | The focus ring of the icon-button. |

## Links

- [Documentation](https://3mo-esolutions.github.io/web-components/?path=/docs/actions-icon-button--overview)
- [Changelog](https://3mo-esolutions.github.io/web-components/?path=/docs/actions-icon-button--overview)
- [Source](https://github.com/3mo-esolutions/web-components/tree/main/packages/IconButton)

## License

MIT © 3MO GmbH
