# Indexability

A Lit controller for mapping items to the elements that render them through one directive, the base other controllers build on.

[![npm](https://img.shields.io/npm/v/@3mo/indexability?style=flat-square&color=0077c8)](https://www.npmjs.com/package/@3mo/indexability) [![Documentation](https://img.shields.io/badge/docs-storybook-ff4785?style=flat-square&logo=storybook&logoColor=white)](https://3mo-esolutions.github.io/web-components/?path=/docs/behaviors-indexability--overview)

## Installation

```sh
npm install @3mo/indexability
```

```ts
import { IndexabilityController } from '@3mo/indexability'
```

## Examples

- [Default](https://3mo-esolutions.github.io/web-components/?path=/story/behaviors-indexability--default) — `items` answers in declared order, the order the owner reads its data in; click an item to resolve it with `itemAt`.
- [Scrambled Dom Order](https://3mo-esolutions.github.io/web-components/?path=/story/behaviors-indexability--scrambled-dom-order) — The same items rendered back to front: their document position changed, the answer did not.
- [Nested Items](https://3mo-esolutions.github.io/web-components/?path=/story/behaviors-indexability--nested-items) — An item nested inside another resolves to itself, as the path is scanned nearest first, so a compound item can carry sub-items.
- [Several Registries Across Shadow Roots](https://3mo-esolutions.github.io/web-components/?path=/story/behaviors-indexability--several-registries-across-shadow-roots) — Two registries on one host, whose cards each sit in their own shadow root.

## API

### Exports

| Name | Kind | Description |
| --- | --- | --- |
| `IndexabilityController` | class | Tracks which elements currently render which items. |
| `IndexabilityObserver` | interface | Notified as the registry changes. |

## Links

- [Documentation](https://3mo-esolutions.github.io/web-components/?path=/docs/behaviors-indexability--overview)
- [Changelog](https://3mo-esolutions.github.io/web-components/?path=/docs/behaviors-indexability--overview)
- [Source](https://github.com/3mo-esolutions/web-components/tree/main/packages/Indexability)

## License

MIT © 3MO GmbH