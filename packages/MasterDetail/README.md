# Master Detail

A web component for master-detail layouts whose resizable detail pane only takes space while it has content.

[![npm](https://img.shields.io/npm/v/@3mo/master-detail?style=flat-square&color=0077c8)](https://www.npmjs.com/package/@3mo/master-detail) [![Documentation](https://img.shields.io/badge/docs-storybook-ff4785?style=flat-square&logo=storybook&logoColor=white)](https://3mo-esolutions.github.io/web-components/?path=/docs/layout-master-detail--overview)

A resizable layout of a master pane and a detail pane that takes its share of the space only while it has content.

## Installation

```sh
npm install @3mo/master-detail
```

```ts
import '@3mo/master-detail'
```

## Usage

```html
<mo-master-detail direction='vertical' masterSize='50%' minSize='100px' style='height: 600px'>
	<mo-card slot='master' heading='Invoices'>#24001 Blake Logistics</mo-card>
	<mo-card slot='detail' heading='Positions of #24001'>2 × Cable drum, 1 × Junction box</mo-card>
</mo-master-detail>
```

## Examples

- [Selection](https://3mo-esolutions.github.io/web-components/?path=/story/layout-master-detail--selection) — Select a row and the detail pane takes its share of the space; deselect it and the master pane gets all of it back.
- [Side By Side](https://3mo-esolutions.github.io/web-components/?path=/story/layout-master-detail--side-by-side) — `direction='horizontal'` lays the panes out side by side; `masterSize` and `minSize` follow the axis.
- [Collapsible Detail](https://3mo-esolutions.github.io/web-components/?path=/story/layout-master-detail--collapsible-detail) — `collapsed` shrinks the detail pane to its own content, here a collapsed card, and gives the rest and the resizer to the master pane.
- [Editor And Output](https://3mo-esolutions.github.io/web-components/?path=/story/layout-master-detail--editor-and-output) — The detail pane can follow an action instead of a selection: Run opens it, Collapse leaves only its header and Close empties it.

## API

### `mo-master-detail`

#### Properties

| Name | Attribute | Type | Default | Description |
| --- | --- | --- | --- | --- |
| `direction` | `direction` | `FlexDirection` | `"vertical"` | The direction in which the panes are laid out; 'vertical', the default, places the detail pane below the master pane |
| `masterSize` | `masterSize` | `string` | `"50%"` | The size of the master pane while both panes share the available space |
| `minSize` | `minSize` | `string` | `"300px"` | The minimum size of either pane while both panes share the available space |
| `collapsed` | `collapsed` | `boolean` | `false` | Whether the detail pane is collapsed to the size of its own content, leaving the rest to the master pane |
| `open` | `open` | `boolean` | `false` | Whether the detail pane has content; derived from the 'detail' slot and therefore read-only |

#### Events

| Name | Detail | Description |
| --- | --- | --- |
| `openChange` | `boolean` | Dispatched when the detail pane appears or disappears. |

#### Slots

| Name | Description |
| --- | --- |
| `master` | The pane which is always visible, such as a list or a data grid |
| `detail` | The pane which details the state of the master pane; absent as long as it has no content |

#### CSS parts

| Name | Description |
| --- | --- |
| `resizer-host` | The element between both panes which resizes them. |

## Links

- [Documentation](https://3mo-esolutions.github.io/web-components/?path=/docs/layout-master-detail--overview)
- [Changelog](https://3mo-esolutions.github.io/web-components/?path=/docs/layout-master-detail--overview)
- [Source](https://github.com/3mo-esolutions/web-components/tree/main/packages/MasterDetail)

## License

MIT © 3MO GmbH