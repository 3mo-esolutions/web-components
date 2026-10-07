# Icon

A web component for Material Icons in filled, outlined, sharp or rounded style, with typed names and fonts loaded on demand.

[![npm](https://img.shields.io/npm/v/@3mo/icon?style=flat-square&color=0077c8)](https://www.npmjs.com/package/@3mo/icon) [![Documentation](https://img.shields.io/badge/docs-storybook-ff4785?style=flat-square&logo=storybook&logoColor=white)](https://3mo-esolutions.github.io/web-components/?path=/docs/foundations-icon--overview)

A Material icon, drawn from the Material Icons font by name.

## Installation

```sh
npm install @3mo/icon
```

```ts
import '@3mo/icon'
```

## Usage

```html
<mo-icon icon='verified' variant='filled'></mo-icon>
```

## Examples

- [Variants](https://3mo-esolutions.github.io/web-components/?path=/story/foundations-icon--variants) — Each variant is a font of its own, loaded the first time an icon uses it.
- [Styling](https://3mo-esolutions.github.io/web-components/?path=/story/foundations-icon--styling) — An icon is a glyph: `font-size` sizes it, 24px by default, and `color` colors it.
- [All Icons](https://3mo-esolutions.github.io/web-components/?path=/story/foundations-icon--all-icons) — Every icon name the `icon` attribute accepts - its type completes them in the editor.

## Accessibility

It is read out as its icon's name, such as "delete", unless something around it hides it with `aria-hidden`.

## API

### `mo-icon`

#### Properties

| Name | Attribute | Type | Default | Description |
| --- | --- | --- | --- | --- |
| `variant` | `variant` | `IconVariant` |  | The style, each a font of its own: `filled` (default), `outlined`, `rounded` or `sharp`. |
| `icon` | `icon` | `MaterialIcon \| undefined` |  | The name of the icon, e.g. `delete`. |

## Links

- [Documentation](https://3mo-esolutions.github.io/web-components/?path=/docs/foundations-icon--overview)
- [Changelog](https://3mo-esolutions.github.io/web-components/?path=/docs/foundations-icon--overview)
- [Source](https://github.com/3mo-esolutions/web-components/tree/main/packages/Icon)

## License

MIT © 3MO GmbH
