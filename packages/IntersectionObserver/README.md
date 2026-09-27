# Intersection Observer

A Lit directive for observing an element in a template as it intersects the viewport, plus Lit's IntersectionController.

[![npm](https://img.shields.io/npm/v/@3mo/intersection-observer?style=flat-square&color=0077c8)](https://www.npmjs.com/package/@3mo/intersection-observer) [![Documentation](https://img.shields.io/badge/docs-storybook-ff4785?style=flat-square&logo=storybook&logoColor=white)](https://3mo-esolutions.github.io/web-components/?path=/docs/behaviors-intersection-observer--overview)

## Installation

```sh
npm install @3mo/intersection-observer
```

```ts
import { observeIntersection } from '@3mo/intersection-observer'
```

## Examples

- [Default](https://3mo-esolutions.github.io/web-components/?path=/story/behaviors-intersection-observer--default) — `observeIntersection` calls back as the element it sits on crosses the thresholds it is given.
- [Controller](https://3mo-esolutions.github.io/web-components/?path=/story/behaviors-intersection-observer--controller) — `IntersectionController` observes the host itself and keeps what its callback returns as `value`.

## API

### Exports

| Name | Kind | Description |
| --- | --- | --- |
| `observeIntersection` | const | A directive that calls back whenever the element it sits on crosses a threshold of its visibility in the root, the viewport by default. |

## Links

- [Documentation](https://3mo-esolutions.github.io/web-components/?path=/docs/behaviors-intersection-observer--overview)
- [Changelog](https://3mo-esolutions.github.io/web-components/?path=/docs/behaviors-intersection-observer--overview)
- [Source](https://github.com/3mo-esolutions/web-components/tree/main/packages/IntersectionObserver)

## License

MIT © 3MO GmbH