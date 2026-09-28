# Swap

A web component for swapping several pieces of content in one box, transitioning from one to the next.

[![npm](https://img.shields.io/npm/v/@3mo/swap?style=flat-square&color=0077c8)](https://www.npmjs.com/package/@3mo/swap) [![Documentation](https://img.shields.io/badge/docs-storybook-ff4785?style=flat-square&logo=storybook&logoColor=white)](https://3mo-esolutions.github.io/web-components/?path=/docs/data-swap--overview)

A box that transitions between several pieces of content, such as the icon or label of a button, showing one at a time.
It takes the size of the largest, so it never resizes while it transitions.

## Installation

```sh
npm install @3mo/swap
```

```ts
import '@3mo/swap'
```

[Server-side rendering](https://3mo-esolutions.github.io/web-components/?path=/docs/getting-started-installation--overview#server-side-rendering): Renders with Lit SSR and hydrates.

## Usage

```html
<mo-swap>
	<mo-icon icon='content_copy'></mo-icon>
	<mo-icon slot='success' icon='check' style='color: var(--mo-color-green)'></mo-icon>
	<mo-icon slot='error' icon='error_outline' style='color: var(--mo-color-red)'></mo-icon>
</mo-swap>
```

## Examples

- [Transient Feedback](https://3mo-esolutions.github.io/web-components/?path=/story/data-swap--transient-feedback) — `flash()` shows a value for `flashDuration` milliseconds and returns to the one it interrupted, confirming an action in the control that triggered it.
- [Toggle](https://3mo-esolutions.github.io/web-components/?path=/story/data-swap--toggle) — Two alternating slots follow a `value` bound to the state that already knows whether the player runs or the theme is dark.
- [Multiple Values](https://3mo-esolutions.github.io/web-components/?path=/story/data-swap--multiple-values) — Values are named, not counted, so a swap holds as many as it needs, here the four states of an upload.
- [Custom Properties](https://3mo-esolutions.github.io/web-components/?path=/story/data-swap--custom-properties) — Both ends of the transition are custom properties, so a swap can rotate, flip or only fade instead of scaling down.

## API

### `mo-swap`

#### Properties

| Name | Attribute | Type | Default | Description |
| --- | --- | --- | --- | --- |
| `values` |  | `string[]` |  | Every value the swap can take, being the empty one of the default slot and the "slot" of each child. The current value is always among them, so that content assigned to it after the fact appears without another update. |
| `value` | `value` | `string` | `""` | The name of the slot which is shown. Empty, which is the default, shows the default slot. |
| `flashDuration` | `flashDuration` | `number` | `1500` | The milliseconds a value flashed through "flash()" is shown before the previous one is restored. |

#### Events

| Name | Detail | Description |
| --- | --- | --- |
| `change` | `string` | Dispatched with the new value whenever another slot is shown. |

#### Slots

| Name | Description |
| --- | --- |
| (default) | Shown as long as "value" is empty. |
| `name` | Shown while "value" is the name of the slot. Setting "value" to "success" shows "slot=success". |

#### CSS custom properties

| Name | Description |
| --- | --- |
| `--mo-swap-transition-duration` | The duration of the transition between two values. Defaults to "250ms". |
| `--mo-swap-transition-easing` | The easing of the transition between two values. |
| `--mo-swap-inactive-opacity` | The opacity of the slots which are not shown. Defaults to "0". |
| `--mo-swap-inactive-transform` | The transform of the slots which are not shown. Defaults to a slight scale down. |

## Links

- [Documentation](https://3mo-esolutions.github.io/web-components/?path=/docs/data-swap--overview)
- [Changelog](https://3mo-esolutions.github.io/web-components/?path=/docs/data-swap--overview)
- [Source](https://github.com/3mo-esolutions/web-components/tree/main/packages/Swap)

## License

MIT © 3MO GmbH