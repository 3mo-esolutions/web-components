# Empty State

A web component for centered placeholder messages with an optional icon, where there is no content yet.

[![npm](https://img.shields.io/npm/v/@3mo/empty-state?style=flat-square&color=0077c8)](https://www.npmjs.com/package/@3mo/empty-state) [![Documentation](https://img.shields.io/badge/docs-storybook-ff4785?style=flat-square&logo=storybook&logoColor=white)](https://3mo-esolutions.github.io/web-components/?path=/docs/feedback-empty-state--overview)

A placeholder that says why a view has nothing to show, with an icon above the message.

## Installation

```sh
npm install @3mo/empty-state
```

```ts
import '@3mo/empty-state'
```

## Usage

```html
<mo-empty-state icon='youtube_searched_for' style='height: 400px'>No results</mo-empty-state>
```

## Examples

- [Icons](https://3mo-esolutions.github.io/web-components/?path=/story/feedback-empty-state--icons) — The icon says what is missing; the message and the icon center in whatever space the element is given.
- [Without Icon](https://3mo-esolutions.github.io/web-components/?path=/story/feedback-empty-state--without-icon) — Without `icon`, only the message shows.
- [Actions](https://3mo-esolutions.github.io/web-components/?path=/story/feedback-empty-state--actions) — An action in the slot lets the reader fill the view.

## API

### `mo-empty-state`

#### Properties

| Name | Attribute | Type | Default | Description |
| --- | --- | --- | --- | --- |
| `icon` | `icon` | `MaterialIcon \| undefined` |  | The Material icon shown above the message. |

#### Slots

| Name | Description |
| --- | --- |
| (default) | The message, and any action that fills the view. |

## Links

- [Documentation](https://3mo-esolutions.github.io/web-components/?path=/docs/feedback-empty-state--overview)
- [Changelog](https://3mo-esolutions.github.io/web-components/?path=/docs/feedback-empty-state--overview)
- [Source](https://github.com/3mo-esolutions/web-components/tree/main/packages/EmptyState)

## License

MIT © 3MO GmbH