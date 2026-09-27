# Resize Observer

A Lit directive for calling back whenever an element in a template resizes, plus Lit's ResizeController.

[![npm](https://img.shields.io/npm/v/@3mo/resize-observer?style=flat-square&color=0077c8)](https://www.npmjs.com/package/@3mo/resize-observer) [![Documentation](https://img.shields.io/badge/docs-storybook-ff4785?style=flat-square&logo=storybook&logoColor=white)](https://3mo-esolutions.github.io/web-components/?path=/docs/behaviors-resize-observer--overview)

## Installation

```sh
npm install @3mo/resize-observer
```

```ts
import { observeResize } from '@3mo/resize-observer'
```

## Examples

- [Default](https://3mo-esolutions.github.io/web-components/?path=/story/behaviors-resize-observer--default) — `observeResize` calls back whenever the element it sits on resizes.
- [Controller](https://3mo-esolutions.github.io/web-components/?path=/story/behaviors-resize-observer--controller) — `ResizeController` observes the host itself and keeps what its callback returns as `value`.

## API

### Exports

| Name | Kind | Description |
| --- | --- | --- |
| `observeResize` | const | A directive that calls back whenever the element it sits on resizes. |

## Links

- [Documentation](https://3mo-esolutions.github.io/web-components/?path=/docs/behaviors-resize-observer--overview)
- [Changelog](https://3mo-esolutions.github.io/web-components/?path=/docs/behaviors-resize-observer--overview)
- [Source](https://github.com/3mo-esolutions/web-components/tree/main/packages/ResizeObserver)

## License

MIT © 3MO GmbH