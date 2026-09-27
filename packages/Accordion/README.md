# Accordion

A web component for accordions that stack disclosures and open one or several at a time, built on the native details element.

[![npm](https://img.shields.io/npm/v/@3mo/accordion?style=flat-square&color=0077c8)](https://www.npmjs.com/package/@3mo/accordion) [![Documentation](https://img.shields.io/badge/docs-storybook-ff4785?style=flat-square&logo=storybook&logoColor=white)](https://3mo-esolutions.github.io/web-components/?path=/docs/layout-accordion--overview)

A stack of disclosures of which only one is open at a time, unless several are allowed to be.

## Installation

```sh
npm install @3mo/accordion
```

```ts
import '@3mo/accordion'
```

## Usage

```html
<mo-accordion .multiple=${live(multiple)} .value=${live(value || undefined)}>
	<mo-accordion-item value='shipping' heading='Shipping'>Orders placed before 4pm leave the same day.</mo-accordion-item>
	<mo-accordion-item value='payment' heading='Payment'>Cards, SEPA direct debit and invoice.</mo-accordion-item>
	<mo-accordion-item value='returns' heading='Returns'>Send anything back within 30 days.</mo-accordion-item>
</mo-accordion>
```

## Examples

- [Multiple](https://3mo-esolutions.github.io/web-components/?path=/story/layout-accordion--multiple) — `multiple` lets several items stay open, and `value` is then an array.
- [Rich Headings](https://3mo-esolutions.github.io/web-components/?path=/story/layout-accordion--rich-headings) — `start` leads the heading with an icon and `end` trails it with a summary, so a closed item still says something.
- [Disabled](https://3mo-esolutions.github.io/web-components/?path=/story/layout-accordion--disabled) — A disabled item refuses clicks, not the state: the accordion's `value` can still open it.
- [Controlled](https://3mo-esolutions.github.io/web-components/?path=/story/layout-accordion--controlled) — The open item is a value to read, write and bind; `change` reports only what a click changes, not what is handed in.
- [Nested](https://3mo-esolutions.github.io/web-components/?path=/story/layout-accordion--nested) — An accordion inside an item looks after its own items, and the outer item grows along as the inner one opens.
- [Standalone Item](https://3mo-esolutions.github.io/web-components/?path=/story/layout-accordion--standalone-item) — A lone item is a disclosure of its own, with `open` and `openChange`.
- [Parts](https://3mo-esolutions.github.io/web-components/?path=/story/layout-accordion--parts) — Items hand their innards out as parts, so the same markup becomes a stack of cards from outside.

## Accessibility

Its items are native `details` elements: each summary is a button whose open state the browser announces, and `Enter` and `Space` toggle it. A disabled item leaves the tab order and says `aria-disabled`.

## API

### `mo-accordion`

#### Properties

| Name | Attribute | Type | Default | Description |
| --- | --- | --- | --- | --- |
| `multiple` | `multiple` | `boolean` | `false` | Whether several items may be open at the same time. |
| `value` | `value` | `AccordionValue` |  | The "value" of the open item, or an array of them while "multiple" is set. |

#### Events

| Name | Detail | Description |
| --- | --- | --- |
| `change` | `AccordionValue` | Dispatched with the new value whenever the accordion arrives at one itself, as the platform has it for every control which is a choice. |

#### Slots

| Name | Description |
| --- | --- |
| (default) | The items of the accordion. |

### `mo-accordion-item`

A single disclosure on a native `details` element: a summary that is always visible and the content it reveals.

#### Properties

| Name | Attribute | Type | Default | Description |
| --- | --- | --- | --- | --- |
| `heading` | `heading` | `string` | `""` | The text of the summary. The "heading" slot takes precedence over it. |
| `value` | `value` | `string \| undefined` |  | Identifies the item within an accordion. Items without one are not addressable through the accordion's "value". |
| `open` | `open` | `boolean` | `false` | Whether the content is revealed. |
| `disabled` | `disabled` | `boolean` | `false` | Whether the item refuses to open or close. |

#### Events

| Name | Detail | Description |
| --- | --- | --- |
| `openChange` | `boolean` | Dispatched with the new state whenever the item opens or closes. It bubbles, which is how an accordion follows its items. |

#### Slots

| Name | Description |
| --- | --- |
| (default) | The content which the summary reveals. |
| `heading` | The heading, for headings which are more than text. |
| `start` | Placed before the heading, for an icon or an avatar. |
| `end` | Placed after the heading and before the expand icon, for a count or a status. |

#### CSS parts

| Name | Description |
| --- | --- |
| `summary` | The row which is always visible. |
| `heading` | The heading within the summary. |
| `expand-icon` | The chevron which turns as the item opens. |
| `content` | The wrapper around the revealed content. |

## Links

- [Documentation](https://3mo-esolutions.github.io/web-components/?path=/docs/layout-accordion--overview)
- [Changelog](https://3mo-esolutions.github.io/web-components/?path=/docs/layout-accordion--overview)
- [Source](https://github.com/3mo-esolutions/web-components/tree/main/packages/Accordion)

## License

MIT © 3MO GmbH