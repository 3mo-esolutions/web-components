# Cloudflare Stream

A web component for embedded Cloudflare Stream videos that can pause once scrolled out of view.

[![npm](https://img.shields.io/npm/v/@3mo/cloudflare-stream?style=flat-square&color=0077c8)](https://www.npmjs.com/package/@3mo/cloudflare-stream) [![Documentation](https://img.shields.io/badge/docs-storybook-ff4785?style=flat-square&logo=storybook&logoColor=white)](https://3mo-esolutions.github.io/web-components/?path=/docs/data-cloudflare-stream--overview)

A Cloudflare Stream video player, embedded at a 16:9 ratio.

## Installation

```sh
npm install @3mo/cloudflare-stream
```

```ts
import '@3mo/cloudflare-stream'
```

## Usage

```html
<mo-cloudflare-stream source='https://customer-m3y97nwa2fb7cpy9.cloudflarestream.com/39fc05d336585f825b0170efb2ff8783/iframe?preload=true&amp;loop=true'></mo-cloudflare-stream>
```

## Examples

- [Size](https://3mo-esolutions.github.io/web-components/?path=/story/data-cloudflare-stream--size) — The player keeps a 16:9 ratio and fills the width it is given.
- [Auto Pause](https://3mo-esolutions.github.io/web-components/?path=/story/data-cloudflare-stream--auto-pause) — `autoPause` pauses the video once it leaves the viewport, or once only a quarter or half of it is left in view, and plays it again when it returns - scroll past it.

## API

### `mo-cloudflare-stream`

#### Properties

| Name | Attribute | Type | Default | Description |
| --- | --- | --- | --- | --- |
| `source` | `source` | `string \| undefined` |  | The URL of the video's Cloudflare Stream player iframe. |
| `autoPause` | `autoPause` | `CloudflareStreamAutoPause \| undefined` |  | When the video pauses as it is scrolled out of view: `when-not-in-viewport`, `when-quarter-in-viewport` or `when-half-in-viewport`. It plays again when it returns. |

## Links

- [Documentation](https://3mo-esolutions.github.io/web-components/?path=/docs/data-cloudflare-stream--overview)
- [Changelog](https://3mo-esolutions.github.io/web-components/?path=/docs/data-cloudflare-stream--overview)
- [Source](https://github.com/3mo-esolutions/web-components/tree/main/packages/CloudflareStream)

## License

MIT © 3MO GmbH