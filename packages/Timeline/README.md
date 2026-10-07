# Timeline

Web components for vertical or horizontal timelines of items with an icon bullet, meta text and a connecting line.

[![npm](https://img.shields.io/npm/v/@3mo/timeline?style=flat-square&color=0077c8)](https://www.npmjs.com/package/@3mo/timeline) [![Documentation](https://img.shields.io/badge/docs-storybook-ff4785?style=flat-square&logo=storybook&logoColor=white)](https://3mo-esolutions.github.io/web-components/?path=/docs/data-timeline--overview)

A sequence of events along a line, from top to bottom or from start to end.

## Installation

```sh
npm install @3mo/timeline
```

```ts
import '@3mo/timeline'
```

## Usage

```html
<mo-timeline direction='vertical'>
	<mo-timeline-item>Order placed</mo-timeline-item>
	<mo-timeline-item>Order confirmed</mo-timeline-item>
	<mo-timeline-item>Sent</mo-timeline-item>
	<mo-timeline-item>Delivered</mo-timeline-item>
</mo-timeline>
```

## Examples

- [Rich Content](https://3mo-esolutions.github.io/web-components/?path=/story/data-timeline--rich-content) — An item takes any content, such as a message above its date, and long content stretches its line.
- [Horizontal](https://3mo-esolutions.github.io/web-components/?path=/story/data-timeline--horizontal) — `direction='horizontal'` lays the items out in a row, with the meta above the line and the content below.
- [Icons](https://3mo-esolutions.github.io/web-components/?path=/story/data-timeline--icons) — `icon` takes a character such as an emoji in place of the bullet point, and the `icon` slot any element.
- [Meta Information](https://3mo-esolutions.github.io/web-components/?path=/story/data-timeline--meta-information) — `meta` places text such as a date in a column of its own beside the content; the `meta` slot takes any element instead.
- [Custom Line](https://3mo-esolutions.github.io/web-components/?path=/story/data-timeline--custom-line) — `line` draws the line to the next item from the default one, here doubled after the first rating.
- [Custom Properties](https://3mo-esolutions.github.io/web-components/?path=/story/data-timeline--custom-properties) — The bullet point's color and the space below each item are custom properties.
- [Parts](https://3mo-esolutions.github.io/web-components/?path=/story/data-timeline--parts) — The `meta` and `icon` parts can be restyled, here with the meta written vertically.

## API

### `mo-timeline`

#### Properties

| Name | Attribute | Type | Default | Description |
| --- | --- | --- | --- | --- |
| `direction` | `direction` | `"horizontal" \| "vertical"` | `"vertical"` | The direction of the timeline, either 'vertical' or 'horizontal'. Defaults to 'vertical'. |

#### Slots

| Name | Description |
| --- | --- |
| (default) | The items of the timeline. |

### `mo-timeline-item`

An event of a `mo-timeline`, marked on its line by a bullet point or an icon.

#### Properties

| Name | Attribute | Type | Default | Description |
| --- | --- | --- | --- | --- |
| `icon` | `icon` | `string \| undefined` |  | A character, such as an emoji, shown on the line in place of the bullet point. |
| `meta` | `meta` | `string \| undefined` |  | Text shown in a column beside the content, such as the date of the event. |
| `line` | `line` | `((defaultLine?: HTMLTemplateResult \| undefined) => HTMLTemplateResult) \| undefined` |  | A function that returns the line drawn to the next item, given the default one. |

#### Slots

| Name | Description |
| --- | --- |
| (default) | The content of the item. |
| `icon` | Shown on the line in place of the bullet point or the `icon` attribute. |
| `meta` | Shown beside the content in place of the `meta` attribute. |

#### CSS custom properties

| Name | Description |
| --- | --- |
| `--mo-timeline-item-padding-end` | The space below the item in a vertical timeline. Defaults to 35px. |
| `--mo-timeline-item-bullet-color` | The color of the bullet point. |

#### CSS parts

| Name | Description |
| --- | --- |
| `icon` | The icon or bullet point on the line. |
| `meta` | The meta information beside the content. |

## Links

- [Documentation](https://3mo-esolutions.github.io/web-components/?path=/docs/data-timeline--overview)
- [Changelog](https://3mo-esolutions.github.io/web-components/?path=/docs/data-timeline--overview)
- [Source](https://github.com/3mo-esolutions/web-components/tree/main/packages/Timeline)

## License

MIT © 3MO GmbH
