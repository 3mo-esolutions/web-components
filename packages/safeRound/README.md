# Safe Round

A utility for rounding numbers to a given number of decimals without floating-point errors, also as Math.safeRound.

[![npm](https://img.shields.io/npm/v/@3mo/safe-round?style=flat-square&color=0077c8)](https://www.npmjs.com/package/@3mo/safe-round) [![Documentation](https://img.shields.io/badge/docs-storybook-ff4785?style=flat-square&logo=storybook&logoColor=white)](https://3mo-esolutions.github.io/web-components/?path=/docs/utilities-safe-round--overview)

## Installation

```sh
npm install @3mo/safe-round
```

```ts
import { safeRound } from '@3mo/safe-round'
```

## Usage

```html
<mo-flex gap='4px'>
	<code>safeRound(1.005, 2) = ${safeRound(1.005, 2)}</code>
	<code>Math.safeRound(-2.5) = ${Math.safeRound(-2.5)}</code>
</mo-flex>
```

## Examples

- [Comparison](https://3mo-esolutions.github.io/web-components/?path=/story/utilities-safe-round--comparison) — Where `Math.round` and `toFixed` trip over binary floating point or round negative halves toward zero, `safeRound` rounds halves away from zero.

## API

### Exports

| Name | Kind | Description |
| --- | --- | --- |
| `safeRound` | function | Rounds a number to the given decimals without floating-point errors, halves away from zero. |

## Links

- [Documentation](https://3mo-esolutions.github.io/web-components/?path=/docs/utilities-safe-round--overview)
- [Changelog](https://3mo-esolutions.github.io/web-components/?path=/docs/utilities-safe-round--overview)
- [Source](https://github.com/3mo-esolutions/web-components/tree/main/packages/safeRound)

## License

MIT © 3MO GmbH