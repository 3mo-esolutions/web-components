# Expand Collapse Icon Button

A web component for chevron icon buttons that rotate to show whether something is expanded or collapsed.

[![npm](https://img.shields.io/npm/v/@3mo/expand-collapse-icon-button?style=flat-square&color=0077c8)](https://www.npmjs.com/package/@3mo/expand-collapse-icon-button) [![Documentation](https://img.shields.io/badge/docs-storybook-ff4785?style=flat-square&logo=storybook&logoColor=white)](https://3mo-esolutions.github.io/web-components/?path=/docs/actions-expand-collapse-icon-button--overview)

A dense chevron icon-button that turns upside down while the content it controls is open.

## Installation

```sh
npm install @3mo/expand-collapse-icon-button
```

```ts
import '@3mo/expand-collapse-icon-button'
```

## Usage

```html
<mo-expand-collapse-icon-button></mo-expand-collapse-icon-button>
```

## Examples

- [Toggling](https://3mo-esolutions.github.io/web-components/?path=/story/actions-expand-collapse-icon-button--toggling) — The button only shows the state, turning its chevron when `open` changes; flipping it on `click` is up to you.
- [Disabled](https://3mo-esolutions.github.io/web-components/?path=/story/actions-expand-collapse-icon-button--disabled) — A disabled button fades in either state and ignores presses.

## API

### `mo-expand-collapse-icon-button`

#### Properties

| Name | Attribute | Type | Default | Description |
| --- | --- | --- | --- | --- |
| `disabled` | `disabled` | `boolean` | `false` | Disables the button. |
| `open` | `open` | `boolean` | `false` | Whether the controlled content is open, which turns the chevron up. |

## Links

- [Documentation](https://3mo-esolutions.github.io/web-components/?path=/docs/actions-expand-collapse-icon-button--overview)
- [Changelog](https://3mo-esolutions.github.io/web-components/?path=/docs/actions-expand-collapse-icon-button--overview)
- [Source](https://github.com/3mo-esolutions/web-components/tree/main/packages/ExpandCollapseIconButton)

## License

MIT © 3MO GmbH
