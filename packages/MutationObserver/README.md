# Mutation Observer

A Lit directive for reporting a templated element's mutations, slot changes included, plus Lit's MutationController.

[![npm](https://img.shields.io/npm/v/@3mo/mutation-observer?style=flat-square&color=0077c8)](https://www.npmjs.com/package/@3mo/mutation-observer) [![Documentation](https://img.shields.io/badge/docs-storybook-ff4785?style=flat-square&logo=storybook&logoColor=white)](https://3mo-esolutions.github.io/web-components/?path=/docs/behaviors-mutation-observer--overview)

## Installation

```sh
npm install @3mo/mutation-observer
```

```ts
import { observeMutation } from '@3mo/mutation-observer'
```

## Examples

- [Default](https://3mo-esolutions.github.io/web-components/?path=/story/behaviors-mutation-observer--default) — `observeMutation` on a `<slot>` also calls back on `slotchange`, so the list recounts as items are slotted in or out.
- [Controller](https://3mo-esolutions.github.io/web-components/?path=/story/behaviors-mutation-observer--controller) — `MutationController` observes the host and re-renders it on every mutation.

## API

### Exports

| Name | Kind | Description |
| --- | --- | --- |
| `observeMutation` | const | A directive that reports the mutations of the element it sits on, by default of its children, and on a `<slot>` also every `slotchange`. |

## Links

- [Documentation](https://3mo-esolutions.github.io/web-components/?path=/docs/behaviors-mutation-observer--overview)
- [Changelog](https://3mo-esolutions.github.io/web-components/?path=/docs/behaviors-mutation-observer--overview)
- [Source](https://github.com/3mo-esolutions/web-components/tree/main/packages/MutationObserver)

## License

MIT © 3MO GmbH
