# Radio

A web component for labelled radio buttons grouped by name across shadow roots, built on Material Web.

[![npm](https://img.shields.io/npm/v/@3mo/radio?style=flat-square&color=0077c8)](https://www.npmjs.com/package/@3mo/radio) [![Documentation](https://img.shields.io/badge/docs-storybook-ff4785?style=flat-square&logo=storybook&logoColor=white)](https://3mo-esolutions.github.io/web-components/?path=/docs/inputs-radio--overview)

A radio button with an optional label, one of a group of mutually exclusive options.

## Installation

```sh
npm install @3mo/radio
```

```ts
import '@3mo/radio'
```

## Usage

```html
<mo-radio label='Standard shipping'></mo-radio>
```

## Examples

- [Groups](https://3mo-esolutions.github.io/web-components/?path=/story/inputs-radio--groups) — Radios sharing a `name` form a group: selecting one clears the others, and the arrow keys move the selection within it.
- [States](https://3mo-esolutions.github.io/web-components/?path=/story/inputs-radio--states) — Selected and unselected, each also disabled.
- [Custom Properties](https://3mo-esolutions.github.io/web-components/?path=/story/inputs-radio--custom-properties) — `--mo-radio-accent-color` colors a selected radio, `--mo-radio-unchecked-color` an unselected one and `--mo-radio-disabled-color` a disabled one.

## Accessibility

Radios with the same `name` form a group across the whole document, with the selected radio as its one tab stop. While none is selected every enabled radio is a tab stop, where the ARIA practices have only the first.

| Key | Does |
| --- | --- |
| The arrows | Selects the next or previous enabled radio of the group, wrapping. |
| `Space` | Selects the radio. |

The radios have no container with a `radiogroup` role: wrap them in one with a name, or use a `mo-selection-group`.

## API

### `mo-radio`

#### Properties

| Name | Attribute | Type | Default | Description |
| --- | --- | --- | --- | --- |
| `label` | `label` | `string` | `""` | The label of the radio. |
| `name` | `name` | `string` | `""` | The name of the radio group. Radios sharing a name are mutually exclusive document-wide. |
| `disabled` | `disabled` | `boolean` | `false` | Whether the radio is disabled or not. |
| `selected` | `selected` | `boolean` |  | Whether the radio is selected or not. |

#### Events

| Name | Detail | Description |
| --- | --- | --- |
| `change` | `boolean` | Dispatched when the selected state of the radio changes. |

#### CSS custom properties

| Name | Description |
| --- | --- |
| `--mo-radio-accent-color` | The color of a selected radio and of its focus ring |
| `--mo-radio-disabled-color` | The color of a disabled radio and its label |
| `--mo-radio-unchecked-color` | The color of an unselected radio |

## Links

- [Documentation](https://3mo-esolutions.github.io/web-components/?path=/docs/inputs-radio--overview)
- [Changelog](https://3mo-esolutions.github.io/web-components/?path=/docs/inputs-radio--overview)
- [Source](https://github.com/3mo-esolutions/web-components/tree/main/packages/Radio)

## License

MIT © 3MO GmbH
