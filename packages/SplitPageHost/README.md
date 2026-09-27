# Split Page Host

A web component for a sidebar beside a content page that shows one at a time, with a back button, when narrow.

[![npm](https://img.shields.io/npm/v/@3mo/split-page-host?style=flat-square&color=0077c8)](https://www.npmjs.com/package/@3mo/split-page-host) [![Documentation](https://img.shields.io/badge/docs-storybook-ff4785?style=flat-square&logo=storybook&logoColor=white)](https://3mo-esolutions.github.io/web-components/?path=/docs/layout-split-page-host--overview)

A layout of a sidebar beside a hosted page, showing only one of the two at a time below a window width of 900px.

## Installation

```sh
npm install @3mo/split-page-host
```

```ts
import '@3mo/split-page-host'
```

## Usage

```html
<mo-split-page-host>
	<mo-card slot='sidebar' style='--mo-card-body-padding: 0px'>
		<mo-list>
			<mo-navigation-list-item data-router-selected>Profile</mo-navigation-list-item>
			<mo-navigation-list-item>Notifications</mo-navigation-list-item>
			<mo-navigation-list-item>Security</mo-navigation-list-item>
		</mo-list>
	</mo-card>
	<mo-page heading='Profile'>
		<mo-card>Name, e-mail address and avatar.</mo-card>
	</mo-page>
</mo-split-page-host>
```

## Examples

- [Custom Properties](https://3mo-esolutions.github.io/web-components/?path=/story/layout-split-page-host--custom-properties) — `--mo-split-page-host-sidebar-width` sets the width of the sidebar, `clamp(200px, 30%, 500px)` by default.

## API

### `mo-split-page-host`

#### Properties

| Name | Attribute | Type | Default | Description |
| --- | --- | --- | --- | --- |
| `isContentOpen` | `isContentOpen` | `boolean` | `false` | Whether the content page is open |
| `contentPageHeading` | `contentPageHeading` | `string \| undefined` |  | The heading of the content page |

#### Slots

| Name | Description |
| --- | --- |
| (default) | The content page |
| `sidebar` | The navigation beside the content page |

#### CSS custom properties

| Name | Description |
| --- | --- |
| `--mo-split-page-host-sidebar-width` | The width of the sidebar |

## Links

- [Documentation](https://3mo-esolutions.github.io/web-components/?path=/docs/layout-split-page-host--overview)
- [Changelog](https://3mo-esolutions.github.io/web-components/?path=/docs/layout-split-page-host--overview)
- [Source](https://github.com/3mo-esolutions/web-components/tree/main/packages/SplitPageHost)

## License

MIT © 3MO GmbH