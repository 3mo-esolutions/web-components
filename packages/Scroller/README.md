# Scroller

A web component for scrollable content with thin, themeable scrollbars and optional scroll snapping.

[![npm](https://img.shields.io/npm/v/@3mo/scroller?style=flat-square&color=0077c8)](https://www.npmjs.com/package/@3mo/scroller) [![Documentation](https://img.shields.io/badge/docs-storybook-ff4785?style=flat-square&logo=storybook&logoColor=white)](https://3mo-esolutions.github.io/web-components/?path=/docs/layout-scroller--overview)

A scroll container with a thin, themable scrollbar.

## Installation

```sh
npm install @3mo/scroller
```

```ts
import '@3mo/scroller'
```

[Server-side rendering](https://3mo-esolutions.github.io/web-components/?path=/docs/getting-started-installation--overview#server-side-rendering): Renders with Lit SSR and hydrates.

## Usage

```html
<mo-scroller style='height: 400px'>
	${Array.from({ length: 50 }, (_, index) => html`<p>Paragraph ${index + 1}</p>`)}
</mo-scroller>
```

## Examples

- [Horizontal](https://3mo-esolutions.github.io/web-components/?path=/story/layout-scroller--horizontal) — Content wider than the scroller scrolls sideways with the same thin scrollbar.
- [Snapping](https://3mo-esolutions.github.io/web-components/?path=/story/layout-scroller--snapping) — `snapType` sets `scroll-snap-type`, so that scrolling comes to rest on the items that declare `scroll-snap-align`.
- [Custom Properties](https://3mo-esolutions.github.io/web-components/?path=/story/layout-scroller--custom-properties) — `--mo-scroller-thumb-color` and `--mo-scroller-track-color` color the scrollbar.

## API

### `mo-scroller`

#### Properties

| Name | Attribute | Type | Default | Description |
| --- | --- | --- | --- | --- |
| `snapType` | `snapType` | `ScrollSnapType \| undefined` |  | The scroll snap type, mapped to `scroll-snap-type` |

#### Events

| Name | Detail |
| --- | --- |
| `scroll` |  |

#### Slots

| Name | Description |
| --- | --- |
| (default) | The content of the scroller |

#### CSS custom properties

| Name | Description |
| --- | --- |
| `--mo-scroller-thumb-color` | The color of the scroller thumb |
| `--mo-scroller-track-color` | The color of the scroller track |

## Links

- [Documentation](https://3mo-esolutions.github.io/web-components/?path=/docs/layout-scroller--overview)
- [Changelog](https://3mo-esolutions.github.io/web-components/?path=/docs/layout-scroller--overview)
- [Source](https://github.com/3mo-esolutions/web-components/tree/main/packages/Scroller)

## License

MIT © 3MO GmbH