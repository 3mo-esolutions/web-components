# File Upload Drop Area

A web component for drop areas that upload the files dropped onto them, or picked in the file dialog on click.

[![npm](https://img.shields.io/npm/v/@3mo/file-upload-drop-area?style=flat-square&color=0077c8)](https://www.npmjs.com/package/@3mo/file-upload-drop-area) [![Documentation](https://img.shields.io/badge/docs-storybook-ff4785?style=flat-square&logo=storybook&logoColor=white)](https://3mo-esolutions.github.io/web-components/?path=/docs/inputs-file-upload-drop-area--overview)

An area that uploads the files dropped on it, or chosen in the file dialog it opens when clicked.

## Installation

```sh
npm install @3mo/file-upload-drop-area
```

```ts
import '@3mo/file-upload-drop-area'
```

## Usage

```html
<mo-file-upload-drop-area .upload=${upload}>
	<mo-flex alignItems='center' gap='0.5rem'>
		<mo-icon icon='backup' style='font-size: 50px; color: var(--mo-color-gray)'></mo-icon>
		<span>Drop a file here or click to choose one</span>
	</mo-flex>
</mo-file-upload-drop-area>
```

## Examples

- [Multiple](https://3mo-esolutions.github.io/web-components/?path=/story/inputs-file-upload-drop-area--multiple) — `multiple` accepts several files at once and passes them to `upload` as an array.
- [Accept](https://3mo-esolutions.github.io/web-components/?path=/story/inputs-file-upload-drop-area--accept) — `accept` filters both the file dialog and the dropped files - drop anything but an image and nothing is uploaded.
- [Dragover](https://3mo-esolutions.github.io/web-components/?path=/story/inputs-file-upload-drop-area--dragover) — The area carries a `dragover` attribute while files are dragged over it, which the content can be styled by.

## API

### `mo-file-upload-drop-area`

#### Properties

| Name | Attribute | Type | Default | Description |
| --- | --- | --- | --- | --- |
| `upload` | `upload` | `(selection: FileUploadSelection<TMultiple>) => Promise<TResult>` |  | The mandatory upload function that is called when the user selects one or more files. |
| `multiple` | `multiple` | `boolean \| TMultiple \| undefined` |  | Whether multiple files can be selected at once. |
| `accept` | `accept` | `string \| undefined` |  | The file types that are accepted for upload, specified as a string containing a comma-separated list of MIME types or file extensions. Dropped files are filtered by it, too. |

#### Events

| Name | Detail | Description |
| --- | --- | --- |
| `change` | `TResult \| undefined` | Dispatched when the uploading process results in success or failure. The event detail is the result of the upload, either the result of the upload function or undefined if the upload failed. |
| `uploadingChange` | `boolean` | Dispatched when the uploading process starts or ends. The event detail is true if the uploading process has started, false otherwise. |
| `selectionChange` | `FileUploadSelection<TMultiple>` | Dispatched when the selection changes. The event detail is the selected file (or array of files when "multiple" is set) or undefined if no file is selected. |

#### Slots

| Name | Description |
| --- | --- |
| (default) | The content of the area, such as an icon and a hint |

## Links

- [Documentation](https://3mo-esolutions.github.io/web-components/?path=/docs/inputs-file-upload-drop-area--overview)
- [Changelog](https://3mo-esolutions.github.io/web-components/?path=/docs/inputs-file-upload-drop-area--overview)
- [Source](https://github.com/3mo-esolutions/web-components/tree/main/packages/FileUploadDropArea)

## License

MIT © 3MO GmbH
