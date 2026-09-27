# Tab

Web components for tabs and tab panels paired by value into the ARIA tabs pattern, built on Material Web.

[![npm](https://img.shields.io/npm/v/@3mo/tab?style=flat-square&color=0077c8)](https://www.npmjs.com/package/@3mo/tab) [![Documentation](https://img.shields.io/badge/docs-storybook-ff4785?style=flat-square&logo=storybook&logoColor=white)](https://3mo-esolutions.github.io/web-components/?path=/docs/layout-tabs--overview)

A tabbed interface: a bar of tabs and the panels they reveal, of which one is shown at a time.

Each `mo-tab-panel` is paired with the tab of the same `value`, and the two are linked for assistive technologies.

## Installation

```sh
npm install @3mo/tab
```

```ts
import '@3mo/tab'
```

## Usage

```html
<mo-tabs value='overview' style='height: 250px'>
	<mo-tab value='overview'>Overview</mo-tab>
	<mo-tab value='flights'>Flights</mo-tab>
	<mo-tab value='trips'>Trips</mo-tab>
	<mo-tab-panel value='overview'>Everything at a glance.</mo-tab-panel>
	<mo-tab-panel value='flights'>The flights which are booked.</mo-tab-panel>
	<mo-tab-panel value='trips'>The trips they belong to.</mo-tab-panel>
</mo-tabs>
```

## Examples

- [Tab Bar](https://3mo-esolutions.github.io/web-components/?path=/story/layout-tabs--tab-bar) — `mo-tab-bar` is the bar alone, for tabs and content that cannot share a box, such as a bar in a page header; arrow keys move between its tabs.
- [Icons](https://3mo-esolutions.github.io/web-components/?path=/story/layout-tabs--icons) — An icon in the `icon` slot stacks above the label, beside it with `inline-icon`, and stands alone without a label.
- [Kept State](https://3mo-esolutions.github.io/web-components/?path=/story/layout-tabs--kept-state) — A hidden panel stays in the DOM, so what is typed into it survives switching to another tab and back.
- [Overflow](https://3mo-esolutions.github.io/web-components/?path=/story/layout-tabs--overflow) — More tabs than fit scroll sideways.
- [Custom Properties](https://3mo-esolutions.github.io/web-components/?path=/story/layout-tabs--custom-properties) — `--mo-tab-accent-color` colors the active tab and its indicator, `--mo-tab-background-color` every tab and `--mo-tab-divider-color` the line below; the labels follow `color`.

## Accessibility

The bar is a `tablist` and each tab a `tab` with `aria-selected`; every tab is linked to the panel of the same `value` through `aria-controls` and `aria-labelledby`, with made-up ids. A panel is a focusable `tabpanel`, unless it has a `tabindex` of its own.
Focus roves, and the tab that receives focus is activated at once.

| Key | Does |
| --- | --- |
| `ArrowRight` `ArrowLeft` | Activates the next or previous tab, wrapping. |
| `Home` `End` | Activates the first or last tab. |

Give a tab with only an icon an `aria-label`.

## API

### `mo-tabs`

#### Properties

| Name | Attribute | Type | Default | Description |
| --- | --- | --- | --- | --- |
| `value` | `value` | `string \| undefined` |  | The `value` of the active tab, and therefore of the panel being shown |

#### Events

| Name | Detail | Description |
| --- | --- | --- |
| `change` | `string \| undefined` | Dispatched with the new value whenever the tabs change it themselves, as opposed to a `value` set from outside |

#### Slots

| Name | Description |
| --- | --- |
| (default) | The `mo-tab` elements |
| `panel` | The panels; a `mo-tab-panel` assigns itself to it |

#### CSS parts

| Name | Description |
| --- | --- |
| `bar` | The tab bar |

### `mo-tab`

A tab of a tab bar, with a label and an optional icon.

#### Properties

| Name | Attribute | Type | Default | Description |
| --- | --- | --- | --- | --- |
| `value` | `value` | `string` |  | Identifies the tab in the `value` of its bar, and pairs it with the panel of the same value |
| `inlineIcon` |  | `boolean` |  | Whether or not the icon renders inline with label or stacked vertically. |
| `isTab` |  | `true` | `true` | The attribute `md-tab` indicates that the element is a tab for the parent element, `<md-tabs>`. Make sure if you're implementing your own `md-tab` component that you have an `md-tab` attribute set. |
| `active` |  | `boolean` |  | Whether or not the tab is selected. |
| `hasIcon` |  | `boolean` |  | In SSR, set this to true when an icon is present. |
| `iconOnly` |  | `boolean` |  | In SSR, set this to true when there is no label and only an icon. |
|  | `inline-icon` |  |  | Places the icon beside the label instead of above it |
|  | `icon-only` |  |  | Marks a tab without a label during server-side rendering; detected on its own otherwise |

#### Slots

| Name | Description |
| --- | --- |
| (default) | The label |
| `icon` | The icon |

#### CSS custom properties

| Name | Description |
| --- | --- |
| `--mo-tab-accent-color` | The color of the active tab and its indicator |
| `--mo-tab-background-color` | The background of the tab |

### `mo-tab-bar`

A bar of tabs of which one is active, without panels of its own.

#### Properties

| Name | Attribute | Type | Default | Description |
| --- | --- | --- | --- | --- |
| `value` | `value` | `string \| undefined` |  | The `value` of the active tab |

#### Events

| Name | Detail | Description |
| --- | --- | --- |
| `change` | `string \| undefined` | Dispatched with the new value when another tab is activated |

#### Slots

| Name | Description |
| --- | --- |
| (default) | The `mo-tab` elements |

#### CSS custom properties

| Name | Description |
| --- | --- |
| `--mo-tab-divider-color` | The color of the line below the tabs |

### `mo-tab-panel`

One view of a tabbed interface: the content which a single tab reveals.

It belongs into a `mo-tabs` and stays in the DOM while hidden. It is focusable unless it is given a `tabindex`.

#### Properties

| Name | Attribute | Type | Default | Description |
| --- | --- | --- | --- | --- |
| `value` | `value` | `string \| undefined` |  | Pairs the panel with the tab of the same `value` |
| `active` | `active` | `boolean` | `false` | Whether this is the panel being shown; set by `mo-tabs`, meant to be read and styled |

#### Slots

| Name | Description |
| --- | --- |
| (default) | The content of the panel |

## Links

- [Documentation](https://3mo-esolutions.github.io/web-components/?path=/docs/layout-tabs--overview)
- [Changelog](https://3mo-esolutions.github.io/web-components/?path=/docs/layout-tabs--overview)
- [Source](https://github.com/3mo-esolutions/web-components/tree/main/packages/Tab)

## License

MIT © 3MO GmbH