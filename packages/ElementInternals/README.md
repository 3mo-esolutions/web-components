# Element Internals

A Lit controller and decorator for form-associated custom elements, with value, validity, reset and fieldset support.

[![npm](https://img.shields.io/npm/v/@3mo/element-internals?style=flat-square&color=0077c8)](https://www.npmjs.com/package/@3mo/element-internals) [![Documentation](https://img.shields.io/badge/docs-storybook-ff4785?style=flat-square&logo=storybook&logoColor=white)](https://3mo-esolutions.github.io/web-components/?path=/docs/behaviors-element-internals--overview)

## Installation

```sh
npm install @3mo/element-internals
```

```ts
import { FormAssociationController, formAssociated } from '@3mo/element-internals'
```

## Examples

- [Default](https://3mo-esolutions.github.io/web-components/?path=/story/behaviors-element-internals--default) — Edit the name and submit: the field hands its value to the form under its `name`.
- [Form Participation](https://3mo-esolutions.github.io/web-components/?path=/story/behaviors-element-internals--form-participation) — All three hold the same text, yet the field without `@formAssociated` is missing from the submission: its input sits in a shadow root, outside the form's tree.
- [Constraint Validation](https://3mo-esolutions.github.io/web-components/?path=/story/behaviors-element-internals--constraint-validation) — Submit while empty: the form refuses and the browser shows the message of the first invalid control - the email's from its input, the rating's from the state it works out itself.
- [Reset](https://3mo-esolutions.github.io/web-components/?path=/story/behaviors-element-internals--reset) — Type over the fields and press Reset: `handleReset` returns each to its `value` attribute, as a native input does.
- [Disabled Fieldset](https://3mo-esolutions.github.io/web-components/?path=/story/behaviors-element-internals--disabled-fieldset) — Untick Billing: the disabled fieldset takes its controls out of the submission and out of validation, and `handleDisabledChange` greys them out.

## API

### Exports

| Name | Kind | Description |
| --- | --- | --- |
| `FormAssociationController` | class | Makes the host a form control: it submits a value, blocks submission while invalid, and follows resets, fieldsets and restorations as a native control does. |
| `elementInternals` | function | The element's `ElementInternals`, attached on first use. |
| `formAssociated` | function | Declares that the element takes part in forms, which the platform reads while the class is being defined, and hands the form callbacks to its `FormAssociationController`. |
| `FormValue` | type | A value a form can carry for one of its controls. |
| `FormValidity` | type | Constraint validation the host presents to the platform - a rendered input, or a state it works out itself. |
| `FormRestoreReason` | type | Why the browser is restoring a control: a history navigation, or the user's autofill. |
| `FormRestoreState` | type | A value the browser hands back to restore a control - a form value, or the entries of a `FormData` one. |

## Links

- [Documentation](https://3mo-esolutions.github.io/web-components/?path=/docs/behaviors-element-internals--overview)
- [Changelog](https://3mo-esolutions.github.io/web-components/?path=/docs/behaviors-element-internals--overview)
- [Source](https://github.com/3mo-esolutions/web-components/tree/main/packages/ElementInternals)

## License

MIT © 3MO GmbH