# File Upload

A web component for uploading files chosen in the file picker, plus a directive that accepts dropped files.

[![npm](https://img.shields.io/npm/v/@3mo/file-upload?style=flat-square&color=0077c8)](https://www.npmjs.com/package/@3mo/file-upload) [![Documentation](https://img.shields.io/badge/docs-storybook-ff4785?style=flat-square&logo=storybook&logoColor=white)](https://3mo-esolutions.github.io/web-components/?path=/docs/inputs-file-upload--overview)

An invisible file input that passes the files the user chooses to an upload function; `openExplorer()` opens the file dialog.

## Installation

```sh
npm install @3mo/file-upload
```

```ts
import '@3mo/file-upload'
```

[Server-side rendering](https://3mo-esolutions.github.io/web-components/?path=/docs/getting-started-installation--overview#server-side-rendering): Renders with Lit SSR and hydrates.

## Usage

```html
<mo-file-upload uploadOnSelection .upload=${upload}></mo-file-upload>
<mo-button type='outlined' startIcon='upload' @click=${(event: Event) => (event.currentTarget as Element).parentElement!.querySelector('mo-file-upload')!.openExplorer()}>Choose a file</mo-button>
```

## Examples

- [Multiple](https://3mo-esolutions.github.io/web-components/?path=/story/inputs-file-upload--multiple) — `multiple` passes an array of files to `upload`.
- [Accept](https://3mo-esolutions.github.io/web-components/?path=/story/inputs-file-upload--accept) — `accept` limits the choice to MIME types or file extensions, as on a native file input.
- [Upload Later](https://3mo-esolutions.github.io/web-components/?path=/story/inputs-file-upload--upload-later) — Without `uploadOnSelection`, choosing a file only dispatches `selectionChange`, and `uploadSelection()` uploads it later.
- [Drop](https://3mo-esolutions.github.io/web-components/?path=/story/inputs-file-upload--drop) — `fileDrop` makes any element accept dropped files and stamps `dragover` on it while they are dragged over - drop a file on the field.

## API

### `mo-file-upload`

#### Properties

| Name | Attribute | Type | Default | Description |
| --- | --- | --- | --- | --- |
| `upload` | `upload` | `(selection: FileUploadSelection<TMultiple>) => Promise<TResult>` |  | The mandatory upload function that is called when the user selects one or more files. |
| `uploadOnSelection` | `uploadOnSelection` | `boolean` | `false` | Uploads the files as soon as they are chosen, instead of when `uploadSelection()` is called |
| `multiple` | `multiple` | `boolean \| TMultiple \| undefined` |  | Whether multiple files can be selected at once. |
| `accept` | `accept` | `string \| undefined` |  | The file types that are accepted for upload, specified as a string containing a comma-separated list of MIME types or file extensions. |

#### Events

| Name | Detail | Description |
| --- | --- | --- |
| `change` | `TResult \| undefined` | Dispatched when the uploading process results in success or failure. The event detail is the result of the upload, either the result of the upload function or undefined if the upload failed. |
| `uploadingChange` | `boolean` | Dispatched when the uploading process starts or ends. The event detail is true if the uploading process has started, false otherwise. |
| `selectionChange` | `FileUploadSelection<TMultiple>` | Dispatched when the selection changes. The event detail is the selected file (or array of files when "multiple" is set) or undefined if no file is selected. |

## Links

- [Documentation](https://3mo-esolutions.github.io/web-components/?path=/docs/inputs-file-upload--overview)
- [Changelog](https://3mo-esolutions.github.io/web-components/?path=/docs/inputs-file-upload--overview)
- [Source](https://github.com/3mo-esolutions/web-components/tree/main/packages/FileUpload)

## License

MIT © 3MO GmbH