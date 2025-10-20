# Fetchable Dialog

A web component for dialogs that fetch their content and stay in a loading state until it arrives.

[![npm](https://img.shields.io/npm/v/@3mo/fetchable-dialog?style=flat-square&color=0077c8)](https://www.npmjs.com/package/@3mo/fetchable-dialog)

A dialog that fetches what it shows and stays in its loading state until it arrives.

## Installation

```sh
npm install @3mo/fetchable-dialog
```

```ts
import '@3mo/fetchable-dialog'
```

## API

### `mo-fetchable-dialog`

#### Properties

| Name | Attribute | Type | Default | Description |
| --- | --- | --- | --- | --- |
| `fetch` | `fetch` | `() => T \| Promise<T>` |  | Fetches what the dialog shows, again whenever it is replaced. |
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
| `--mo-dialog-backdrop` | Background of the dialog backdrop |
| `--mo-dialog-divider-color` | Color of the dialog divider |

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

- [Source](https://github.com/3mo-esolutions/web-components/tree/main/packages/FetchableDialog)

## License

MIT © 3MO GmbH