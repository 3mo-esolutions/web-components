# Split Button

A web component for split buttons that join a main button with an arrow opening a menu of further actions.

[![npm](https://img.shields.io/npm/v/@3mo/split-button?style=flat-square&color=0077c8)](https://www.npmjs.com/package/@3mo/split-button) [![Documentation](https://img.shields.io/badge/docs-storybook-ff4785?style=flat-square&logo=storybook&logoColor=white)](https://3mo-esolutions.github.io/web-components/?path=/docs/actions-split-button--overview)

A main button joined with an arrow button that opens a menu of further actions.

## Installation

```sh
npm install @3mo/split-button
```

```ts
import '@3mo/split-button'
```

[Server-side rendering](https://3mo-esolutions.github.io/web-components/?path=/docs/getting-started-installation--overview#server-side-rendering): Renders with Lit SSR and hydrates.

## Usage

```html
<mo-split-button type='filled'>
	<mo-button startIcon='merge'>Merge</mo-button>
	<mo-menu-item slot='more'>Squash and merge</mo-menu-item>
	<mo-menu-item slot='more'>Rebase and merge</mo-menu-item>
</mo-split-button>
```

## Examples

- [Types](https://3mo-esolutions.github.io/web-components/?path=/story/actions-split-button--types) — The `type` is given to the main button and the arrow alike.
- [Disabled](https://3mo-esolutions.github.io/web-components/?path=/story/actions-split-button--disabled) — `disabled` disables the arrow; disable the main button on its own to fade it too.
- [Menu Items](https://3mo-esolutions.github.io/web-components/?path=/story/actions-split-button--menu-items) — The menu takes any menu items, icons and separators included.
- [Button Subclasses](https://3mo-esolutions.github.io/web-components/?path=/story/actions-split-button--button-subclasses) — Any subclass of `mo-button` can be the main button, such as a `mo-loading-button` waiting on its click handler.

## API

### `mo-split-button`

#### Properties

| Name | Attribute | Type | Default | Description |
| --- | --- | --- | --- | --- |
| `open` | `open` | `boolean` | `false` | Whether the menu is open. |
| `type` | `type` | `ButtonType.Text \| ButtonType.Outlined \| ButtonType.Tonal \| ButtonType.Filled` | `"filled"` | The type of the buttons, which is passed down to the button-group. |
| `disabled` | `disabled` | `boolean` | `false` | Whether the "more" button is disabled. |

#### Events

| Name | Detail | Description |
| --- | --- | --- |
| `openChange` | `boolean` | Dispatched when the menu is opened or closed. |

#### Slots

| Name | Description |
| --- | --- |
| (default) | The main button, a `mo-button` or a subclass of it. |
| `more` | The menu items of the "more" menu. |

## Links

- [Documentation](https://3mo-esolutions.github.io/web-components/?path=/docs/actions-split-button--overview)
- [Changelog](https://3mo-esolutions.github.io/web-components/?path=/docs/actions-split-button--overview)
- [Source](https://github.com/3mo-esolutions/web-components/tree/main/packages/SplitButton)

## License

MIT © 3MO GmbH