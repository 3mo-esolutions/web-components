# Overflow Controller

A Lit controller for single-line containers that works out which items overflow, for Priority+ toolbars and menu bars.

[![npm](https://img.shields.io/npm/v/@3mo/overflow-controller?style=flat-square&color=0077c8)](https://www.npmjs.com/package/@3mo/overflow-controller) [![Documentation](https://img.shields.io/badge/docs-storybook-ff4785?style=flat-square&logo=storybook&logoColor=white)](https://3mo-esolutions.github.io/web-components/?path=/docs/behaviors-overflow-controller--overview)

## Installation

```sh
npm install @3mo/overflow-controller
```

```ts
import { OverflowController } from '@3mo/overflow-controller'
```

## Examples

- [Default](https://3mo-esolutions.github.io/web-components/?path=/story/behaviors-overflow-controller--default) — Drag the container's end corner to narrow it: items overflow from the end and return, while `reservedSize` keeps room for the badge.
- [Pinned Items](https://3mo-esolutions.github.io/web-components/?path=/story/behaviors-overflow-controller--pinned-items) — Items registered as `pinned` never overflow: Save As… and Delete keep their place while the others come and go.

## API

### Exports

| Name | Kind | Description |
| --- | --- | --- |
| `OverflowController` | class | Works out which items of a single-line container fit and which overflow - the "Priority+" pattern. |

## Links

- [Documentation](https://3mo-esolutions.github.io/web-components/?path=/docs/behaviors-overflow-controller--overview)
- [Changelog](https://3mo-esolutions.github.io/web-components/?path=/docs/behaviors-overflow-controller--overview)
- [Source](https://github.com/3mo-esolutions/web-components/tree/main/packages/OverflowController)

## License

MIT © 3MO GmbH