# Theme

Design tokens and utilities for theming, with light and dark palettes derived from one accent color and persisted preferences.

[![npm](https://img.shields.io/npm/v/@3mo/theme?style=flat-square&color=0077c8)](https://www.npmjs.com/package/@3mo/theme) [![Documentation](https://img.shields.io/badge/docs-storybook-ff4785?style=flat-square&logo=storybook&logoColor=white)](https://3mo-esolutions.github.io/web-components/?path=/docs/foundations-theme--overview)

## Installation

```sh
npm install @3mo/theme
```

```ts
import { Theme } from '@3mo/theme'
```

## Usage

```html
<div class='swatch' style='background: var(--mo-color-background); color: var(--mo-color-foreground)'>Background / Foreground</div>
<div class='swatch' style='background: var(--mo-color-surface); color: var(--mo-color-on-surface)'>Surface</div>
<div class='swatch' style='background: var(--mo-color-surface-container-lowest); color: var(--mo-color-on-surface)'>Surface Container Lowest</div>
<div class='swatch' style='background: var(--mo-color-surface-container-low); color: var(--mo-color-on-surface)'>Surface Container Low</div>
<div class='swatch' style='background: var(--mo-color-surface-container); color: var(--mo-color-on-surface)'>Surface Container</div>
<div class='swatch' style='background: var(--mo-color-surface-container-high); color: var(--mo-color-on-surface)'>Surface Container High</div>
<div class='swatch' style='background: var(--mo-color-surface-container-highest); color: var(--mo-color-on-surface)'>Surface Container Highest</div>
<div class='swatch' style='background: var(--mo-color-red)'>Red</div>
<div class='swatch' style='background: var(--mo-color-green)'>Green</div>
<div class='swatch' style='background: var(--mo-color-yellow)'>Yellow</div>
<div class='swatch' style='background: var(--mo-color-blue)'>Blue</div>
<div class='swatch' style='background: var(--mo-color-gray); color: black'>Gray</div>
<div class='swatch' style='background: var(--mo-color-gray-transparent)'>Gray Transparent</div>
<div class='swatch' style='background: var(--mo-color-transparent-gray-3)'>Transparent Gray</div>
<div class='swatch' style='background: var(--mo-color-accent); color: var(--mo-color-on-accent)'>Accent / On Accent</div>
<div class='swatch' style='background: var(--mo-color-accent-container); color: var(--mo-color-on-accent-container)'>Accent Container / On Accent Container</div>
```

## API

### Exports

| Name | Kind | Description |
| --- | --- | --- |
| `BackgroundStorage` | class |  |
| `AccentStorage` | class |  |
| `Theme` | class | Utilities to control the theme of the application. |
| `ThemeController` | class |  |
| `colorContrast` | function | Calculates a CSS color that contrasts with the given color resulting in white or black |
| `Background` | enum |  |

## Links

- [Documentation](https://3mo-esolutions.github.io/web-components/?path=/docs/foundations-theme--overview)
- [Changelog](https://3mo-esolutions.github.io/web-components/?path=/docs/foundations-theme--overview)
- [Source](https://github.com/3mo-esolutions/web-components/tree/main/packages/Theme)

## License

MIT © 3MO GmbH
