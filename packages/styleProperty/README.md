# Style Property

A decorator for component properties backed by one of the host's inline styles, CSS custom properties included.

[![npm](https://img.shields.io/npm/v/@3mo/style-property?style=flat-square&color=0077c8)](https://www.npmjs.com/package/@3mo/style-property) [![Documentation](https://img.shields.io/badge/docs-storybook-ff4785?style=flat-square&logo=storybook&logoColor=white)](https://3mo-esolutions.github.io/web-components/?path=/docs/utilities-style-property--overview)

## Installation

```sh
npm install @3mo/style-property
```

```ts
import { styleProperty } from '@3mo/style-property'
```

## Examples

- [Default](https://3mo-esolutions.github.io/web-components/?path=/story/utilities-style-property--default) — Setting the property, here through its attribute, writes the custom property `--story-swatch-color` into the host's inline style.
- [Converter](https://3mo-esolutions.github.io/web-components/?path=/story/utilities-style-property--converter) — A `styleConverter` translates between the property and the style, here a number of pixels into `inline-size`.

## API

### Exports

| Name | Kind | Description |
| --- | --- | --- |
| `styleProperty` | const | A decorator for a property stored in one of the host's inline styles, CSS custom properties included. |

## Links

- [Documentation](https://3mo-esolutions.github.io/web-components/?path=/docs/utilities-style-property--overview)
- [Changelog](https://3mo-esolutions.github.io/web-components/?path=/docs/utilities-style-property--overview)
- [Source](https://github.com/3mo-esolutions/web-components/tree/main/packages/styleProperty)

## License

MIT © 3MO GmbH