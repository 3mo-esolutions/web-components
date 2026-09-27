# Expandability

A Lit controller for the expanded state of collection items, single or multiple, with lazily loaded children and ARIA.

[![npm](https://img.shields.io/npm/v/@3mo/expandability?style=flat-square&color=0077c8)](https://www.npmjs.com/package/@3mo/expandability) [![Documentation](https://img.shields.io/badge/docs-storybook-ff4785?style=flat-square&logo=storybook&logoColor=white)](https://3mo-esolutions.github.io/web-components/?path=/docs/behaviors-expandability--overview)

## Installation

```sh
npm install @3mo/expandability
```

```ts
import { ExpandabilityController } from '@3mo/expandability'
```

## Examples

- [Default](https://3mo-esolutions.github.io/web-components/?path=/story/behaviors-expandability--default) — Open a few branches, then press Refetch: equal departments arrive as new objects and the same rows stay open, as the set is keyed by id.
- [Single Branch](https://3mo-esolutions.github.io/web-components/?path=/story/behaviors-expandability--single-branch) — `multiple: false` keeps one branch open at a time; `ancestorsOf` keeps the open branch's ancestors open with it.
- [Lazy Children](https://3mo-esolutions.github.io/web-components/?path=/story/behaviors-expandability--lazy-children) — `load` is awaited before a branch first opens; the row is stamped `loading` meanwhile.

## API

### Exports

| Name | Kind | Description |
| --- | --- | --- |
| `ExpandabilityController` | class | Which items of a COLLECTION are open — selectability's shape applied to "open". |
| `ExpandabilityAllState` | enum |  |

## Links

- [Documentation](https://3mo-esolutions.github.io/web-components/?path=/docs/behaviors-expandability--overview)
- [Changelog](https://3mo-esolutions.github.io/web-components/?path=/docs/behaviors-expandability--overview)
- [Source](https://github.com/3mo-esolutions/web-components/tree/main/packages/Expandability)

## License

MIT © 3MO GmbH