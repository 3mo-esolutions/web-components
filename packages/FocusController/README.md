# Focus Controller

A Lit controller for focus within its host, telling whether it came from a pointer, the keyboard or script.

[![npm](https://img.shields.io/npm/v/@3mo/focus-controller?style=flat-square&color=0077c8)](https://www.npmjs.com/package/@3mo/focus-controller) [![Documentation](https://img.shields.io/badge/docs-storybook-ff4785?style=flat-square&logo=storybook&logoColor=white)](https://3mo-esolutions.github.io/web-components/?path=/docs/behaviors-focus-controller--overview)

## Installation

```sh
npm install @3mo/focus-controller
```

```ts
import { FocusController } from '@3mo/focus-controller'
```

## Examples

- [Default](https://3mo-esolutions.github.io/web-components/?path=/story/behaviors-focus-controller--default) — Tab into the box, or click into it, and out again: the focus is reported as bubbled from a descendant, by keyboard or by pointer.
- [Focused Itself](https://3mo-esolutions.github.io/web-components/?path=/story/behaviors-focus-controller--focused-itself) — A host which takes the focus itself reports it as not bubbled.
- [Programmatic](https://3mo-esolutions.github.io/web-components/?path=/story/behaviors-focus-controller--programmatic) — Focus moved by `focus()` rather than by the user is reported as `programmatic`.

## API

### Exports

| Name | Kind | Description |
| --- | --- | --- |
| `FocusController` | class | Tracks whether the focus is within the host, and whether a pointer, the keyboard or a script put it there. |

## Links

- [Documentation](https://3mo-esolutions.github.io/web-components/?path=/docs/behaviors-focus-controller--overview)
- [Changelog](https://3mo-esolutions.github.io/web-components/?path=/docs/behaviors-focus-controller--overview)
- [Source](https://github.com/3mo-esolutions/web-components/tree/main/packages/FocusController)

## License

MIT © 3MO GmbH
