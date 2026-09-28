# Button Group

A web component for segmented rows or columns of buttons with shared corners, separators and one type.

[![npm](https://img.shields.io/npm/v/@3mo/button-group?style=flat-square&color=0077c8)](https://www.npmjs.com/package/@3mo/button-group) [![Documentation](https://img.shields.io/badge/docs-storybook-ff4785?style=flat-square&logo=storybook&logoColor=white)](https://3mo-esolutions.github.io/web-components/?path=/docs/actions-button-group--overview)

Buttons joined into one control, in a row or a column, sharing one type.

## Installation

```sh
npm install @3mo/button-group
```

```ts
import '@3mo/button-group'
```

[Server-side rendering](https://3mo-esolutions.github.io/web-components/?path=/docs/getting-started-installation--overview#server-side-rendering): Renders with Lit SSR and hydrates. In SSR all buttons should get their type explicitly.

## Usage

```html
<mo-button-group type='outlined' direction='horizontal'>
	<mo-button>Day</mo-button>
	<mo-button>Week</mo-button>
	<mo-button>Month</mo-button>
</mo-button-group>
```

## Examples

- [Types](https://3mo-esolutions.github.io/web-components/?path=/story/actions-button-group--types) — The group's `type` is given to every button in it.
- [Directions](https://3mo-esolutions.github.io/web-components/?path=/story/actions-button-group--directions) — `direction` lays the buttons out in a row or a column, and the reversed ones flip their order.
- [Button Subclasses](https://3mo-esolutions.github.io/web-components/?path=/story/actions-button-group--button-subclasses) — Any subclass of `mo-button` joins the group, such as a `mo-loading-button` waiting on its click handler.
- [Custom Properties](https://3mo-esolutions.github.io/web-components/?path=/story/actions-button-group--custom-properties) — The outer corners and the separator between buttons are custom properties.

## API

### `mo-button-group`

#### Properties

| Name | Attribute | Type | Default | Description |
| --- | --- | --- | --- | --- |
| `direction` | `direction` | `FlexDirection` | `"horizontal"` | The direction of the buttons. |
| `type` | `type` | `ButtonType.Text \| ButtonType.Outlined \| ButtonType.Tonal \| ButtonType.Filled` | `"text"` | The type of the buttons which will be passed down to all buttons. |

#### Slots

| Name | Description |
| --- | --- |
| (default) | The buttons: `mo-button`s or subclasses of it. |

#### CSS custom properties

| Name | Description |
| --- | --- |
| `--mo-button-group-border-radius` | The border radius of the buttons. |
| `--mo-button-group-separator-color` | The color of the separator between buttons. |

## Links

- [Documentation](https://3mo-esolutions.github.io/web-components/?path=/docs/actions-button-group--overview)
- [Changelog](https://3mo-esolutions.github.io/web-components/?path=/docs/actions-button-group--overview)
- [Source](https://github.com/3mo-esolutions/web-components/tree/main/packages/ButtonGroup)

## License

MIT © 3MO GmbH