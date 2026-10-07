# Standard Dialogs

Web components for ready-made dialogs: alerts, confirmations, text prompts, deletion confirmations and generic ones.

[![npm](https://img.shields.io/npm/v/@3mo/standard-dialogs?style=flat-square&color=0077c8)](https://www.npmjs.com/package/@3mo/standard-dialogs) [![Documentation](https://img.shields.io/badge/docs-storybook-ff4785?style=flat-square&logo=storybook&logoColor=white)](https://3mo-esolutions.github.io/web-components/?path=/docs/feedback-standard-dialogs-generic-dialog--overview)

`mo-generic-dialog` — A dialog with a primary and a secondary action, both configured by its parameters.

`mo-dialog-alert` — A dialog that tells something and closes with one button.

`mo-dialog-deletion` — A dialog that asks to confirm a deletion, then runs it.

## Installation

```sh
npm install @3mo/standard-dialogs
```

```ts
import '@3mo/standard-dialogs'
```

## Usage

```html
<mo-button @click=${() => new GenericDialog({ heading: 'Archive the order?', content: 'Archived orders are hidden from the list.' }).confirm()}>Archive</mo-button>
```

## Examples

- [Actions](https://3mo-esolutions.github.io/web-components/?path=/story/feedback-standard-dialogs-generic-dialog--actions) — `primaryAction` and `secondaryAction` return what `confirm()` resolves to - see the Actions panel.

### Alert Dialog

- [Default](https://3mo-esolutions.github.io/web-components/?path=/story/feedback-standard-dialogs-alert-dialog--default)
- [Content](https://3mo-esolutions.github.io/web-components/?path=/story/feedback-standard-dialogs-alert-dialog--content) — `primaryButtonText` replaces "OK", and `content` may be a template as well as text.
- [Blocking](https://3mo-esolutions.github.io/web-components/?path=/story/feedback-standard-dialogs-alert-dialog--blocking) — `blocking` hides the close button and ignores Escape, so only the button closes the dialog.
- [Sizes](https://3mo-esolutions.github.io/web-components/?path=/story/feedback-standard-dialogs-alert-dialog--sizes) — `size` gives the dialog a fixed width in place of fitting its content.

### Deletion Dialog

- [Default](https://3mo-esolutions.github.io/web-components/?path=/story/feedback-standard-dialogs-deletion-dialog--default)
- [Label](https://3mo-esolutions.github.io/web-components/?path=/story/feedback-standard-dialogs-deletion-dialog--label) — `label` names what is deleted, highlighted in the question so it can be double-checked.
- [Deletion Action](https://3mo-esolutions.github.io/web-components/?path=/story/feedback-standard-dialogs-deletion-dialog--deletion-action) — `deletionAction` runs on confirmation while the button shows it is busy; throwing keeps the dialog open.

## Links

- [Documentation](https://3mo-esolutions.github.io/web-components/?path=/docs/feedback-standard-dialogs-generic-dialog--overview)
- [Changelog](https://3mo-esolutions.github.io/web-components/?path=/docs/feedback-standard-dialogs-generic-dialog--overview)
- [Source](https://github.com/3mo-esolutions/web-components/tree/main/packages/StandardDialogs)

## License

MIT © 3MO GmbH
