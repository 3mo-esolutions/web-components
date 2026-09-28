# Slot Controller

A Lit controller for slotted content that re-renders its host when it changes and tells which nodes a slot holds.

[![npm](https://img.shields.io/npm/v/@3mo/slot-controller?style=flat-square&color=0077c8)](https://www.npmjs.com/package/@3mo/slot-controller) [![Documentation](https://img.shields.io/badge/docs-storybook-ff4785?style=flat-square&logo=storybook&logoColor=white)](https://3mo-esolutions.github.io/web-components/?path=/docs/behaviors-slot-controller--overview)

## Installation

```sh
npm install @3mo/slot-controller
```

```ts
import { SlotController } from '@3mo/slot-controller'
```

## Examples

- [Default](https://3mo-esolutions.github.io/web-components/?path=/story/behaviors-slot-controller--default) — The card asks the controller whether its `heading` and `footer` slots hold anything, and renders their areas only then.
- [Empty Slots](https://3mo-esolutions.github.io/web-components/?path=/story/behaviors-slot-controller--empty-slots) — With nothing slotted into `heading` or `footer`, neither area renders.
- [Changing Content](https://3mo-esolutions.github.io/web-components/?path=/story/behaviors-slot-controller--changing-content) — Adding or removing slotted children re-renders the host.

## API

### Exports

| Name | Kind | Description |
| --- | --- | --- |
| `HydrationController` | class | Tracks whether a server-rendered host is hydrating, i.e. rendering its first update in the browser. |
| `SlotController` | class | A controller that re-renders its host when its slotted content changes and tells what each slot holds. |

## Links

- [Documentation](https://3mo-esolutions.github.io/web-components/?path=/docs/behaviors-slot-controller--overview)
- [Changelog](https://3mo-esolutions.github.io/web-components/?path=/docs/behaviors-slot-controller--overview)
- [Source](https://github.com/3mo-esolutions/web-components/tree/main/packages/SlotController)

## License

MIT © 3MO GmbH