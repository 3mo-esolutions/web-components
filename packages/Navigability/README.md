# Navigability

A Lit controller for the current item of a composite widget, moved by arrow keys, Home, End, paging and typeahead.

[![npm](https://img.shields.io/npm/v/@3mo/navigability?style=flat-square&color=0077c8)](https://www.npmjs.com/package/@3mo/navigability) [![Documentation](https://img.shields.io/badge/docs-storybook-ff4785?style=flat-square&logo=storybook&logoColor=white)](https://3mo-esolutions.github.io/web-components/?path=/docs/behaviors-navigability--overview)

## Installation

```sh
npm install @3mo/navigability
```

```ts
import { NavigabilityController } from '@3mo/navigability'
```

## Examples

- [Default](https://3mo-esolutions.github.io/web-components/?path=/story/behaviors-navigability--default) — Tab in, then the arrows move, Home and End jump and PageUp and PageDown page.
- [Wrapping](https://3mo-esolutions.github.io/web-components/?path=/story/behaviors-navigability--wrapping) — `wrap` connects the ends, so ↓ on the last person lands on the first.
- [Typeahead](https://3mo-esolutions.github.io/web-components/?path=/story/behaviors-navigability--typeahead) — `typeahead` moves to the next item whose text starts with what was typed.
- [Disabled Items](https://3mo-esolutions.github.io/web-components/?path=/story/behaviors-navigability--disabled-items) — Disabled items keep their place in the order but are stepped over.
- [Active Descendant](https://3mo-esolutions.github.io/web-components/?path=/story/behaviors-navigability--active-descendant) — `focus: 'activedescendant'` keeps focus in the input, which keeps its caret keys.

## API

### Exports

| Name | Kind | Description |
| --- | --- | --- |
| `NavigabilityController` | class | The current item of a composite widget, kept apart from selection and from focus. |
| `NavigabilityElement` | interface | An item's element, or the shim a virtualizer hands out for one it has not rendered. |
| `NavigabilityFocus` | type | `roving` moves DOM focus onto the current item; `activedescendant` keeps it on the keyboard target and announces the current item through `aria-activedescendant`. |

## Links

- [Documentation](https://3mo-esolutions.github.io/web-components/?path=/docs/behaviors-navigability--overview)
- [Changelog](https://3mo-esolutions.github.io/web-components/?path=/docs/behaviors-navigability--overview)
- [Source](https://github.com/3mo-esolutions/web-components/tree/main/packages/Navigability)

## License

MIT © 3MO GmbH