# Downloader

A utility for downloading files from a URL or blob URL under a given file name.

[![npm](https://img.shields.io/npm/v/@3mo/downloader?style=flat-square&color=0077c8)](https://www.npmjs.com/package/@3mo/downloader) [![Documentation](https://img.shields.io/badge/docs-storybook-ff4785?style=flat-square&logo=storybook&logoColor=white)](https://3mo-esolutions.github.io/web-components/?path=/docs/utilities-downloader--overview)

## Installation

```sh
npm install @3mo/downloader
```

```ts
import { Downloader } from '@3mo/downloader'
```

## Usage

```html
<mo-button type='outlined' startIcon='download'
	@click=${() => Downloader.download(URL.createObjectURL(new Blob(['Hello, world!'], { type: 'text/plain' })), 'hello.txt')}
>Download hello.txt</mo-button>
```

## Examples

- [Data Url](https://3mo-esolutions.github.io/web-components/?path=/story/utilities-downloader--data-url) — Any URL the browser can fetch works, a data URL included.

## API

### Exports

| Name | Kind | Description |
| --- | --- | --- |
| `Downloader` | class | Downloads a file from a URL, a blob or data URL included, under the given name. |

## Links

- [Documentation](https://3mo-esolutions.github.io/web-components/?path=/docs/utilities-downloader--overview)
- [Changelog](https://3mo-esolutions.github.io/web-components/?path=/docs/utilities-downloader--overview)
- [Source](https://github.com/3mo-esolutions/web-components/tree/main/packages/Downloader)

## License

MIT © 3MO GmbH
