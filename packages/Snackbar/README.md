# Snackbar

A web component for timed snackbar notifications that stack at the screen edge and pause while being read.

[![npm](https://img.shields.io/npm/v/@3mo/snackbar?style=flat-square&color=0077c8)](https://www.npmjs.com/package/@3mo/snackbar) [![Documentation](https://img.shields.io/badge/docs-storybook-ff4785?style=flat-square&logo=storybook&logoColor=white)](https://3mo-esolutions.github.io/web-components/?path=/docs/feedback-snackbar--overview)

A short update about an app process, shown at the anchored edge of the screen.

## Installation

```sh
npm install @3mo/snackbar
```

```ts
import '@3mo/snackbar'
```

[Server-side rendering](https://3mo-esolutions.github.io/web-components/?path=/docs/getting-started-installation--overview#server-side-rendering): Renders with Lit SSR and hydrates.

## Usage

```html
<mo-button @click=${() => Snackbar.notifyInfo('Changes saved')}>Save</mo-button>
```

## Examples

- [Types](https://3mo-esolutions.github.io/web-components/?path=/story/feedback-snackbar--types) — Each type brings its own color and icon; a warning stays 10 seconds and an error 15, where the others go after 5.
- [Actions](https://3mo-esolutions.github.io/web-components/?path=/story/feedback-snackbar--actions) — `actions` add buttons to the snack-bar, and each one keeps it open 2.5 seconds longer.
- [Stacking](https://3mo-esolutions.github.io/web-components/?path=/story/feedback-snackbar--stacking) — Up to three snack-bars lay out as a list; more pile up behind the third.

## Accessibility

A `status`, or an `alert` for a warning or an error. It stays 5 seconds, 10 for a warning and 15 for an error, plus 2.5 per action, and hovering or focusing the snackbars holds them.

## API

### `mo-snackbar`

#### Properties

| Name | Attribute | Type | Default | Description |
| --- | --- | --- | --- | --- |
| `open` | `open` | `boolean` | `false` | Whether the snack-bar is currently shown |
| `type` | `type` | `NotificationType` | `"info"` | The notification type which controls the accent color and icon |
| `text` | `text` | `string` | `""` | The message, taken from the notification. |
| `notification` | `notification` | `Notification` |  | The notification shown, with its message, type and actions; `Snackbar.notify…` sets it. |

#### CSS custom properties

| Name | Description |
| --- | --- |
| `--mo-snackbar-color` | The accent color of the snack-bar. Defaults to a color derived from the notification type. |

#### CSS parts

| Name | Description |
| --- | --- |
| `surface` | The snack-bar's surface |

## Links

- [Documentation](https://3mo-esolutions.github.io/web-components/?path=/docs/feedback-snackbar--overview)
- [Changelog](https://3mo-esolutions.github.io/web-components/?path=/docs/feedback-snackbar--overview)
- [Source](https://github.com/3mo-esolutions/web-components/tree/main/packages/Snackbar)

## License

MIT © 3MO GmbH