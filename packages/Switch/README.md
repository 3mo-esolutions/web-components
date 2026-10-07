# Switch

A web component for labelled on/off switches, built on Material Web.

[![npm](https://img.shields.io/npm/v/@3mo/switch?style=flat-square&color=0077c8)](https://www.npmjs.com/package/@3mo/switch) [![Documentation](https://img.shields.io/badge/docs-storybook-ff4785?style=flat-square&logo=storybook&logoColor=white)](https://3mo-esolutions.github.io/web-components/?path=/docs/inputs-switch--overview)

A switch that turns a single setting on or off, with an optional label.

## Installation

```sh
npm install @3mo/switch
```

```ts
import '@3mo/switch'
```

## Usage

```html
<mo-switch label='Dark mode'></mo-switch>
```

## Examples

- [States](https://3mo-esolutions.github.io/web-components/?path=/story/inputs-switch--states) — On and off, each also disabled.
- [Custom Properties](https://3mo-esolutions.github.io/web-components/?path=/story/inputs-switch--custom-properties) — `--mo-switch-accent-color` colors the switch when on, `--mo-switch-unselected-color` when off.

## API

### `mo-switch`

#### Properties

| Name | Attribute | Type | Default | Description |
| --- | --- | --- | --- | --- |
| `label` | `label` | `string` | `""` | The label beside the switch |
| `disabled` | `disabled` | `boolean` | `false` | Fades the switch and makes it ignore input |
| `selected` | `selected` | `boolean` | `false` | Whether the switch is on |

#### Events

| Name | Detail | Description |
| --- | --- | --- |
| `change` | `boolean` | Dispatched when the selection state of the switch changes. |

#### CSS custom properties

| Name | Description |
| --- | --- |
| `--mo-switch-accent-color` | The color of the handle and track when on, and of the focus ring |
| `--mo-switch-unselected-color` | The color of the handle and track when off |
| `--mo-switch-selected-icon-color` |  |

## Links

- [Documentation](https://3mo-esolutions.github.io/web-components/?path=/docs/inputs-switch--overview)
- [Changelog](https://3mo-esolutions.github.io/web-components/?path=/docs/inputs-switch--overview)
- [Source](https://github.com/3mo-esolutions/web-components/tree/main/packages/Switch)

## License

MIT © 3MO GmbH
