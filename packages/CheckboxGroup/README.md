# Checkbox Group

A web component for parent checkboxes that check or clear their nested checkboxes and turn indeterminate when mixed.

[![npm](https://img.shields.io/npm/v/@3mo/checkbox-group?style=flat-square&color=0077c8)](https://www.npmjs.com/package/@3mo/checkbox-group) [![Documentation](https://img.shields.io/badge/docs-storybook-ff4785?style=flat-square&logo=storybook&logoColor=white)](https://3mo-esolutions.github.io/web-components/?path=/docs/inputs-checkbox-group--overview)

A checkbox that selects or clears the checkboxes nested in it, and shows a dash while only some are selected.

## Installation

```sh
npm install @3mo/checkbox-group
```

```ts
import '@3mo/checkbox-group'
```

[Server-side rendering](https://3mo-esolutions.github.io/web-components/?path=/docs/getting-started-installation--overview#server-side-rendering): Renders with Lit SSR and hydrates.

## Usage

```html
<mo-checkbox-group label='Notifications' direction='vertical'>
	<mo-checkbox label='Email' selected></mo-checkbox>
	<mo-checkbox label='SMS'></mo-checkbox>
	<mo-checkbox label='Push'></mo-checkbox>
</mo-checkbox-group>
```

## Examples

- [Nested](https://3mo-esolutions.github.io/web-components/?path=/story/inputs-checkbox-group--nested) — Groups nest: each one reflects its own checkboxes, and selecting a group selects everything inside it.
- [Horizontal](https://3mo-esolutions.github.io/web-components/?path=/story/inputs-checkbox-group--horizontal) — `direction='horizontal'` lays the checkboxes out in a row.
- [Custom Properties](https://3mo-esolutions.github.io/web-components/?path=/story/inputs-checkbox-group--custom-properties) — `--mo-checkbox-group-nested-margin` sets how far the checkboxes are indented.

## API

### `mo-checkbox-group`

#### Properties

| Name | Attribute | Type | Default | Description |
| --- | --- | --- | --- | --- |
| `direction` | `direction` | `FlexDirection` | `"vertical"` | The direction the nested checkboxes are laid out in |
| `label` | `label` | `string` | `""` | The label of the checkbox. |
| `disabled` | `disabled` | `boolean` | `false` | Whether the checkbox is disabled or not. |
| `selected` | `selected` | `CheckboxSelection` | `false` | Whether the checkbox is selected or not. This can be set to 'indeterminate' to show a dash instead of a check-mark. |

#### Events

| Name | Detail | Description |
| --- | --- | --- |
| `change` | `CheckboxSelection` | Dispatched when the selection state of the checkbox changes. |

#### Slots

| Name | Description |
| --- | --- |
| (default) | The checkboxes and groups the group selects |

#### CSS custom properties

| Name | Description |
| --- | --- |
| `--mo-checkbox-group-nested-margin` | The indentation of the nested checkboxes, 32px by default |
| `--mo-checkbox-accent-color` | The color of the selected box, its focus ring and its state layer |
| `--mo-checkbox-disabled-color` | The color of a disabled checkbox and its label |

## Links

- [Documentation](https://3mo-esolutions.github.io/web-components/?path=/docs/inputs-checkbox-group--overview)
- [Changelog](https://3mo-esolutions.github.io/web-components/?path=/docs/inputs-checkbox-group--overview)
- [Source](https://github.com/3mo-esolutions/web-components/tree/main/packages/CheckboxGroup)

## License

MIT © 3MO GmbH