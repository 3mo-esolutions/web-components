# Heading

A web component for text in the library's six heading and two subtitle typography levels.

[![npm](https://img.shields.io/npm/v/@3mo/heading?style=flat-square&color=0077c8)](https://www.npmjs.com/package/@3mo/heading) [![Documentation](https://img.shields.io/badge/docs-storybook-ff4785?style=flat-square&logo=storybook&logoColor=white)](https://3mo-esolutions.github.io/web-components/?path=/docs/foundations-heading--overview)

Text set in one of the heading or subtitle typography levels.

## Installation

```sh
npm install @3mo/heading
```

```ts
import '@3mo/heading'
```

## Usage

```html
<mo-heading typography='heading3'>Quarterly report</mo-heading>
```

## Examples

- [Typographies](https://3mo-esolutions.github.io/web-components/?path=/story/foundations-heading--typographies) — Six heading levels from `heading1` down to `heading6`, and two subtitles.
- [Relative Size](https://3mo-esolutions.github.io/web-components/?path=/story/foundations-heading--relative-size) — A heading's size is relative to the surrounding text, up to a cap per level: 36px for `heading1`.

## Accessibility

It only sets the typography: give it `role='heading'` and `aria-level`, or use `h1` to `h6`.

## API

### `mo-heading`

#### Properties

| Name | Attribute | Type | Default | Description |
| --- | --- | --- | --- | --- |
| `typography` | `typography` | `HeadingTypography` | `"heading3"` | The level, from `heading1` (largest) to `heading6`, or `subtitle1` and `subtitle2`; `heading3` by default. |

#### Slots

| Name | Description |
| --- | --- |
| (default) | The text of the heading. |

## Links

- [Documentation](https://3mo-esolutions.github.io/web-components/?path=/docs/foundations-heading--overview)
- [Changelog](https://3mo-esolutions.github.io/web-components/?path=/docs/foundations-heading--overview)
- [Source](https://github.com/3mo-esolutions/web-components/tree/main/packages/Heading)

## License

MIT © 3MO GmbH
