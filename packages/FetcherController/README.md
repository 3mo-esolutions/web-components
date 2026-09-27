# Fetcher Controller

A Lit controller for fetches that rerun when their arguments change, throttled and with superseded results discarded.

[![npm](https://img.shields.io/npm/v/@3mo/fetcher-controller?style=flat-square&color=0077c8)](https://www.npmjs.com/package/@3mo/fetcher-controller) [![Documentation](https://img.shields.io/badge/docs-storybook-ff4785?style=flat-square&logo=storybook&logoColor=white)](https://3mo-esolutions.github.io/web-components/?path=/docs/behaviors-fetcher-controller--overview)

## Installation

```sh
npm install @3mo/fetcher-controller
```

```ts
import { FetcherController } from '@3mo/fetcher-controller'
```

## Examples

- [Default](https://3mo-esolutions.github.io/web-components/?path=/story/behaviors-fetcher-controller--default) — The fetch runs whenever `args` changes.
- [Manual Run](https://3mo-esolutions.github.io/web-components/?path=/story/behaviors-fetcher-controller--manual-run) — With `autoRun: false` nothing is fetched until `run()` is called, here by the button.

## API

### Exports

| Name | Kind | Description |
| --- | --- | --- |
| `Enqueuer` | class | Resolves only the latest of the promises it is handed; one superseded before it settled rejects with an `EnqueuerError`. |
| `EnqueuerError` | class | The rejection of a superseded promise, carrying the result that was discarded. |
| `FetcherController` | class | A Lit task that fetches whenever its arguments change, throttled, and discards the results of fetches that were superseded. |

## Links

- [Documentation](https://3mo-esolutions.github.io/web-components/?path=/docs/behaviors-fetcher-controller--overview)
- [Changelog](https://3mo-esolutions.github.io/web-components/?path=/docs/behaviors-fetcher-controller--overview)
- [Source](https://github.com/3mo-esolutions/web-components/tree/main/packages/FetcherController)

## License

MIT © 3MO GmbH