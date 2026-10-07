# Screen Size

Lit directives for rendering a value per mobile, tablet or desktop screen size, or hiding an element on some of them.

[![npm](https://img.shields.io/npm/v/@3mo/screen-size?style=flat-square&color=0077c8)](https://www.npmjs.com/package/@3mo/screen-size) [![Documentation](https://img.shields.io/badge/docs-storybook-ff4785?style=flat-square&logo=storybook&logoColor=white)](https://3mo-esolutions.github.io/web-components/?path=/docs/behaviors-screen-size--overview)

## Installation

```sh
npm install @3mo/screen-size
```

```ts
import { dependsOnScreenSize, hideOnScreenSize } from '@3mo/screen-size'
```

## Usage

```html
<span>${dependsOnScreenSize({ mobile: 'Mobile', tablet: 'Tablet', desktop: 'Desktop' })}</span>
```

## Examples

- [Fallback](https://3mo-esolutions.github.io/web-components/?path=/story/behaviors-screen-size--fallback) — A size left out takes the value of the next larger one: tablet shows the desktop value here.
- [Templates](https://3mo-esolutions.github.io/web-components/?path=/story/behaviors-screen-size--templates) — The values can be templates: an icon button on mobile, a labelled one on larger screens.
- [Hide On Screen Size](https://3mo-esolutions.github.io/web-components/?path=/story/behaviors-screen-size--hide-on-screen-size) — `hideOnScreenSize` hides an element on the sizes it names.

## API

### Exports

| Name | Kind | Description |
| --- | --- | --- |
| `DependsOnScreenSizeDirective` | class |  |
| `HideOnScreenSizeDirective` | class |  |
| `ScreenSize` | enum |  |
| `dependsOnScreenSize` | const | Renders the value given for the current screen size - mobile up to 640px, tablet up to 1024px, desktop beyond - falling back to the next larger one. |
| `hideOnScreenSize` | const | Hides the element it is placed on at the given screen sizes. |

## Links

- [Documentation](https://3mo-esolutions.github.io/web-components/?path=/docs/behaviors-screen-size--overview)
- [Changelog](https://3mo-esolutions.github.io/web-components/?path=/docs/behaviors-screen-size--overview)
- [Source](https://github.com/3mo-esolutions/web-components/tree/main/packages/ScreenSize)

## License

MIT © 3MO GmbH
