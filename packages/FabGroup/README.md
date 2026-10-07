# Fab Group

A web component for floating action buttons that unfold a stack of further actions and close on an outside click.

[![npm](https://img.shields.io/npm/v/@3mo/fab-group?style=flat-square&color=0077c8)](https://www.npmjs.com/package/@3mo/fab-group) [![Documentation](https://img.shields.io/badge/docs-storybook-ff4785?style=flat-square&logo=storybook&logoColor=white)](https://3mo-esolutions.github.io/web-components/?path=/docs/actions-floating-action-button-group--overview)

A floating action button that unfolds a column of related ones when pressed, and folds them on a press outside.

## Installation

```sh
npm install @3mo/fab-group
```

```ts
import '@3mo/fab-group'
```

## Usage

```html
<mo-fab-group style='position: absolute; inset-inline-end: 16px; bottom: 16px'>
	<mo-fab icon='add'>Add</mo-fab>
	<mo-fab icon='publish'>Import</mo-fab>
	<mo-fab icon='share'>Share</mo-fab>
</mo-fab-group>
```

## Examples

- [Custom Properties](https://3mo-esolutions.github.io/web-components/?path=/story/actions-floating-action-button-group--custom-properties) — `--mo-fab-group-transition-duration` sets how long the buttons take to unfold.

## API

### `mo-fab-group`

#### Properties

| Name | Attribute | Type | Default | Description |
| --- | --- | --- | --- | --- |
| `open` | `open` | `boolean` | `false` | Whether the buttons are unfolded. |

#### Slots

| Name | Description |
| --- | --- |
| (default) | The `mo-fab`s it unfolds, from the bottom up, their icons after their labels. |

#### CSS custom properties

| Name | Description |
| --- | --- |
| `--mo-fab-group-transition-duration` | The duration of the unfolding, 250ms by default. |

## Links

- [Documentation](https://3mo-esolutions.github.io/web-components/?path=/docs/actions-floating-action-button-group--overview)
- [Changelog](https://3mo-esolutions.github.io/web-components/?path=/docs/actions-floating-action-button-group--overview)
- [Source](https://github.com/3mo-esolutions/web-components/tree/main/packages/FabGroup)

## License

MIT © 3MO GmbH
