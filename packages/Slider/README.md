# Slider

Web components for sliders that pick a single value or a range, continuous or in discrete steps, built on Material Web.

[![npm](https://img.shields.io/npm/v/@3mo/slider?style=flat-square&color=0077c8)](https://www.npmjs.com/package/@3mo/slider) [![Documentation](https://img.shields.io/badge/docs-storybook-ff4785?style=flat-square&logo=storybook&logoColor=white)](https://3mo-esolutions.github.io/web-components/?path=/docs/inputs-slider--overview)

`mo-slider` — A slider for choosing a number from a range by dragging a thumb.

`mo-range-slider` — A slider with two thumbs for choosing a range of numbers.

## Installation

```sh
npm install @3mo/slider
```

```ts
import '@3mo/slider'
```

## Usage

```html
<mo-slider value='15' min='0' max='100' step='1'></mo-slider>
```

## Examples

- [Discrete](https://3mo-esolutions.github.io/web-components/?path=/story/inputs-slider--discrete) — `discrete` shows the value above the thumb while it is dragged, and `ticks` marks every `step`.
- [Disabled](https://3mo-esolutions.github.io/web-components/?path=/story/inputs-slider--disabled) — A disabled slider turns gray and ignores input.
- [Custom Properties](https://3mo-esolutions.github.io/web-components/?path=/story/inputs-slider--custom-properties) — `--mo-slider-accent-color` colors the active track, the thumb and the value label.
- [Parts](https://3mo-esolutions.github.io/web-components/?path=/story/inputs-slider--parts) — The `thumb` part can be restyled from outside.

### Range Slider

- [Default](https://3mo-esolutions.github.io/web-components/?path=/story/inputs-range-slider--default)
- [Discrete](https://3mo-esolutions.github.io/web-components/?path=/story/inputs-range-slider--discrete) — `discrete` shows the values above the thumbs while they are dragged, and `ticks` marks every `step`.
- [Disabled](https://3mo-esolutions.github.io/web-components/?path=/story/inputs-range-slider--disabled) — A disabled range slider turns gray and ignores input.
- [Custom Properties](https://3mo-esolutions.github.io/web-components/?path=/story/inputs-range-slider--custom-properties) — `--mo-slider-accent-color` colors the active track, the thumbs and the value labels.
- [Parts](https://3mo-esolutions.github.io/web-components/?path=/story/inputs-range-slider--parts) — The `thumb` part styles both thumbs from outside.

## API

### `mo-slider`

#### Properties

| Name | Attribute | Type | Default | Description |
| --- | --- | --- | --- | --- |
| `value` | `value` | `number` | `0` | The selected number |
| `disabled` | `disabled` | `boolean` | `false` | Turns the slider gray and makes it ignore input |
| `discrete` | `discrete` | `boolean` | `false` | Shows the value above the thumb while it is dragged |
| `ticks` | `ticks` | `boolean` | `false` | Marks every step on the track |
| `step` | `step` | `number \| undefined` |  | The distance between two selectable values, 1 by default |
| `min` | `min` | `number \| undefined` |  | The smallest selectable value, 0 by default |
| `max` | `max` | `number \| undefined` |  | The largest selectable value, 100 by default |

#### Events

| Name | Detail | Description |
| --- | --- | --- |
| `input` | `T` | Dispatched with the value while the thumb is dragged |
| `change` | `T` | Dispatched with the value when the thumb is released |

#### CSS custom properties

| Name | Description |
| --- | --- |
| `--mo-slider-accent-color` | The color of the active track, the thumb and the value label |

#### CSS parts

| Name | Description |
| --- | --- |
| `thumb` | The handle that is dragged |

### `mo-range-slider`

#### Properties

| Name | Attribute | Type | Default | Description |
| --- | --- | --- | --- | --- |
| `value` | `value` | `RangeSliderValue` | `[0,0]` | The start and end of the selected range, e.g. "[20, 80]" |
| `disabled` | `disabled` | `boolean` | `false` | Turns the slider gray and makes it ignore input |
| `discrete` | `discrete` | `boolean` | `false` | Shows the values above the thumbs while they are dragged |
| `ticks` | `ticks` | `boolean` | `false` | Marks every step on the track |
| `step` | `step` | `number \| undefined` |  | The distance between two selectable values, 1 by default |
| `min` | `min` | `number \| undefined` |  | The smallest selectable value, 0 by default |
| `max` | `max` | `number \| undefined` |  | The largest selectable value, 100 by default |

#### Events

| Name | Detail | Description |
| --- | --- | --- |
| `input` | `T` | Dispatched with the value while a thumb is dragged |
| `change` | `T` | Dispatched with the value when a thumb is released |

#### CSS custom properties

| Name | Description |
| --- | --- |
| `--mo-slider-accent-color` | The color of the active track, the thumbs and the value labels |

#### CSS parts

| Name | Description |
| --- | --- |
| `thumb` | The handles that are dragged |

## Links

- [Documentation](https://3mo-esolutions.github.io/web-components/?path=/docs/inputs-slider--overview)
- [Changelog](https://3mo-esolutions.github.io/web-components/?path=/docs/inputs-slider--overview)
- [Source](https://github.com/3mo-esolutions/web-components/tree/main/packages/Slider)

## License

MIT © 3MO GmbH
