import type { Meta, StoryObj } from '@storybook/web-components-vite'
import { html } from '@a11d/lit'
import { sourceOf } from '../../.storybook/source.js'
import countryComboboxSource from './stories/CountryCombobox.ts?raw'
import searchPopupComboboxSource from './stories/SearchPopupCombobox.ts?raw'
import './stories/CountryCombobox.js'
import './stories/SearchPopupCombobox.js'

export default {
	title: 'Behaviors / Combobox',
	parameters: { controller: 'ComboboxController' },
	decorators: [story => html`<div style='min-block-size: 20rem'>${story()}</div>`],
} satisfies Meta

/**
 * ↓ or ↑ opens the list onto the chosen country and Esc closes it; each new filter makes its first match active, so Enter takes it.
 * Focus never leaves the input.
 */
export const Default: StoryObj = {
	parameters: sourceOf(countryComboboxSource),
	render: () => html`<story-country-combobox></story-country-combobox>`,
}

/** A button opens a popup with its own search box, which is the combobox. Enter, a click, Esc or Tab closes it again. */
export const SearchInPopup: StoryObj = {
	parameters: sourceOf(searchPopupComboboxSource),
	render: () => html`<story-search-popup-combobox></story-search-popup-combobox>`,
}
