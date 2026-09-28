# Anchor

A web component for hyperlinks in the theme's accent color, also usable as a link-styled action without an href.

[![npm](https://img.shields.io/npm/v/@3mo/anchor?style=flat-square&color=0077c8)](https://www.npmjs.com/package/@3mo/anchor) [![Documentation](https://img.shields.io/badge/docs-storybook-ff4785?style=flat-square&logo=storybook&logoColor=white)](https://3mo-esolutions.github.io/web-components/?path=/docs/actions-anchor--overview)

A link styled in the accent color that navigates like a native anchor, or only fires `click` without an `href`.

## Installation

```sh
npm install @3mo/anchor
```

```ts
import '@3mo/anchor'
```

[Server-side rendering](https://3mo-esolutions.github.io/web-components/?path=/docs/getting-started-installation--overview#server-side-rendering): Renders with Lit SSR and hydrates.

## Usage

```html
<mo-anchor href='https://www.3mo.de' target='_blank'>3MO</mo-anchor>
```

## Examples

- [In Text](https://3mo-esolutions.github.io/web-components/?path=/story/actions-anchor--in-text) — The anchor takes the font of the text around it and only its color from the theme.
- [Without Href](https://3mo-esolutions.github.io/web-components/?path=/story/actions-anchor--without-href) — Without `href` it navigates nowhere and only fires `click` - for a middle click as well.
- [Link Attributes](https://3mo-esolutions.github.io/web-components/?path=/story/actions-anchor--link-attributes) — `download`, `rel`, `ping` and `referrerPolicy` are passed on to the native link.
- [Custom Properties](https://3mo-esolutions.github.io/web-components/?path=/story/actions-anchor--custom-properties) — `--mo-anchor-color` replaces the accent color.

## API

### `mo-anchor`

#### Properties

| Name | Attribute | Type | Default | Description |
| --- | --- | --- | --- | --- |
| `href` | `href` | `string` | `"voidHref"` | The URL to navigate to. Without it the anchor only fires `click`. |
| `target` | `target` | `AnchorSpecialTarget \| (string & {}) \| undefined` |  | Where to open the URL, such as `_blank` for a new tab. |
| `download` | `download` | `string \| undefined` |  | Downloads the URL instead of navigating, under this file name if one is given. |
| `ping` | `ping` | `string \| undefined` |  | Space-separated URLs notified when the link is followed. |
| `referrerPolicy` | `referrerPolicy` | `string \| undefined` |  | How much of the referrer to send when the link is followed. |
| `rel` | `rel` | `string \| undefined` |  | The relationship to the linked URL, such as `noopener`. |

#### Slots

| Name | Description |
| --- | --- |
| (default) | The content of the anchor. |

#### CSS custom properties

| Name | Description |
| --- | --- |
| `--mo-anchor-color` | The link color, the accent color by default. |

## Links

- [Documentation](https://3mo-esolutions.github.io/web-components/?path=/docs/actions-anchor--overview)
- [Changelog](https://3mo-esolutions.github.io/web-components/?path=/docs/actions-anchor--overview)
- [Source](https://github.com/3mo-esolutions/web-components/tree/main/packages/Anchor)

## License

MIT © 3MO GmbH