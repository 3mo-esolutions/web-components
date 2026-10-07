# Linear Progress

A web component for linear progress bars with determinate, indeterminate and buffered modes, built on Material Web.

[![npm](https://img.shields.io/npm/v/@3mo/linear-progress?style=flat-square&color=0077c8)](https://www.npmjs.com/package/@3mo/linear-progress) [![Documentation](https://img.shields.io/badge/docs-storybook-ff4785?style=flat-square&logo=storybook&logoColor=white)](https://3mo-esolutions.github.io/web-components/?path=/docs/feedback-linear-progress--overview)

A horizontal bar showing progress, or activity of unknown length.

## Installation

```sh
npm install @3mo/linear-progress
```

```ts
import '@3mo/linear-progress'
```

## Usage

```html
<mo-linear-progress></mo-linear-progress>
```

## Examples

- [Progress](https://3mo-esolutions.github.io/web-components/?path=/story/feedback-linear-progress--progress) — `progress` from `0` to `1` fills the bar; with neither `progress` nor `buffer`, it runs for work of unknown length.
- [Buffer](https://3mo-esolutions.github.io/web-components/?path=/story/feedback-linear-progress--buffer) — `buffer` marks what is loaded ahead of the progress, like the buffered part of a video.
- [Styling](https://3mo-esolutions.github.io/web-components/?path=/story/feedback-linear-progress--styling) — The bar is 4px high by default; `height` and `border-radius` restyle it, e.g. into a pill that carries its label.
- [Custom Properties](https://3mo-esolutions.github.io/web-components/?path=/story/feedback-linear-progress--custom-properties) — `--mo-linear-progress-accent-color` colors the bar and `--mo-linear-progress-track-color` the track behind it.

## API

### `mo-linear-progress`

#### Properties

| Name | Attribute | Type | Default | Description |
| --- | --- | --- | --- | --- |
| `progress` | `progress` | `number \| undefined` |  | The progress from `0` to `1`. With neither this nor `buffer` set, the progress is indeterminate. |
| `buffer` | `buffer` | `number \| undefined` |  | The buffered part from `0` to `1`, shown ahead of the progress. |
| `reverse` | `reverse` | `boolean` | `false` | Reverses the direction of the progress |

#### CSS custom properties

| Name | Description |
| --- | --- |
| `--mo-linear-progress-accent-color` | The color of the progress |
| `--mo-linear-progress-track-color` | The color of the track |

## Links

- [Documentation](https://3mo-esolutions.github.io/web-components/?path=/docs/feedback-linear-progress--overview)
- [Changelog](https://3mo-esolutions.github.io/web-components/?path=/docs/feedback-linear-progress--overview)
- [Source](https://github.com/3mo-esolutions/web-components/tree/main/packages/LinearProgress)

## License

MIT © 3MO GmbH
