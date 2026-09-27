# Loading Dialog

A web component for dialogs with a loading state that blurs the content behind a spinner and a heading.

[![npm](https://img.shields.io/npm/v/@3mo/loading-dialog?style=flat-square&color=0077c8)](https://www.npmjs.com/package/@3mo/loading-dialog) [![Documentation](https://img.shields.io/badge/docs-storybook-ff4785?style=flat-square&logo=storybook&logoColor=white)](https://3mo-esolutions.github.io/web-components/?path=/docs/feedback-loading-dialog--overview)

A dialog that blurs its content behind a spinner while it is loading.

## Installation

```sh
npm install @3mo/loading-dialog
```

```ts
import '@3mo/loading-dialog'
```

## Examples

- [Default](https://3mo-esolutions.github.io/web-components/?path=/story/feedback-loading-dialog--default) — Press Save: while `loading` is set, the content blurs behind a spinner and the heading reads "Loading ...".
- [Loading Slot](https://3mo-esolutions.github.io/web-components/?path=/story/feedback-loading-dialog--loading-slot) — `loadingHeading` replaces the heading while loading and the `loading` slot the spinner; the content blurs behind it whatever the background.

## API

### `mo-loading-dialog`

#### Properties

| Name | Attribute | Type | Default | Description |
| --- | --- | --- | --- | --- |
| `loading` | `loading` | `boolean` | `false` | Whether the dialog is loading, which blurs the content and shows the loading slot. |
| `loadingHeading` | `loadingHeading` | `string` | `"t('Loading')"` | The heading while loading, followed by an ellipsis; "Loading" by default. |
| `size` | `size` | `DialogSize \| undefined` |  | `small`, `medium` or `large`. Without one, the dialog fits its content. |
| `blocking` | `blocking` | `boolean` | `false` | Hides the close button and ignores Escape and the backdrop, so that only an action closes the dialog. |
| `primaryButtonText` | `primaryButtonText` | `string \| undefined` |  | The text of the default primary button. |
| `secondaryButtonText` | `secondaryButtonText` | `string \| undefined` |  | The text of the default secondary button. |
| `open` | `open` | `boolean` | `false` | Whether the dialog is open. |
| `handleAction` |  | `(key: DialogActionKey) => void \| Promise<void>` |  | Called with the action taken: primary, secondary or cancellation. A dialog component sets it; without one, the dialog closes itself. |
| `primaryOnEnter` | `primaryOnEnter` | `boolean` | `false` | Runs the primary action when Enter is pressed. |
| `manualClose` | `manualClose` | `boolean` | `false` | Keeps the dialog open after its primary and secondary actions, leaving the closing to them. |
| `heading` | `heading` | `string` | `""` | The heading in the header. |

#### Events

| Name | Detail | Description |
| --- | --- | --- |
| `openChange` | `boolean` | Dispatched with the new state whenever the dialog opens or closes. |
| `pageHeadingChange` | `string` | Dispatched when the dialog heading changes |
| `requestPopup` | `void` | Dispatched when the dialog is requested to be popped up |
| `scroll` |  |  |

#### Slots

| Name | Description |
| --- | --- |
| `loading` | Shown over the content while loading, a circular progress by default. |
| (default) | Content of the dialog |
| `primaryAction` | Primary action of the dialog |
| `secondaryAction` | Secondary action of the dialog |
| `action` | Additional actions of the dialog which are displayed in the header |
| `footer` | Footer of the dialog |

#### CSS custom properties

| Name | Description |
| --- | --- |
| `--mo-dialog-heading-color` | Color of the dialog heading |
| `--mo-dialog-content-color` | Color of the dialog content |
| `--mo-dialog-backdrop` | Background of the dialog backdrop |
| `--mo-dialog-divider-color` | Color of the dialog divider |
| `--mo-dialog-heading-line-height` | Line height of the dialog heading |

#### CSS parts

| Name | Description |
| --- | --- |
| `loading` | The container of the loading slot, laid over the content. |
| `dialog` | The native dialog element. |
| `header` | The header, holding the heading and the header actions. |
| `heading` | Dialog heading |
| `content` | Dialog content |
| `footer` | The footer, holding the actions and the footer slot. |

## Links

- [Documentation](https://3mo-esolutions.github.io/web-components/?path=/docs/feedback-loading-dialog--overview)
- [Changelog](https://3mo-esolutions.github.io/web-components/?path=/docs/feedback-loading-dialog--overview)
- [Source](https://github.com/3mo-esolutions/web-components/tree/main/packages/LoadingDialog)

## License

MIT © 3MO GmbH