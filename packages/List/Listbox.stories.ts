import type { Meta, StoryObj } from '@storybook/web-components-vite'
import { html } from '@a11d/lit'
import { sourceOf } from '../../.storybook/source.js'
import fruitListboxSource from './stories/FruitListbox.ts?raw'
import toppingsListboxSource from './stories/ToppingsListbox.ts?raw'
import filterableListboxSource from './stories/FilterableListbox.ts?raw'
import produceListboxSource from './stories/ProduceListbox.ts?raw'
import { countries } from '../../stories/index.js'
import type { ListboxOrientation } from './ListboxController.js'
import './stories/FruitListbox.js'
import './stories/ToppingsListbox.js'
import './stories/FilterableListbox.js'
import './stories/ProduceListbox.js'

export default {
	title: 'Behaviors / Listbox',
	parameters: { controller: 'ListboxController' },
} satisfies Meta

/** Tab in, then the arrows, Home, End and typing a name move; Space or Enter selects. */
export const Default: StoryObj<{ selectionFollowsFocus: boolean, orientation: ListboxOrientation }> = {
	args: { selectionFollowsFocus: false, orientation: 'vertical' },
	argTypes: { orientation: { control: 'inline-radio', options: ['vertical', 'horizontal'] } },
	parameters: sourceOf(fruitListboxSource),
	render: ({ selectionFollowsFocus, orientation }) => html`
		<story-fruit-listbox ?selectionFollowsFocus=${selectionFollowsFocus} orientation=${orientation}></story-fruit-listbox>
	`,
}

/** `selectionFollowsFocus` selects whichever option the arrows reach, as a single-select listbox of few options may. */
export const SelectionFollowsFocus: StoryObj = {
	render: () => html`<story-fruit-listbox selectionFollowsFocus></story-fruit-listbox>`,
}

/** `orientation: 'horizontal'` moves with ← and →, which follow the writing direction. */
export const Horizontal: StoryObj = {
	render: () => html`<story-fruit-listbox orientation='horizontal'></story-fruit-listbox>`,
}

/**
 * Space or a click toggles one option, Shift+arrow and Shift+Space extend a range, Ctrl+Shift+Home or End select to either end,
 * and Ctrl+A selects all or none. The sold-out option is skipped.
 */
export const MultipleSelection: StoryObj = {
	parameters: sourceOf(toppingsListboxSource),
	render: () => html`<story-toppings-listbox></story-toppings-listbox>`,
}

/** With `combobox`, focus stays in the input and the active option is announced on it by element reference; Home, End, ← and → stay the input's. */
export const FilterAsYouType: StoryObj = {
	parameters: sourceOf(filterableListboxSource),
	render: () => html`
		<story-filterable-listbox>
			${countries.map(country => html`<div>${country.label}</div>`)}
		</story-filterable-listbox>
	`,
}

/** Options in labelled groups: the arrows run straight on from one group into the next, while a screen reader counts within each. */
export const Grouped: StoryObj = {
	parameters: sourceOf(produceListboxSource),
	render: () => html`<story-produce-listbox></story-produce-listbox>`,
}
