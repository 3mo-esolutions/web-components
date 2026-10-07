import type { Meta, StoryObj } from '@storybook/web-components-vite'
import { html } from '@a11d/lit'
import { fn } from 'storybook/test'
import { countries, flag } from '../../stories/index.js'
import './index.js'

type Args = {
	readonly default: string
	readonly multiple: boolean
	readonly searchable: boolean
	readonly disabled: boolean
	readonly readonly: boolean
	readonly onAddCountry?: (event: Event) => void
}

export default {
	title: 'Inputs / Select Field',
	component: 'mo-field-select',
	args: {
		default: 'No selection',
		multiple: false,
		searchable: false,
		disabled: false,
		readonly: false,
	},
	decorators: [story => html`<div style='min-height: 350px; display: grid; grid-template-columns: repeat(auto-fill, minmax(240px, 300px)); gap: 16px; align-content: start'>${story()}</div>`],
} satisfies Meta<Args>

type Story = StoryObj<Args>

export const Default: Story = {
	render: ({ default: defaultText, multiple, searchable, disabled, readonly }) => html`
		<mo-field-select label='Country' default=${defaultText} ?multiple=${multiple} ?searchable=${searchable} ?disabled=${disabled} ?readonly=${readonly}>
			<mo-option value='DE'>Germany</mo-option>
			<mo-option value='FR'>France</mo-option>
			<mo-option value='IT'>Italy</mo-option>
			<mo-option value='ES'>Spain</mo-option>
			<mo-option value='NL'>Netherlands</mo-option>
		</mo-field-select>
	`,
}

/** `value` selects the option with that value, and takes an array when the field is `multiple`. */
export const Value: Story = {
	render: () => html`
		<mo-field-select label='Country' value='FR'>
			<mo-option value='DE'>Germany</mo-option>
			<mo-option value='FR'>France</mo-option>
			<mo-option value='IT'>Italy</mo-option>
		</mo-field-select>
		<mo-field-select label='Countries' multiple .value=${['DE', 'IT']}>
			<mo-option value='DE'>Germany</mo-option>
			<mo-option value='FR'>France</mo-option>
			<mo-option value='IT'>Italy</mo-option>
		</mo-field-select>
	`,
}

/** The same selection is also `index`, the option's position, and `data`, the object it carries. Set whichever you have; each change fires its own event. */
export const IndexAndData: Story = {
	render: () => html`
		<mo-field-select label='By index' index='2'>
			<mo-option>Germany</mo-option>
			<mo-option>France</mo-option>
			<mo-option>Italy</mo-option>
		</mo-field-select>
		<mo-field-select label='By data' .data=${{ code: 'IT', label: 'Italy' }}>
			<mo-option .data=${{ code: 'DE', label: 'Germany' }}>Germany</mo-option>
			<mo-option .data=${{ code: 'FR', label: 'France' }}>France</mo-option>
			<mo-option .data=${{ code: 'IT', label: 'Italy' }}>Italy</mo-option>
		</mo-field-select>
	`,
}

/** An option holds any content, such as a flag, while the input shows its text. With every country the menu scrolls. */
export const OptionContent: Story = {
	render: ({ multiple, searchable }) => html`
		<mo-field-select label='Country' ?multiple=${multiple} ?searchable=${searchable}>
			${countries.map(country => html`
				<mo-option value=${country.code} .data=${country}>
					<img width='25' alt='' src=${flag(country.code)}>
					${country.label}
				</mo-option>
			`)}
		</mo-field-select>
	`,
}

/** Opening the menu scrolls to the selection far down the list, and ArrowDown steps on from it to Uruguay rather than from the top. */
export const ValueFarDownTheList: Story = {
	render: ({ searchable }) => html`
		<mo-field-select label='Country' ?searchable=${searchable} value='US'>
			${countries.map(country => html`<mo-option value=${country.code}>${country.label}</mo-option>`)}
		</mo-field-select>
		<mo-field-select label='Countries' ?searchable=${searchable} multiple .value=${['UG', 'US']}>
			${countries.map(country => html`<mo-option value=${country.code}>${country.label}</mo-option>`)}
		</mo-field-select>
	`,
}

/** `default` adds a first item that clears the selection; with `reflectDefault` the input shows its text while nothing is selected. */
export const DefaultOption: Story = {
	render: () => html`
		<mo-field-select label='Country' default='Any country'>
			<mo-option value='DE'>Germany</mo-option>
			<mo-option value='FR'>France</mo-option>
			<mo-option value='IT'>Italy</mo-option>
		</mo-field-select>
		<mo-field-select label='Country' default='Any country' reflectDefault>
			<mo-option value='DE'>Germany</mo-option>
			<mo-option value='FR'>France</mo-option>
			<mo-option value='IT'>Italy</mo-option>
		</mo-field-select>
	`,
}

/** `multiple` gives every option a checkbox and keeps the menu open while you pick through them; the input lists the selected options, cut short when they do not fit and shown whole on hover. */
export const Multiple: Story = {
	render: () => html`
		<mo-field-select label='Countries' multiple>
			${countries.slice(0, 20).map(country => html`<mo-option value=${country.code}>${country.label}</mo-option>`)}
		</mo-field-select>
	`,
}

/** `searchable` filters the options to those holding every word you type, in any order and whatever its accents, and says so when none does. Enter takes the first match; the arrow keys reach the others. */
export const Searchable: Story = {
	render: ({ multiple }) => html`
		<mo-field-select label='Country' searchable ?multiple=${multiple}>
			${countries.map(country => html`<mo-option value=${country.code}>${country.label}</mo-option>`)}
		</mo-field-select>
	`,
}

/**
 * `freeInput` keeps what you type as the value once you press Enter or leave the field, and fires `change` with the text.
 * Typing an option's text, or picking one, selects that option instead. Escape with the menu closed takes back what was typed - watch the Actions panel.
 */
export const FreeInput: Story = {
	render: ({ default: defaultText, multiple }) => html`
		<mo-field-select label='Country' searchable freeInput default=${defaultText} ?multiple=${multiple} value='DE'>
			${countries.map(country => html`<mo-option value=${country.code} .data=${country}>${country.label}</mo-option>`)}
		</mo-field-select>
	`,
}

/** A list item that is not an option is an action: the arrow keys reach it, and choosing it runs its click without selecting anything. */
export const Actions: Story = {
	args: {
		onAddCountry: fn(),
	},
	render: ({ onAddCountry }) => html`
		<mo-field-select label='Country' value='DE'>
			<mo-list-item icon='add' @click=${onAddCountry}>Add a country</mo-list-item>
			<mo-option value='DE'>Germany</mo-option>
			<mo-option value='FR'>France</mo-option>
			<mo-option value='IT'>Italy</mo-option>
		</mo-field-select>
	`,
}

/** A disabled field ignores input, a readonly one shows its value without letting it change, a required one turns invalid once its selection is cleared, and a dense one is shorter. */
export const States: Story = {
	render: () => html`
		<mo-field-select label='Disabled' disabled value='DE'>
			<mo-option value='DE'>Germany</mo-option>
			<mo-option value='FR'>France</mo-option>
		</mo-field-select>
		<mo-field-select label='Readonly' readonly value='DE'>
			<mo-option value='DE'>Germany</mo-option>
			<mo-option value='FR'>France</mo-option>
		</mo-field-select>
		<mo-field-select label='Required' required default='None' value='DE'>
			<mo-option value='DE'>Germany</mo-option>
			<mo-option value='FR'>France</mo-option>
		</mo-field-select>
		<mo-field-select label='Dense' dense value='DE'>
			<mo-option value='DE'>Germany</mo-option>
			<mo-option value='FR'>France</mo-option>
		</mo-field-select>
	`,
}

/** The `list` part laid out as a grid, with every option as a subgrid row, lines up flags, dialling codes and names; `inputText` is what the input shows. */
export const SubgridLayout: Story = {
	render: ({ multiple, searchable }) => html`
		<style>
			mo-field-select.columns {
				&::part(list) {
					display: grid;
					column-gap: 1em;
					grid-template-columns: auto auto 1fr;
				}

				& > * {
					display: grid;
					grid-column: 1 / -1;
					grid-template-columns: subgrid;
				}
			}
		</style>
		<mo-field-select class='columns' label='Country' ?multiple=${multiple} ?searchable=${searchable} value='DE'>
			${countries.map(country => html`
				<mo-option value=${country.code} inputText=${country.label}>
					<img width='25' alt='' src=${flag(country.code)}>
					<span style='opacity: 0.5'>+${country.phone}</span>
					<span>${country.label}</span>
				</mo-option>
			`)}
		</mo-field-select>
	`,
}
