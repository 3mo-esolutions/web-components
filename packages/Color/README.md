# Color

A utility for immutable colors parsed from any CSS color string and converted to hex, RGB, HSL and keywords.

[![npm](https://img.shields.io/npm/v/@3mo/color?style=flat-square&color=0077c8)](https://www.npmjs.com/package/@3mo/color) [![Documentation](https://img.shields.io/badge/docs-storybook-ff4785?style=flat-square&logo=storybook&logoColor=white)](https://3mo-esolutions.github.io/web-components/?path=/docs/utilities-color--overview)

## Installation

```sh
npm install @3mo/color
```

```ts
import { Color } from '@3mo/color'
```

## Usage

```html
<mo-flex direction='horizontal' gap='16px' alignItems='center'>
	<div style='inline-size: 64px; block-size: 64px; border-radius: var(--mo-border-radius); background: ${color}'></div>
	<mo-flex gap='4px'>
		<code>${color.hex}</code>
		<code>${color.rgb}</code>
		<code>${color.hsl}</code>
		<code>${color.keyword}</code>
	</mo-flex>
</mo-flex>
```

## Examples

- [Parsing](https://3mo-esolutions.github.io/web-components/?path=/story/utilities-color--parsing) — Any CSS color string parses: hex with or without alpha, `rgb()`, `hsl()` and keywords.

## API

### Exports

| Name | Kind | Description |
| --- | --- | --- |
| `Color` | class | An immutable color parsed from a CSS color string, convertible to hex, RGB, HSL and keyword. |

## Links

- [Documentation](https://3mo-esolutions.github.io/web-components/?path=/docs/utilities-color--overview)
- [Changelog](https://3mo-esolutions.github.io/web-components/?path=/docs/utilities-color--overview)
- [Source](https://github.com/3mo-esolutions/web-components/tree/main/packages/Color)

## License

MIT © 3MO GmbH
