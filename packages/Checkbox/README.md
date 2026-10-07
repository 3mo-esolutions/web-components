# Checkbox

A web component for labelled checkboxes with an indeterminate state, built on Material Web.

[![npm](https://img.shields.io/npm/v/@3mo/checkbox?style=flat-square&color=0077c8)](https://www.npmjs.com/package/@3mo/checkbox) [![Documentation](https://img.shields.io/badge/docs-storybook-ff4785?style=flat-square&logo=storybook&logoColor=white)](https://3mo-esolutions.github.io/web-components/?path=/docs/inputs-checkbox--overview)

A checkbox with an optional label, which can also show a partial selection.

## Installation

```sh
npm install @3mo/checkbox
```

```ts
import '@3mo/checkbox'
```

## Usage

```html
<mo-checkbox label='Remember me'></mo-checkbox>
```

## Examples

- [States](https://3mo-esolutions.github.io/web-components/?path=/story/inputs-checkbox--states) — `selected` is `true`, `false` or `'indeterminate'`, which shows a dash for a partial selection.
- [Without Label](https://3mo-esolutions.github.io/web-components/?path=/story/inputs-checkbox--without-label) — Without a `label` only the box is rendered, for tables and toolbars.
- [Long Label](https://3mo-esolutions.github.io/web-components/?path=/story/inputs-checkbox--long-label) — A long label wraps, and the box stays aligned with its first line.
- [Custom Properties](https://3mo-esolutions.github.io/web-components/?path=/story/inputs-checkbox--custom-properties) — `--mo-checkbox-accent-color` colors the selected box, `--mo-checkbox-disabled-color` a disabled one.

## API

### `mo-checkbox`

#### Properties

| Name | Attribute | Type | Default | Description |
| --- | --- | --- | --- | --- |
| `label` | `label` | `string` | `""` | The label of the checkbox. |
| `disabled` | `disabled` | `boolean` | `false` | Whether the checkbox is disabled or not. |
| `selected` | `selected` | `CheckboxSelection` | `false` | Whether the checkbox is selected or not. This can be set to 'indeterminate' to show a dash instead of a check-mark. |

#### Events

| Name | Detail | Description |
| --- | --- | --- |
| `change` | `CheckboxSelection` | Dispatched when the selection state of the checkbox changes. |

#### CSS custom properties

| Name | Description |
| --- | --- |
| `--mo-checkbox-accent-color` | The color of the selected box, its focus ring and its state layer |
| `--mo-checkbox-disabled-color` | The color of a disabled checkbox and its label |

## Links

- [Documentation](https://3mo-esolutions.github.io/web-components/?path=/docs/inputs-checkbox--overview)
- [Changelog](https://3mo-esolutions.github.io/web-components/?path=/docs/inputs-checkbox--overview)
- [Source](https://github.com/3mo-esolutions/web-components/tree/main/packages/Checkbox)

## License

MIT © 3MO GmbH
