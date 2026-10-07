# Dialog

Web components for modal dialogs and application pages with a heading, actions and sizes, built on Material Web.

[![npm](https://img.shields.io/npm/v/@3mo/dialog?style=flat-square&color=0077c8)](https://www.npmjs.com/package/@3mo/dialog) [![Documentation](https://img.shields.io/badge/docs-storybook-ff4785?style=flat-square&logo=storybook&logoColor=white)](https://3mo-esolutions.github.io/web-components/?path=/docs/layout-dialog--overview)

A modal dialog with a heading, content and actions, usually rendered by a dialog component.

## Installation

```sh
npm install @3mo/dialog
```

```ts
import '@3mo/dialog'
```

## Usage

```html
<mo-button type='outlined' @click=${() => setOpen(true)}>Discard draft</mo-button>
<mo-dialog heading='Discard draft?' primaryButtonText='Discard' secondaryButtonText='Keep editing'
	?open=${open}
	@openChange=${(event: CustomEvent<boolean>) => setOpen(event.detail)}
>
	The draft and its attachments will be deleted.
</mo-dialog>
```

## Examples

- [Sizes](https://3mo-esolutions.github.io/web-components/?path=/story/layout-dialog--sizes) — `small`, `medium` and `large` set the width, and `large` also fills the height; without a size the dialog fits its content.
- [Scrollable](https://3mo-esolutions.github.io/web-components/?path=/story/layout-dialog--scrollable) — Content taller than the window scrolls between the header and the footer, and a select field's options still open over it.
- [Action Slots](https://3mo-esolutions.github.io/web-components/?path=/story/layout-dialog--action-slots) — The `primaryAction` and `secondaryAction` slots take buttons of your own in place of the button texts.
- [Header Actions](https://3mo-esolutions.github.io/web-components/?path=/story/layout-dialog--header-actions) — The `action` slot adds to the header, before the close button.
- [Footer](https://3mo-esolutions.github.io/web-components/?path=/story/layout-dialog--footer) — The `footer` slot fills the footer beside the actions.
- [Blocking](https://3mo-esolutions.github.io/web-components/?path=/story/layout-dialog--blocking) — A `blocking` dialog has no close button and ignores Escape and the backdrop, so only one of its actions closes it.
- [Auto Focus](https://3mo-esolutions.github.io/web-components/?path=/story/layout-dialog--auto-focus) — The field marked `autofocus` takes the focus as the dialog opens.
- [Bound To Window](https://3mo-esolutions.github.io/web-components/?path=/story/layout-dialog--bound-to-window) — Opened in a tab of its own, as "Open as Tab" in the header does, a dialog is laid out as a page filling the window.
- [Custom Properties](https://3mo-esolutions.github.io/web-components/?path=/story/layout-dialog--custom-properties) — The host's `background` colors the surface, and custom properties color the heading, the content and the backdrop.
- [Parts](https://3mo-esolutions.github.io/web-components/?path=/story/layout-dialog--parts) — The `header`, `heading`, `content` and `footer` parts can be styled from outside.
- [Dialog Component](https://3mo-esolutions.github.io/web-components/?path=/story/layout-dialog--dialog-component) — An application writes a dialog as a component whose template holds the `mo-dialog`, and `confirm()` opens it.
- [Fetchable Dialog](https://3mo-esolutions.github.io/web-components/?path=/story/layout-dialog--fetchable-dialog) — A `mo-fetchable-dialog` in a `FetchableDialogComponent` stays loading until the entity of the given `id` is fetched.
- [Split Button Action](https://3mo-esolutions.github.io/web-components/?path=/story/layout-dialog--split-button-action) — A split button can be the primary action: its main button spins while the action runs, and its menu offers variants.

## Accessibility

A native modal `dialog`, built on the Material Web dialog, so the page behind it is inert and `Tab` stays inside. It is named by
its `heading`, rendered as an `h2`, and the element with `autofocus` inside takes focus as it opens.

| Key | Does |
| --- | --- |
| `Escape` | Cancels, unless the dialog is `blocking`: a dialog of its own closes and fires `openChange`, one in a dialog component runs the component's cancellation. |
| `Enter` | Runs the primary action, with `primaryOnEnter`. |

## API

### `mo-dialog`

#### Properties

| Name | Attribute | Type | Default | Description |
| --- | --- | --- | --- | --- |
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
| `dialog` | The native dialog element. |
| `header` | The header, holding the heading and the header actions. |
| `heading` | Dialog heading |
| `content` | Dialog content |
| `footer` | The footer, holding the actions and the footer slot. |

### `mo-page`

#### Properties

| Name | Attribute | Type | Default | Description |
| --- | --- | --- | --- | --- |
| `heading` | `heading` | `string` | `""` | The page heading |
| `fullHeight` | `fullHeight` | `boolean` | `false` | Whether the page should take up the full height of the viewport |
| `headerHidden` | `headerHidden` | `boolean` | `false` | Whether the page header should be hidden |

#### Events

| Name | Detail | Description |
| --- | --- | --- |
| `pageHeadingChange` | `string` | Dispatched when the page heading changes |

#### Slots

| Name | Description |
| --- | --- |
| (default) | The page content |
| `heading` | The page heading |
| `action` | The page action |

#### CSS parts

| Name | Description |
| --- | --- |
| `header` | The page header |
| `heading` | The page heading |
| `action` | The page action |

## Links

- [Documentation](https://3mo-esolutions.github.io/web-components/?path=/docs/layout-dialog--overview)
- [Changelog](https://3mo-esolutions.github.io/web-components/?path=/docs/layout-dialog--overview)
- [Source](https://github.com/3mo-esolutions/web-components/tree/main/packages/Dialog)

## License

MIT © 3MO GmbH
