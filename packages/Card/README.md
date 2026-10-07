# Card

A web component for filled or outlined cards with a heading, subheading, avatar, actions, media and footer.

[![npm](https://img.shields.io/npm/v/@3mo/card?style=flat-square&color=0077c8)](https://www.npmjs.com/package/@3mo/card) [![Documentation](https://img.shields.io/badge/docs-storybook-ff4785?style=flat-square&logo=storybook&logoColor=white)](https://3mo-esolutions.github.io/web-components/?path=/docs/layout-card--overview)

A surface that groups content with an optional header, media and footer.

## Installation

```sh
npm install @3mo/card
```

```ts
import '@3mo/card'
```

## Usage

```html
<mo-card type='filled' heading='Max Caulfield' subHeading='Photographer, Seattle' avatar='MC'>
	Documentary and portrait photographer, shooting mostly on instant film. Currently working on a series about the lighthouses of the Pacific Northwest.
</mo-card>
```

## Examples

- [Types](https://3mo-esolutions.github.io/web-components/?path=/story/layout-card--types) — `filled` lifts the card off the page with a shadow, `outlined` draws a border instead.
- [Actions](https://3mo-esolutions.github.io/web-components/?path=/story/layout-card--actions) — The `action` slot places buttons in the header and the `footer` slot below the body.
- [Media](https://3mo-esolutions.github.io/web-components/?path=/story/layout-card--media) — `image` shows a picture above the header, and the `media` slot takes any other element there.
- [Slots](https://3mo-esolutions.github.io/web-components/?path=/story/layout-card--slots) — The `avatar`, `heading` and `subHeading` slots take any content in place of their attributes, and `header` replaces the whole header.
- [Custom Properties](https://3mo-esolutions.github.io/web-components/?path=/story/layout-card--custom-properties) — The avatar colors and the padding of the header, body and footer are custom properties.
- [Parts](https://3mo-esolutions.github.io/web-components/?path=/story/layout-card--parts) — The `header`, `avatar`, `heading`, `subHeading`, `media` and `footer` parts can be styled from outside.

## API

### `mo-card`

#### Properties

| Name | Attribute | Type | Default | Description |
| --- | --- | --- | --- | --- |
| `type` | `type` | `CardType` | `"filled"` | Whether the card is filled with a shadow or outlined with a border |
| `heading` | `heading` | `string \| undefined` |  | The heading in the header |
| `subHeading` | `subHeading` | `string \| undefined` |  | The secondary line below the heading |
| `avatar` | `avatar` | `string \| undefined` |  | The text shown in the avatar circle of the header |
| `image` | `image` | `string \| undefined` |  | The URL of an image shown above the header |

#### Slots

| Name | Description |
| --- | --- |
| `action` | Actions in the header |
| `heading` | Custom heading in the header |
| `subHeading` | Custom subHeading in the header |
| `avatar` | Custom avatar in the header |
| `header` | Replaces the whole header, including the heading, subHeading, avatar and action slots |
| `media` | Embedded media |
| (default) | Body / Content |
| `footer` | Actions in the footer |

#### CSS custom properties

| Name | Description |
| --- | --- |
| `--mo-card-header-padding` | Padding of the header |
| `--mo-card-avatar-background` | Color of the avatar |
| `--mo-card-avatar-color` | Text color of the avatar |
| `--mo-card-body-padding` | Padding of the body |
| `--mo-card-footer-padding` | Padding of the footer |

#### CSS parts

| Name | Description |
| --- | --- |
| `media` | Embedded media |
| `header` | The header |
| `avatar` | The avatar |
| `heading` | The heading |
| `subHeading` | The subHeading |
| `footer` | The footer |

## Links

- [Documentation](https://3mo-esolutions.github.io/web-components/?path=/docs/layout-card--overview)
- [Changelog](https://3mo-esolutions.github.io/web-components/?path=/docs/layout-card--overview)
- [Source](https://github.com/3mo-esolutions/web-components/tree/main/packages/Card)

## License

MIT © 3MO GmbH
