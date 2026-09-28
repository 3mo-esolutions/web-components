# Collapsible Card

A web component for cards whose body collapses and expands from a toggle in the header.

[![npm](https://img.shields.io/npm/v/@3mo/collapsible-card?style=flat-square&color=0077c8)](https://www.npmjs.com/package/@3mo/collapsible-card) [![Documentation](https://img.shields.io/badge/docs-storybook-ff4785?style=flat-square&logo=storybook&logoColor=white)](https://3mo-esolutions.github.io/web-components/?path=/docs/layout-collapsible-card--overview)

A card whose body collapses down to its header with a toggle button.

## Installation

```sh
npm install @3mo/collapsible-card
```

```ts
import '@3mo/collapsible-card'
```

[Server-side rendering](https://3mo-esolutions.github.io/web-components/?path=/docs/getting-started-installation--overview#server-side-rendering): Renders with Lit SSR and hydrates.

## Usage

```html
<mo-collapsible-card heading='Order #24080' subHeading='Serenity Freight'>
	Twelve steel plates and four tubes of weld seam sealant, shipped from Toronto on Monday. Delivery is expected within five working days.
</mo-collapsible-card>
```

## Examples

- [Sub Heading When Collapsed](https://3mo-esolutions.github.io/web-components/?path=/story/layout-collapsible-card--sub-heading-when-collapsed) — With `showSubHeadingOnlyWhenCollapsed` the sub-heading appears only while collapsed, as a summary of the hidden body - expand the card to see it go.
- [Disable Collapse](https://3mo-esolutions.github.io/web-components/?path=/story/layout-collapsible-card--disable-collapse) — `disableCollapse` disables the toggle, keeping the card expanded or collapsed as it is.
- [Fixed Height](https://3mo-esolutions.github.io/web-components/?path=/story/layout-collapsible-card--fixed-height) — With a height of its own the body fills it, and collapsing gives the height up down to the header.
- [Subclassing](https://3mo-esolutions.github.io/web-components/?path=/story/layout-collapsible-card--subclassing) — A subclass can render more into the card, such as a line between the header and the body, which keeps its place while the body collapses.
- [Custom Properties](https://3mo-esolutions.github.io/web-components/?path=/story/layout-collapsible-card--custom-properties) — `--mo-collapsible-card-transition-duration` sets how long collapsing takes, one second here, and `0s` turns the animation off.

## API

### `mo-collapsible-card`

#### Properties

| Name | Attribute | Type | Default | Description |
| --- | --- | --- | --- | --- |
| `collapsed` | `collapsed` | `boolean` | `false` | Whether the body is collapsed |
| `disableCollapse` | `disableCollapse` | `boolean` | `false` | Disables the toggle, keeping the card in its current state |
| `showSubHeadingOnlyWhenCollapsed` | `showSubHeadingOnlyWhenCollapsed` | `boolean` | `false` | Shows the sub-heading only while the card is collapsed |
| `type` | `type` | `CardType` | `"filled"` | Whether the card is filled with a shadow or outlined with a border |
| `heading` | `heading` | `string \| undefined` |  | The heading in the header |
| `subHeading` | `subHeading` | `string \| undefined` |  | The secondary line below the heading |
| `avatar` | `avatar` | `string \| undefined` |  | The text shown in the avatar circle of the header |
| `image` | `image` | `string \| undefined` |  | The URL of an image shown above the header |

#### Events

| Name | Detail | Description |
| --- | --- | --- |
| `collapse` | `boolean` | Dispatched when the card is collapsed or expanded |

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
| `--mo-collapsible-card-transition-duration` | The duration of the collapse and expand animation; "0s" turns it off |
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

- [Documentation](https://3mo-esolutions.github.io/web-components/?path=/docs/layout-collapsible-card--overview)
- [Changelog](https://3mo-esolutions.github.io/web-components/?path=/docs/layout-collapsible-card--overview)
- [Source](https://github.com/3mo-esolutions/web-components/tree/main/packages/CollapsibleCard)

## License

MIT © 3MO GmbH