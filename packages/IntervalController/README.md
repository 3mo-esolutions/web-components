# Interval Controller

A Lit controller for tasks that run at once and then at a fixed interval while the host is connected.

[![npm](https://img.shields.io/npm/v/@3mo/interval-controller?style=flat-square&color=0077c8)](https://www.npmjs.com/package/@3mo/interval-controller) [![Documentation](https://img.shields.io/badge/docs-storybook-ff4785?style=flat-square&logo=storybook&logoColor=white)](https://3mo-esolutions.github.io/web-components/?path=/docs/behaviors-interval-controller--overview)

## Installation

```sh
npm install @3mo/interval-controller
```

```ts
import { IntervalController } from '@3mo/interval-controller'
```

## Examples

- [Default](https://3mo-esolutions.github.io/web-components/?path=/story/behaviors-interval-controller--default) — The task runs as soon as the host connects and then once per period.
- [While Connected](https://3mo-esolutions.github.io/web-components/?path=/story/behaviors-interval-controller--while-connected) — The interval runs only while the host is connected.

## API

### Exports

| Name | Kind | Description |
| --- | --- | --- |
| `IntervalController` | class | A controller that runs a task as soon as its host connects and then at a fixed interval until it disconnects. |

## Links

- [Documentation](https://3mo-esolutions.github.io/web-components/?path=/docs/behaviors-interval-controller--overview)
- [Changelog](https://3mo-esolutions.github.io/web-components/?path=/docs/behaviors-interval-controller--overview)
- [Source](https://github.com/3mo-esolutions/web-components/tree/main/packages/IntervalController)

## License

MIT © 3MO GmbH