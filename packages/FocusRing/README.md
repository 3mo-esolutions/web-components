# Focus Ring

A web component for keyboard focus rings in the theme's accent color, attachable to any element, built on Material Web.

[![npm](https://img.shields.io/npm/v/@3mo/focus-ring?style=flat-square&color=0077c8)](https://www.npmjs.com/package/@3mo/focus-ring) [![Documentation](https://img.shields.io/badge/docs-storybook-ff4785?style=flat-square&logo=storybook&logoColor=white)](https://3mo-esolutions.github.io/web-components/?path=/docs/foundations-focus-ring--overview)

A ring that marks keyboard focus on its parent, or on the element it is attached to.

## Installation

```sh
npm install @3mo/focus-ring
```

```ts
import '@3mo/focus-ring'
```

## Usage

```html
<div tabindex='0' style='position: relative; padding: 16px; border: 1px solid var(--mo-color-transparent-gray-3); border-radius: 4px; outline: none'>
	Invoice #1024
	<mo-focus-ring></mo-focus-ring>
</div>
```

## Examples

- [Inward](https://3mo-esolutions.github.io/web-components/?path=/story/foundations-focus-ring--inward) — `inward` draws the ring inside the element, where an outer one would be clipped or overlap its neighbours.
- [Visible](https://3mo-esolutions.github.io/web-components/?path=/story/foundations-focus-ring--visible) — `visible` shows the ring without focus, e.g. on the active option of a list whose focus stays in an input.
- [Control](https://3mo-esolutions.github.io/web-components/?path=/story/foundations-focus-ring--control) — `for` takes the id of the element whose focus to follow in place of the parent, which the ring keeps surrounding - focus the input.
- [Custom Properties](https://3mo-esolutions.github.io/web-components/?path=/story/foundations-focus-ring--custom-properties) — `--mo-focus-ring-color` replaces the accent color.

## API

### `mo-focus-ring`

#### Properties

| Name | Attribute | Type | Default | Description |
| --- | --- | --- | --- | --- |
| `visible` | `visible` | `boolean` |  | Makes the focus ring visible. |
| `inward` | `inward` | `boolean` |  | Makes the focus ring animate inwards instead of outwards. |
| `htmlFor` |  | `string \| null` |  | Reflects the value of the `for` attribute, which is the ID of the element's associated control. Use this when the elements's associated control is not its parent. To manually control an element, set its `for` attribute to `""`. |
| `control` |  |  |  | The element whose focus the ring follows, in place of its parent. |
|  | `for` |  |  | The id of the element whose focus the ring follows, in place of its parent. |

#### Events

| Name | Detail | Description |
| --- | --- | --- |
| `visibility-changed` |  | Fired whenever `visible` changes. |

#### CSS custom properties

| Name | Description |
| --- | --- |
| `--mo-focus-ring-color` | The color of the focus ring, defaults to var(--mo-color-accent). |

## Links

- [Documentation](https://3mo-esolutions.github.io/web-components/?path=/docs/foundations-focus-ring--overview)
- [Changelog](https://3mo-esolutions.github.io/web-components/?path=/docs/foundations-focus-ring--overview)
- [Source](https://github.com/3mo-esolutions/web-components/tree/main/packages/FocusRing)

## License

MIT © 3MO GmbH