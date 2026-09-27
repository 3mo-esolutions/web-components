# Section

A web component for content sections under a heading, with actions in the header.

[![npm](https://img.shields.io/npm/v/@3mo/section?style=flat-square&color=0077c8)](https://www.npmjs.com/package/@3mo/section) [![Documentation](https://img.shields.io/badge/docs-storybook-ff4785?style=flat-square&logo=storybook&logoColor=white)](https://3mo-esolutions.github.io/web-components/?path=/docs/layout-section--overview)

A titled region of a page with a heading, header actions and content.

## Installation

```sh
npm install @3mo/section
```

```ts
import '@3mo/section'
```

## Usage

```html
<mo-section heading='About'>
	Documentary and portrait photographer, shooting mostly on instant film. Currently working on a series about the lighthouses of the Pacific Northwest.
</mo-section>
```

## Examples

- [Actions](https://3mo-esolutions.github.io/web-components/?path=/story/layout-section--actions) — The `action` slot places buttons at the end of the header.
- [Slots](https://3mo-esolutions.github.io/web-components/?path=/story/layout-section--slots) — The `heading` slot takes any content in place of the `heading` attribute, and `header` replaces the whole header.
- [Parts](https://3mo-esolutions.github.io/web-components/?path=/story/layout-section--parts) — The `header` and `heading` parts can be styled from outside, here with a line under the header.

## API

### `mo-section`

#### Properties

| Name | Attribute | Type | Default | Description |
| --- | --- | --- | --- | --- |
| `heading` | `heading` | `string` | `""` | The heading in the header |

#### Slots

| Name | Description |
| --- | --- |
| (default) | Content |
| `header` | The whole header |
| `heading` | The heading which has a default template rendering a mo-heading element |
| `action` | Actions in the header |

#### CSS parts

| Name | Description |
| --- | --- |
| `header` | The header holding the heading and the actions |
| `heading` | The default heading |

## Links

- [Documentation](https://3mo-esolutions.github.io/web-components/?path=/docs/layout-section--overview)
- [Changelog](https://3mo-esolutions.github.io/web-components/?path=/docs/layout-section--overview)
- [Source](https://github.com/3mo-esolutions/web-components/tree/main/packages/Section)

## License

MIT © 3MO GmbH