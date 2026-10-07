# Segmented Input

Lit controllers for inputs split into typed segments, such as date units or code cells, with keyboard entry and ARIA.

[![npm](https://img.shields.io/npm/v/@3mo/segmented-input?style=flat-square&color=0077c8)](https://www.npmjs.com/package/@3mo/segmented-input) [![Documentation](https://img.shields.io/badge/docs-storybook-ff4785?style=flat-square&logo=storybook&logoColor=white)](https://3mo-esolutions.github.io/web-components/?path=/docs/behaviors-segmented-input--overview)

## Installation

```sh
npm install @3mo/segmented-input
```

```ts
import { SegmentedInputController, SegmentedDisplayController } from '@3mo/segmented-input'
```

## Examples

- [Default](https://3mo-esolutions.github.io/web-components/?path=/story/behaviors-segmented-input--default) — Type digits and the focus moves on by itself; the arrows walk the units, Backspace empties one and steps back, and the separators stay inert.
- [Templates](https://3mo-esolutions.github.io/web-components/?path=/story/behaviors-segmented-input--templates) — The segments decide everything: how many units there are, how wide they are and what they take.
- [Right To Left](https://3mo-esolutions.github.io/web-components/?path=/story/behaviors-segmented-input--right-to-left) — The group reads in the direction of its own text: digits and punctuation alone read left to right in any script, while a right-to-left word among the separators turns the order of the units around.
- [Stepping](https://3mo-esolutions.github.io/web-components/?path=/story/behaviors-segmented-input--stepping) — With `handleStep`, the units are spinbuttons: the arrows step, PageUp and PageDown jump, by a quarter of an hour on the minutes, Home and End reach the limits.
- [Code](https://3mo-esolutions.github.io/web-components/?path=/story/behaviors-segmented-input--code) — `SegmentedDisplayController`: one input, six cells, so the code arrives whole from a keyboard, a paste or the phone's own suggestion.

## Accessibility

The group is a `group`, and each segment a `spinbutton` with `aria-valuenow`, `aria-valuemin`, `aria-valuemax` and `aria-valuetext`, which says "Empty" while it is. Name the group, and each segment after its part.
The group is one tab stop, on the segment focused last.

| Key | Does |
| --- | --- |
| `ArrowRight` `ArrowLeft` | The next or previous segment, in reading order. |
| `ArrowUp` `ArrowDown`, `PageUp` `PageDown` | Steps the segment by one, or by a larger step. |
| `Home` `End` | The segment's smallest or largest value. |
| Digits | Type into the segment, which hands on to the next once it is full. |
| `Backspace` `Delete` | Clears the segment. |
| `Enter` | Commits the value. |

## API

### Exports

| Name | Kind | Description |
| --- | --- | --- |
| `SegmentedInputController` | class | Turns a group of elements into one input made of several: each segment is focused and typed into on its own, a filled one hands the focus to the next, and the separators between them stay inert. |
| `SegmentedDisplayController` | class | Draws one value as a row of cells while a single real input holds it. |
| `isEditableSegment` | function |  |
| `LiteralSegment` | interface | A separator between two units: shown, never focused, hidden from assistive technology. |
| `InputSegment` | type | One unit of a value as an input renders it — a year, a digit of a code, a group of a card number — or a literal separator between two of them. |
| `SegmentedInputStep` | type | What a step key asks of a segment. |
| `SegmentedDisplaySegment` | type | A cell knows its position in the value, which is where the caret stands when it is the active one. |

## Links

- [Documentation](https://3mo-esolutions.github.io/web-components/?path=/docs/behaviors-segmented-input--overview)
- [Changelog](https://3mo-esolutions.github.io/web-components/?path=/docs/behaviors-segmented-input--overview)
- [Source](https://github.com/3mo-esolutions/web-components/tree/main/packages/SegmentedInput)

## License

MIT © 3MO GmbH
