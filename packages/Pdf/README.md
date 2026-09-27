# Pdf

A web component for embedded PDF documents with a loading spinner, falling back to an iframe on Apple platforms.

[![npm](https://img.shields.io/npm/v/@3mo/pdf?style=flat-square&color=0077c8)](https://www.npmjs.com/package/@3mo/pdf) [![Documentation](https://img.shields.io/badge/docs-storybook-ff4785?style=flat-square&logo=storybook&logoColor=white)](https://3mo-esolutions.github.io/web-components/?path=/docs/data-pdf--overview)

A PDF document embedded in the page, with a spinner while it loads.

## Installation

```sh
npm install @3mo/pdf
```

```ts
import '@3mo/pdf'
```

## Usage

```html
<mo-pdf style='height: 600px' source='https://pdfobject.com/pdf/sample.pdf'></mo-pdf>
```

## Examples

- [Size](https://3mo-esolutions.github.io/web-components/?path=/story/data-pdf--size) — The document has no size of its own and fills the one it is given, here the proportions of an A4 page.

## API

### `mo-pdf`

#### Properties

| Name | Attribute | Type | Default | Description |
| --- | --- | --- | --- | --- |
| `source` | `source` | `string \| undefined` |  | The URL of the PDF document. |

## Links

- [Documentation](https://3mo-esolutions.github.io/web-components/?path=/docs/data-pdf--overview)
- [Changelog](https://3mo-esolutions.github.io/web-components/?path=/docs/data-pdf--overview)
- [Source](https://github.com/3mo-esolutions/web-components/tree/main/packages/Pdf)

## License

MIT © 3MO GmbH