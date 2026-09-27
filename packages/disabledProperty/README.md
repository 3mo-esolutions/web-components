# Disabled Property

A decorator for a reflected disabled property with aria-disabled, optionally taking the element out of the tab order.

[![npm](https://img.shields.io/npm/v/@3mo/disabled-property?style=flat-square&color=0077c8)](https://www.npmjs.com/package/@3mo/disabled-property) [![Documentation](https://img.shields.io/badge/docs-storybook-ff4785?style=flat-square&logo=storybook&logoColor=white)](https://3mo-esolutions.github.io/web-components/?path=/docs/utilities-disabled-property--overview)

## Installation

```sh
npm install @3mo/disabled-property
```

```ts
import { disabledProperty } from '@3mo/disabled-property'
```

## Examples

- [Default](https://3mo-esolutions.github.io/web-components/?path=/story/utilities-disabled-property--default) — The decorated `disabled` property reflects to an attribute and sets `aria-disabled`.
- [Block Focus](https://3mo-esolutions.github.io/web-components/?path=/story/utilities-disabled-property--block-focus) — With `blockFocus`, a disabled element leaves the tab order and gets its `tabindex` back once enabled.

## API

### Exports

| Name | Kind | Description |
| --- | --- | --- |
| `disabledProperty` | const | A decorator for a reflected `disabled` property that sets `aria-disabled` and, with `blockFocus`, takes the element out of the tab order while disabled. |

## Links

- [Documentation](https://3mo-esolutions.github.io/web-components/?path=/docs/utilities-disabled-property--overview)
- [Changelog](https://3mo-esolutions.github.io/web-components/?path=/docs/utilities-disabled-property--overview)
- [Source](https://github.com/3mo-esolutions/web-components/tree/main/packages/disabledProperty)

## License

MIT © 3MO GmbH