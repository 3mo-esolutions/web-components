# Alert

A web component for inline info, success, warning and error messages with a heading, optionally collapsible.

[![npm](https://img.shields.io/npm/v/@3mo/alert?style=flat-square&color=0077c8)](https://www.npmjs.com/package/@3mo/alert) [![Documentation](https://img.shields.io/badge/docs-storybook-ff4785?style=flat-square&logo=storybook&logoColor=white)](https://3mo-esolutions.github.io/web-components/?path=/docs/feedback-alert--overview)

A message that stands out from the page, colored by whether it informs, confirms, warns or reports an error.

## Installation

```sh
npm install @3mo/alert
```

```ts
import '@3mo/alert'
```

## Usage

```html
<mo-alert type='info' heading='Invoices are sent at midnight'>Changes made after that go out with the next day's run.</mo-alert>
```

## Examples

- [Types](https://3mo-esolutions.github.io/web-components/?path=/story/feedback-alert--types) — Each type brings its own color and icon: `info`, `success`, `warning` and `error`.
- [Content](https://3mo-esolutions.github.io/web-components/?path=/story/feedback-alert--content) — Content goes into the default slot, below the heading.
- [Without Heading](https://3mo-esolutions.github.io/web-components/?path=/story/feedback-alert--without-heading) — Without a heading, the content sits next to the icon.
- [Collapsible](https://3mo-esolutions.github.io/web-components/?path=/story/feedback-alert--collapsible) — `collapsible` hides the content behind a button next to the heading, and `open` shows it; `openChange` reports the toggle.
- [Long Text](https://3mo-esolutions.github.io/web-components/?path=/story/feedback-alert--long-text) — Long content wraps and keeps its distance from the icon.
- [Height](https://3mo-esolutions.github.io/web-components/?path=/story/feedback-alert--height) — An alert is as tall as its content; `height: 100%` stretches it, e.g. to match a taller neighbour in a grid.
- [Custom Properties](https://3mo-esolutions.github.io/web-components/?path=/story/feedback-alert--custom-properties) — `--mo-alert-color` replaces the color of the type.
- [Parts](https://3mo-esolutions.github.io/web-components/?path=/story/feedback-alert--parts) — The `heading` part can be restyled from outside.

## Accessibility

An `alert`, whatever its type, so screen readers announce it as soon as it appears.

## API

### `mo-alert`

#### Properties

| Name | Attribute | Type | Default | Description |
| --- | --- | --- | --- | --- |
| `heading` | `heading` | `string \| undefined` |  | The heading of the alert. |
| `type` | `type` | `AlertType` | `"info"` | The type can be 'info', 'success', 'warning', or 'error'. |
| `collapsible` | `collapsible` | `boolean` | `false` | Whether the content can be collapsed under the heading. |
| `open` | `open` | `boolean` | `false` | Whether the content is shown. Only applies when the alert is collapsible and has a heading. |

#### Events

| Name | Detail | Description |
| --- | --- | --- |
| `openChange` | `boolean` | Dispatched when the alert is opened or closed. |

#### Slots

| Name | Description |
| --- | --- |
| (default) | The content of the alert. |

#### CSS custom properties

| Name | Description |
| --- | --- |
| `--mo-alert-color` | The color of the alert, derived from the type by default. |

#### CSS parts

| Name | Description |
| --- | --- |
| `heading` | The heading. |

## Links

- [Documentation](https://3mo-esolutions.github.io/web-components/?path=/docs/feedback-alert--overview)
- [Changelog](https://3mo-esolutions.github.io/web-components/?path=/docs/feedback-alert--overview)
- [Source](https://github.com/3mo-esolutions/web-components/tree/main/packages/Alert)

## License

MIT © 3MO GmbH