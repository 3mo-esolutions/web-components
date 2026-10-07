# Circular Progress

A web component for circular progress indicators that show a value or spin indefinitely, built on Material Web.

[![npm](https://img.shields.io/npm/v/@3mo/circular-progress?style=flat-square&color=0077c8)](https://www.npmjs.com/package/@3mo/circular-progress) [![Documentation](https://img.shields.io/badge/docs-storybook-ff4785?style=flat-square&logo=storybook&logoColor=white)](https://3mo-esolutions.github.io/web-components/?path=/docs/feedback-circular-progress--overview)

A circular indicator of progress, or of activity of unknown length.

## Installation

```sh
npm install @3mo/circular-progress
```

```ts
import '@3mo/circular-progress'
```

## Usage

```html
<mo-circular-progress></mo-circular-progress>
```

## Examples

- [Progress](https://3mo-esolutions.github.io/web-components/?path=/story/feedback-circular-progress--progress) — `progress` from `0` to `1` fills the circle; without it, the indicator spins for work of unknown length.
- [Size](https://3mo-esolutions.github.io/web-components/?path=/story/feedback-circular-progress--size) — The indicator is 48px square by default and scales with `width` and `height`.
- [Custom Properties](https://3mo-esolutions.github.io/web-components/?path=/story/feedback-circular-progress--custom-properties) — `--mo-circular-progress-accent-color` colors the indicator and `--mo-circular-progress-track-color` the track behind it.

## API

### `mo-circular-progress`

#### Properties

| Name | Attribute | Type | Default | Description |
| --- | --- | --- | --- | --- |
| `progress` | `progress` | `number \| undefined` |  | The progress from `0` to `1`. Unset to display an indeterminate progress indicator. |

#### CSS custom properties

| Name | Description |
| --- | --- |
| `--mo-circular-progress-accent-color` | The color of the indicator, the accent color by default. |
| `--mo-circular-progress-track-color` | The color of the track behind the indicator, transparent by default. |

## Links

- [Documentation](https://3mo-esolutions.github.io/web-components/?path=/docs/feedback-circular-progress--overview)
- [Changelog](https://3mo-esolutions.github.io/web-components/?path=/docs/feedback-circular-progress--overview)
- [Source](https://github.com/3mo-esolutions/web-components/tree/main/packages/CircularProgress)

## License

MIT © 3MO GmbH
