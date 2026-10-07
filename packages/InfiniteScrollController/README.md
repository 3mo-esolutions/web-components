# Infinite Scroll Controller

A Lit controller for infinite scrolling that fetches the next chunk as the user nears the end of a container.

[![npm](https://img.shields.io/npm/v/@3mo/infinite-scroll-controller?style=flat-square&color=0077c8)](https://www.npmjs.com/package/@3mo/infinite-scroll-controller) [![Documentation](https://img.shields.io/badge/docs-storybook-ff4785?style=flat-square&logo=storybook&logoColor=white)](https://3mo-esolutions.github.io/web-components/?path=/docs/behaviors-infinite-scroll-controller--overview)

## Installation

```sh
npm install @3mo/infinite-scroll-controller
```

```ts
import { InfiniteScrollController } from '@3mo/infinite-scroll-controller'
```

## Examples

- [Default](https://3mo-esolutions.github.io/web-components/?path=/story/behaviors-infinite-scroll-controller--default) — Scroll down: the next chunk loads once less than half a viewport of items is left below.
- [End Of Stream](https://3mo-esolutions.github.io/web-components/?path=/story/behaviors-infinite-scroll-controller--end-of-stream) — `fetchNext` resolving to `false` ends the stream, here after 50 items.
- [Failing Chunks](https://3mo-esolutions.github.io/web-components/?path=/story/behaviors-infinite-scroll-controller--failing-chunks) — Every third chunk fails.

## API

### Exports

| Name | Kind | Description |
| --- | --- | --- |
| `InfiniteScrollController` | class | Fetches the next chunk of data whenever a container is scrolled near its end, one chunk at a time. |

## Links

- [Documentation](https://3mo-esolutions.github.io/web-components/?path=/docs/behaviors-infinite-scroll-controller--overview)
- [Changelog](https://3mo-esolutions.github.io/web-components/?path=/docs/behaviors-infinite-scroll-controller--overview)
- [Source](https://github.com/3mo-esolutions/web-components/tree/main/packages/InfiniteScrollController)

## License

MIT © 3MO GmbH
