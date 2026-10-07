# Copy Icon Button

A web component for icon buttons that copy a value to the clipboard and confirm it in place with a check mark.

[![npm](https://img.shields.io/npm/v/@3mo/copy-icon-button?style=flat-square&color=0077c8)](https://www.npmjs.com/package/@3mo/copy-icon-button) [![Documentation](https://img.shields.io/badge/docs-storybook-ff4785?style=flat-square&logo=storybook&logoColor=white)](https://3mo-esolutions.github.io/web-components/?path=/docs/actions-copy-icon-button--overview)

An icon-button which writes a value to the clipboard and confirms it by briefly turning into a check mark.

## Installation

```sh
npm install @3mo/copy-icon-button
```

```ts
import '@3mo/copy-icon-button'
```

## Usage

```html
<mo-copy-icon-button value='https://www.3mo.de' label='Copy link' feedbackDuration='1500'></mo-copy-icon-button>
```

## Examples

- [Next To A Value](https://3mo-esolutions.github.io/web-components/?path=/story/actions-copy-icon-button--next-to-a-value) — Beside the value it copies, the button confirms in place, and a `label` for each tells them apart on hover and to a screen reader.
- [Icons](https://3mo-esolutions.github.io/web-components/?path=/story/actions-copy-icon-button--icons) — `icon`, `successIcon` and `errorIcon` pick the Material icon of each state.
- [Slots](https://3mo-esolutions.github.io/web-components/?path=/story/actions-copy-icon-button--slots) — Each state takes its content from a slot, so a button that copies a color can show it.
- [When Copying Fails](https://3mo-esolutions.github.io/web-components/?path=/story/actions-copy-icon-button--when-copying-fails) — A clipboard that refuses the value, as outside a secure context, or an empty value ends in the error state and fires `copyError` with the reason.
- [Dense And Disabled](https://3mo-esolutions.github.io/web-components/?path=/story/actions-copy-icon-button--dense-and-disabled) — `dense` reduces the size, and a disabled button ignores presses.
- [Custom Properties](https://3mo-esolutions.github.io/web-components/?path=/story/actions-copy-icon-button--custom-properties) — The colors of success and failure are custom properties.

## Accessibility

The copy is announced in a `status`.

## API

### `mo-copy-icon-button`

#### Properties

| Name | Attribute | Type | Default | Description |
| --- | --- | --- | --- | --- |
| `value` | `value` | `string` | `""` | The text which is written to the clipboard. Copying nothing is treated as a failure. |
| `label` | `label` | `string \| undefined` |  | The tooltip naming what the button copies. Defaults to "Copy" and is dropped when set to an empty string. |
| `icon` | `icon` | `MaterialIcon` | `"content_copy"` | The icon of the resting state. |
| `successIcon` | `successIcon` | `MaterialIcon` | `"check"` | The icon shown after the value has been copied. |
| `errorIcon` | `errorIcon` | `MaterialIcon` | `"error_outline"` | The icon shown when the value could not be copied. |
| `feedbackDuration` | `feedbackDuration` | `number` | `1500` | The milliseconds the outcome is shown before the button returns to its resting state. |
| `disabled` | `disabled` | `boolean` | `false` | Disables the button. |
| `dense` | `dense` | `boolean` | `false` | Reduces the size of the button. |

#### Events

| Name | Detail | Description |
| --- | --- | --- |
| `copy` | `string` | Dispatched with the text which has been written to the clipboard. |
| `copyError` | `Error` | Dispatched with the reason the text could not be written to the clipboard. |

#### Slots

| Name | Description |
| --- | --- |
| `icon` | The content of the resting state. |
| `success-icon` | The content shown after the value has been copied. |
| `error-icon` | The content shown when the value could not be copied. |

#### CSS custom properties

| Name | Description |
| --- | --- |
| `--mo-copy-icon-button-success-color` | The color of the success state. |
| `--mo-copy-icon-button-error-color` | The color of the error state. |

## Links

- [Documentation](https://3mo-esolutions.github.io/web-components/?path=/docs/actions-copy-icon-button--overview)
- [Changelog](https://3mo-esolutions.github.io/web-components/?path=/docs/actions-copy-icon-button--overview)
- [Source](https://github.com/3mo-esolutions/web-components/tree/main/packages/CopyIconButton)

## License

MIT © 3MO GmbH
