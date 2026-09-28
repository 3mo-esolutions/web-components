# Group Box

A web component for groups of content under a heading, laid out in a card with a footer.

[![npm](https://img.shields.io/npm/v/@3mo/group-box?style=flat-square&color=0077c8)](https://www.npmjs.com/package/@3mo/group-box) [![Documentation](https://img.shields.io/badge/docs-storybook-ff4785?style=flat-square&logo=storybook&logoColor=white)](https://3mo-esolutions.github.io/web-components/?path=/docs/layout-group-box--overview)

A section whose content sits in a card under its heading.

## Installation

```sh
npm install @3mo/group-box
```

```ts
import '@3mo/group-box'
```

[Server-side rendering](https://3mo-esolutions.github.io/web-components/?path=/docs/getting-started-installation--overview#server-side-rendering): Renders with Lit SSR and hydrates.

## Usage

```html
<mo-group-box heading='Delivery address'>
	<mo-flex gap='12px'>
		<mo-field-text label='Street'></mo-field-text>
		<mo-field-text label='City'></mo-field-text>
		<mo-field-text label='Country'></mo-field-text>
	</mo-flex>
</mo-group-box>
```

## Examples

- [Actions](https://3mo-esolutions.github.io/web-components/?path=/story/layout-group-box--actions) — The `action` slot places buttons beside the heading, and the `footer` slot below the content inside the card.
- [Long Content](https://3mo-esolutions.github.io/web-components/?path=/story/layout-group-box--long-content) — Long content grows the card below the heading.
- [Parts](https://3mo-esolutions.github.io/web-components/?path=/story/layout-group-box--parts) — The `card` part styles the card around the content, and the `header` and `heading` parts the header above it.

## API

### `mo-group-box`

#### Properties

| Name | Attribute | Type | Default | Description |
| --- | --- | --- | --- | --- |
| `heading` | `heading` | `string` | `""` | The heading in the header |

#### Slots

| Name | Description |
| --- | --- |
| `footer` | Content below the body, inside the card |
| (default) | Content |
| `header` | The whole header |
| `heading` | The heading which has a default template rendering a mo-heading element |
| `action` | Actions in the header |

#### CSS parts

| Name | Description |
| --- | --- |
| `card` | The card element. |
| `header` | The header holding the heading and the actions |
| `heading` | The default heading |

## Links

- [Documentation](https://3mo-esolutions.github.io/web-components/?path=/docs/layout-group-box--overview)
- [Changelog](https://3mo-esolutions.github.io/web-components/?path=/docs/layout-group-box--overview)
- [Source](https://github.com/3mo-esolutions/web-components/tree/main/packages/GroupBox)

## License

MIT © 3MO GmbH