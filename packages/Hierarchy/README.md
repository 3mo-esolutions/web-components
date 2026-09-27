# Hierarchy

A utility for hierarchies flattened into memoized nodes with parent, level and position, plus visible rows and filtering.

[![npm](https://img.shields.io/npm/v/@3mo/hierarchy?style=flat-square&color=0077c8)](https://www.npmjs.com/package/@3mo/hierarchy) [![Documentation](https://img.shields.io/badge/docs-storybook-ff4785?style=flat-square&logo=storybook&logoColor=white)](https://3mo-esolutions.github.io/web-components/?path=/docs/utilities-hierarchy--overview)

## Installation

```sh
npm install @3mo/hierarchy
```

```ts
import { Hierarchy } from '@3mo/hierarchy'
```

## Examples

- [Default](https://3mo-esolutions.github.io/web-components/?path=/story/utilities-hierarchy--default) — `visible()` lists the roots and the children of expanded nodes in pre-order, each with the level, position and set size ARIA asks for.
- [Filtering](https://3mo-esolutions.github.io/web-components/?path=/story/utilities-hierarchy--filtering) — `filter()` keeps the matches, their ancestors and their subtrees; passed as `isIncluded`, it prunes what is visible.

## API

### Exports

| Name | Kind | Description |
| --- | --- | --- |
| `HierarchyNode` | class | A node of a `Hierarchy`: its datum and key, and its place in the tree. |
| `Hierarchy` | class | A hierarchy flattened into its nodes in pre-order, each knowing its parent, level, position and set size, plus what is visible and what survives a filter. |

## Links

- [Documentation](https://3mo-esolutions.github.io/web-components/?path=/docs/utilities-hierarchy--overview)
- [Changelog](https://3mo-esolutions.github.io/web-components/?path=/docs/utilities-hierarchy--overview)
- [Source](https://github.com/3mo-esolutions/web-components/tree/main/packages/Hierarchy)

## License

MIT © 3MO GmbH