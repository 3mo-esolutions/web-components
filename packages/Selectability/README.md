# Selectability

A Lit controller for single or multiple selection over items, with range and modifier gestures and ARIA.

[![npm](https://img.shields.io/npm/v/@3mo/selectability?style=flat-square&color=0077c8)](https://www.npmjs.com/package/@3mo/selectability) [![Documentation](https://img.shields.io/badge/docs-storybook-ff4785?style=flat-square&logo=storybook&logoColor=white)](https://3mo-esolutions.github.io/web-components/?path=/docs/behaviors-selectability--overview)

## Installation

```sh
npm install @3mo/selectability
```

```ts
import {
	SelectabilityController,
	Selectability,
	SelectabilityStrategy,
	SelectabilityAllState,
} from '@3mo/selectability'
```

## Examples

- [Default](https://3mo-esolutions.github.io/web-components/?path=/story/behaviors-selectability--default) — A plain click replaces the selection, ctrl/⌘+click adds an item, shift+click extends from the last one and ctrl/⌘+A takes everything.
- [Toggle Strategy](https://3mo-esolutions.github.io/web-components/?path=/story/behaviors-selectability--toggle-strategy) — `strategy: SelectabilityStrategy.Toggle` makes every click add or remove an item, as if it carried a checkbox; shift+click still extends.
- [Single Selection](https://3mo-esolutions.github.io/web-components/?path=/story/behaviors-selectability--single-selection) — `selectability: Selectability.Single` keeps at most one item selected; the range and preserve gestures act like a plain click.
- [Select All](https://3mo-esolutions.github.io/web-components/?path=/story/behaviors-selectability--select-all) — `allState` and `toggleAll()` drive a tri-state select-all.
- [Unselectable Items](https://3mo-esolutions.github.io/web-components/?path=/story/behaviors-selectability--unselectable-items) — Items `isSelectable` rejects ignore clicks, are left out of select-all and are stepped over by a range.
- [Beyond What Is Rendered](https://3mo-esolutions.github.io/web-components/?path=/story/behaviors-selectability--beyond-what-is-rendered) — `items` is the whole list, not what is rendered, so shift+click on a later page also selects every page in between.

## API

### Exports

| Name | Kind | Description |
| --- | --- | --- |
| `SelectabilityController` | class | Selection — of items declared inline in a template, or of whatever the owner calls its data. |
| `Selectability` | enum |  |
| `SelectabilityBehaviorOnItemsChange` | enum |  |
| `SelectabilityInteraction` | enum | Who turns an event into a selection. |
| `SelectabilityStrategy` | enum | What a PLAIN activation means under `SelectabilityInteraction.Auto`. |
| `SelectabilityAllState` | enum | How much of the SELECTABLE items the selection covers, so that unselectable ones cannot make `All` unreachable. |

## Links

- [Documentation](https://3mo-esolutions.github.io/web-components/?path=/docs/behaviors-selectability--overview)
- [Changelog](https://3mo-esolutions.github.io/web-components/?path=/docs/behaviors-selectability--overview)
- [Source](https://github.com/3mo-esolutions/web-components/tree/main/packages/Selectability)

## License

MIT © 3MO GmbH
