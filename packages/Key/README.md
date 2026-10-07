# Key

A web component for keyboard keys and shortcuts rendered the platform's way, as ⌘K on Apple and Ctrl + K elsewhere.

[![npm](https://img.shields.io/npm/v/@3mo/key?style=flat-square&color=0077c8)](https://www.npmjs.com/package/@3mo/key) [![Documentation](https://img.shields.io/badge/docs-storybook-ff4785?style=flat-square&logo=storybook&logoColor=white)](https://3mo-esolutions.github.io/web-components/?path=/docs/data-key--overview)

A keyboard shortcut, written as `KeyboardEvent.key` names and shown in the conventions of the user's platform.

## Installation

```sh
npm install @3mo/key
```

```ts
import '@3mo/key'
```

## Usage

```html
<mo-key>Meta+K</mo-key>
```

## Examples

- [Platforms](https://3mo-esolutions.github.io/web-components/?path=/story/data-key--platforms) — `Meta` is the primary modifier, ⌘ on Apple platforms and Ctrl elsewhere, and modifiers follow the platform's order whatever order they are written in.
- [Independent Keys](https://3mo-esolutions.github.io/web-components/?path=/story/data-key--independent-keys) — `+` joins the keys of a chord, and whitespace separates keys pressed on their own, such as the arrows that move through a list.
- [Special Keys](https://3mo-esolutions.github.io/web-components/?path=/story/data-key--special-keys) — Keys are named as in `KeyboardEvent.key`: known ones take their platform's symbol or abbreviation, others such as `F5` show as written.
- [Separator](https://3mo-esolutions.github.io/web-components/?path=/story/data-key--separator) — `separator` replaces what stands between the keys of a chord, none on Apple platforms and `+` elsewhere by default.
- [Colored Surfaces](https://3mo-esolutions.github.io/web-components/?path=/story/data-key--colored-surfaces) — Keys take their colors from the inherited one, so they stay legible on any surface.
- [Custom Properties](https://3mo-esolutions.github.io/web-components/?path=/story/data-key--custom-properties) — The keycaps' colors and font are custom properties.

## API

### `mo-key`

#### Properties

| Name | Attribute | Type | Default | Description |
| --- | --- | --- | --- | --- |
| `label` |  | `string` |  | The speakable representation announced to screen readers, e.g. "Command K". |
| `platform` | `platform` | `"apple" \| "other"` | `"defaultPlatform"` | The platform to present the keys for. Defaults to the detected platform; override for previews or tests. |
| `separator` | `separator` | `string \| undefined` |  | The visual separator between the keys of a chord. Defaults to the platform convention, i.e. none on Apple platforms and `+` elsewhere. |

#### Slots

| Name | Description |
| --- | --- |
| (default) | The shortcut, in which `+` joins the keys of a chord and whitespace separates independent keys. |

#### CSS custom properties

| Name | Description |
| --- | --- |
| `--mo-key-color` | The foreground color of the keycaps. Defaults to a slightly muted inherited color. |
| `--mo-key-background` | The background color of the keycaps. Defaults to a tint of the inherited color. |
| `--mo-key-border-color` | The border color of the keycaps, which also draws their bottom edge. |
| `--mo-key-font-family` | The font of the legends. Defaults to the theme's `--mo-font-family-mono`. |

## Links

- [Documentation](https://3mo-esolutions.github.io/web-components/?path=/docs/data-key--overview)
- [Changelog](https://3mo-esolutions.github.io/web-components/?path=/docs/data-key--overview)
- [Source](https://github.com/3mo-esolutions/web-components/tree/main/packages/Key)

## License

MIT © 3MO GmbH
