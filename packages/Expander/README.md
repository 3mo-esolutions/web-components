# Expander

A web component for disclosures that show and hide content under a heading with a chevron, built on the native details element.

[![npm](https://img.shields.io/npm/v/@3mo/expander?style=flat-square&color=0077c8)](https://www.npmjs.com/package/@3mo/expander) [![Documentation](https://img.shields.io/badge/docs-storybook-ff4785?style=flat-square&logo=storybook&logoColor=white)](https://3mo-esolutions.github.io/web-components/?path=/docs/layout-expander--overview)

A disclosure that shows or hides its content under a clickable heading.

## Installation

```sh
npm install @3mo/expander
```

```ts
import '@3mo/expander'
```

## Usage

```html
<mo-expander heading='How long does delivery take?'>
	Two to three working days within the country, and five to seven to the rest of Europe; orders placed before noon leave the same day.
</mo-expander>
```

## Examples

- [Heading Slot](https://3mo-esolutions.github.io/web-components/?path=/story/layout-expander--heading-slot) — The `heading` slot takes any content in place of the `heading` attribute, such as an icon beside the text.
- [Stacked](https://3mo-esolutions.github.io/web-components/?path=/story/layout-expander--stacked) — Expanders stack into a list of questions, each opening on its own; a focused heading also toggles with Enter or Space.
- [Parts](https://3mo-esolutions.github.io/web-components/?path=/story/layout-expander--parts) — The `header`, `heading` and `expand-collapse-icon-button` parts can be styled from outside.

## Accessibility

A native `details` element: the summary is a button whose open state the browser announces, and `Enter` and `Space` toggle it.

## API

### `mo-expander`

#### Properties

| Name | Attribute | Type | Default | Description |
| --- | --- | --- | --- | --- |
| `open` | `open` | `boolean` | `false` | Whether the expander is open. |
| `heading` | `heading` | `string` | `""` | The heading of the expander. |

#### Events

| Name | Detail | Description |
| --- | --- | --- |
| `openChange` | `boolean` | Dispatched when the expander is opened or closed. |

#### Slots

| Name | Description |
| --- | --- |
| (default) | The content of the expander. |
| `heading` | The heading of the expander. |

#### CSS parts

| Name | Description |
| --- | --- |
| `header` | The header of the expander containing the "heading" and the "expand-collapse-icon-button". |
| `heading` | The heading of the expander. |
| `expand-collapse-icon-button` | The expand-collapse-icon-button of the expander. |

## Links

- [Documentation](https://3mo-esolutions.github.io/web-components/?path=/docs/layout-expander--overview)
- [Changelog](https://3mo-esolutions.github.io/web-components/?path=/docs/layout-expander--overview)
- [Source](https://github.com/3mo-esolutions/web-components/tree/main/packages/Expander)

## License

MIT © 3MO GmbH