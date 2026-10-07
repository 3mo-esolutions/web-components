# Entity Dialog

A web component for dialogs that fetch an entity to create or edit, then save it with Ctrl+S or delete it.

[![npm](https://img.shields.io/npm/v/@3mo/entity-dialog?style=flat-square&color=0077c8)](https://www.npmjs.com/package/@3mo/entity-dialog) [![Documentation](https://img.shields.io/badge/docs-storybook-ff4785?style=flat-square&logo=storybook&logoColor=white)](https://3mo-esolutions.github.io/web-components/?path=/docs/data-entity-dialog--overview)

A dialog that fetches an entity to edit, saves it with its primary button or Ctrl+S, and deletes it with its secondary one.

## Installation

```sh
npm install @3mo/entity-dialog
```

```ts
import '@3mo/entity-dialog'
```

## Examples

- [Default](https://3mo-esolutions.github.io/web-components/?path=/story/data-entity-dialog--default)
- [Create](https://3mo-esolutions.github.io/web-components/?path=/story/data-entity-dialog--create) — Without an `id` the dialog creates a person, fetching nothing and offering no Delete.
- [Generic](https://3mo-esolutions.github.io/web-components/?path=/story/data-entity-dialog--generic) — `GenericEntityDialog` takes the entity, `fetch`, `save`, `delete` and its content as parameters, for a dialog without a class of its own.

## API

### `mo-entity-dialog`

#### Properties

| Name | Attribute | Type | Default | Description |
| --- | --- | --- | --- | --- |
| `preventPrimaryOnCtrlS` | `preventPrimaryOnCtrlS` | `boolean` | `false` | Whether Ctrl+S leaves the entity unsaved. |
| `entity` | `entity` | `TEntity` |  | The entity being edited. Set by the `EntityDialogComponent` rendering the dialog. |
| `save` | `save` | `() => void \| TEntity \| PromiseLike<void \| TEntity>` |  | The function that saves the entity. Set by the `EntityDialogComponent` rendering the dialog. |
| `delete` | `delete` | `(() => void \| PromiseLike<void>) \| undefined` |  | The function that deletes the entity, which adds the Delete button. Set by the `EntityDialogComponent` rendering the dialog. |
| `parameters` | `parameters` | `{ readonly id?: unknown; }` |  | The parameters of the dialog, whose `id` decides between creating and editing. Set by the `EntityDialogComponent` rendering the dialog. |
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

- [Documentation](https://3mo-esolutions.github.io/web-components/?path=/docs/data-entity-dialog--overview)
- [Changelog](https://3mo-esolutions.github.io/web-components/?path=/docs/data-entity-dialog--overview)
- [Source](https://github.com/3mo-esolutions/web-components/tree/main/packages/EntityDialog)

## License

MIT © 3MO GmbH
