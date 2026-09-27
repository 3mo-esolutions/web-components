# Media Query Observer

A Lit controller for media queries that re-renders its host whenever the match changes.

[![npm](https://img.shields.io/npm/v/@3mo/media-query-observer?style=flat-square&color=0077c8)](https://www.npmjs.com/package/@3mo/media-query-observer) [![Documentation](https://img.shields.io/badge/docs-storybook-ff4785?style=flat-square&logo=storybook&logoColor=white)](https://3mo-esolutions.github.io/web-components/?path=/docs/behaviors-media-query-observer--overview)

## Installation

```sh
npm install @3mo/media-query-observer
```

```ts
import { MediaQueryController } from '@3mo/media-query-observer'
```

## Examples

- [Default](https://3mo-esolutions.github.io/web-components/?path=/story/behaviors-media-query-observer--default) — `matches` tells whether the query holds, and the host re-renders when that changes.
- [User Preferences](https://3mo-esolutions.github.io/web-components/?path=/story/behaviors-media-query-observer--user-preferences) — One controller per query.

## API

### Exports

| Name | Kind | Description |
| --- | --- | --- |
| `MediaQueryController` | class | A controller that tells whether a media query matches, and re-renders its host and calls back when that changes. |

## Links

- [Documentation](https://3mo-esolutions.github.io/web-components/?path=/docs/behaviors-media-query-observer--overview)
- [Changelog](https://3mo-esolutions.github.io/web-components/?path=/docs/behaviors-media-query-observer--overview)
- [Source](https://github.com/3mo-esolutions/web-components/tree/main/packages/MediaQueryObserver)

## License

MIT © 3MO GmbH