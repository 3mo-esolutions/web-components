# Attachment

A web component for a file shown by its name, type, size and thumbnail, with a link to open it and a button to remove it.

[![npm](https://img.shields.io/npm/v/@3mo/attachment?style=flat-square&color=0077c8)](https://www.npmjs.com/package/@3mo/attachment) [![Documentation](https://img.shields.io/badge/docs-storybook-ff4785?style=flat-square&logo=storybook&logoColor=white)](https://3mo-esolutions.github.io/web-components/?path=/docs/data-attachment--overview)

A file shown by its name, its type and size, a thumbnail and the actions on it.

## Installation

```sh
npm install @3mo/attachment
```

```ts
import '@3mo/attachment'
```

## Usage

```html
<mo-attachment name='purchase-order-4471.pdf' size='248832'></mo-attachment>
```

## Examples

- [Types](https://3mo-esolutions.github.io/web-components/?path=/story/data-attachment--types) — The extension of the name selects the icon and the type under the name, and the size takes the unit that fits it.
- [Thumbnail](https://3mo-esolutions.github.io/web-components/?path=/story/data-attachment--thumbnail) — `thumbnail` shows a preview image in place of the icon, which returns if the image cannot be loaded.
- [Link](https://3mo-esolutions.github.io/web-components/?path=/story/data-attachment--link) — `href` makes the name a link to the file, and the whole attachment follows it.
- [Removable](https://3mo-esolutions.github.io/web-components/?path=/story/data-attachment--removable) — `removable` renders the remove button, which dispatches `requestRemove`.
- [Slots](https://3mo-esolutions.github.io/web-components/?path=/story/data-attachment--slots) — The default slot replaces the line under the name, `action` adds controls before the remove button, and `media` replaces the icon.
- [Row](https://3mo-esolutions.github.io/web-components/?path=/story/data-attachment--row) — An attachment takes the width of its content where nothing gives it one, as in this wrapping row.

## Accessibility

With `href` the name is a link, and a press anywhere on the attachment but on its controls follows it. To open a preview of your own, prevent the default of that `click`. The remove button is named "Remove" and the file name. The icon and the thumbnail are decoration and hidden from assistive technology.

## API

### `mo-attachment`

#### Properties

| Name | Attribute | Type | Default | Description |
| --- | --- | --- | --- | --- |
| `name` | `name` | `string` | `""` | The file name. Its extension selects the icon and the type shown under the name. |
| `size` | `size` | `number \| undefined` |  | The file size in bytes, shown under the name in the unit that fits it. |
| `thumbnail` | `thumbnail` | `string \| undefined` |  | The URL of a preview image shown in place of the icon. The icon returns if the image cannot be loaded. |
| `href` | `href` | `string \| undefined` |  | Renders the name as a link to the file, which a press anywhere on the attachment follows. |
| `target` | `target` | `"_blank" \| "_parent" \| "_self" \| "_top" \| undefined` |  | The link target, with `href`. |
| `removable` | `removable` | `boolean` | `false` | Renders the remove button. |

#### Events

| Name | Detail | Description |
| --- | --- | --- |
| `requestRemove` | `void` | Dispatched when the remove button is pressed. Cancelable. The attachment never removes itself. |

#### Slots

| Name | Description |
| --- | --- |
| (default) | The line under the name, in place of the type and size. |
| `media` | A graphic in place of the icon or thumbnail. |
| `action` | Controls at the end, before the remove button. |

#### CSS parts

| Name | Description |
| --- | --- |
| `media` | The box of the icon or thumbnail. |
| `name` | The file name. |
| `description` | The line under the name. |
| `remove` | The remove button. |

## Links

- [Documentation](https://3mo-esolutions.github.io/web-components/?path=/docs/data-attachment--overview)
- [Changelog](https://3mo-esolutions.github.io/web-components/?path=/docs/data-attachment--overview)
- [Source](https://github.com/3mo-esolutions/web-components/tree/main/packages/Attachment)

## License

MIT © 3MO GmbH
