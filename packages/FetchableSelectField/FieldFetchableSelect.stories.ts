import type { Meta, StoryObj } from '@storybook/web-components-vite'
import { html } from '@a11d/lit'
import { useState } from 'storybook/preview-api'
import { fetchCountries, type Country } from '../../stories/index.js'
import './index.js'

type Args = {
	readonly default: string
	readonly multiple: boolean
	readonly searchable: boolean
}

export default {
	title: 'Inputs / Fetchable Select Field',
	component: 'mo-field-fetchable-select',
	args: {
		default: 'No selection',
		multiple: false,
		searchable: false,
	},
	decorators: [story => html`<div style='min-height: 350px; display: grid; grid-template-columns: repeat(auto-fill, minmax(240px, 300px)); gap: 16px; align-content: start'>${story()}</div>`],
} satisfies Meta<Args>

type Story = StoryObj<Args>

export const Default: Story = {
	render: ({ default: defaultText, multiple, searchable }) => html`
		<mo-field-fetchable-select label='Country' default=${defaultText} ?multiple=${multiple} ?searchable=${searchable}
			.fetch=${() => Promise.resolve([{ code: 'DE', label: 'Germany' }, { code: 'FR', label: 'France' }, { code: 'IT', label: 'Italy' }])}
			.optionTemplate=${(country: { code: string, label: string }) => html`<mo-option value=${country.code}>${country.label}</mo-option>`}
		></mo-field-fetchable-select>
	`,
}

/** `searchParameters` turns what is typed into parameters for `fetch`, so the server searches, half a second after the last key. A bar runs along the field while it fetches, and the menu says it is searching until the answer to what is typed arrives. */
export const ServerSearch: Story = {
	render: () => html`
		<mo-field-fetchable-select label='Country' searchable
			.fetch=${fetchCountries}
			.searchParameters=${(keyword: string) => ({ keyword })}
			.optionTemplate=${(country: Country) => html`<mo-option value=${country.code}>${country.label}</mo-option>`}
		></mo-field-fetchable-select>
	`,
}

/** A change to `parameters` fetches again; each answer also fires `dataFetch`. Toggle the checkbox. */
export const Parameters: Story = {
	render: () => {
		const [suggestedOnly, setSuggestedOnly] = useState(true)
		return html`
			<mo-field-fetchable-select label='Country'
				.fetch=${fetchCountries}
				.parameters=${{ suggestedOnly }}
				.optionTemplate=${(country: Country) => html`<mo-option value=${country.code}>${country.label}</mo-option>`}
			></mo-field-fetchable-select>
			<mo-checkbox label='Suggested only' .selected=${suggestedOnly} @change=${(event: CustomEvent<boolean | 'indeterminate'>) => setSuggestedOnly(event.detail === true)}></mo-checkbox>
		`
	},
}

/** `value` may be set before the options arrive; the field shows the selection as soon as they do. */
export const Value: Story = {
	render: () => html`
		<mo-field-fetchable-select label='Country' value='DE'
			.fetch=${fetchCountries}
			.optionTemplate=${(country: Country) => html`<mo-option value=${country.code}>${country.label}</mo-option>`}
		></mo-field-fetchable-select>
		<mo-field-fetchable-select label='Countries' multiple .value=${['DE', 'FR']}
			.fetch=${fetchCountries}
			.optionTemplate=${(country: Country) => html`<mo-option value=${country.code}>${country.label}</mo-option>`}
		></mo-field-fetchable-select>
	`,
}

/** Only the first `optionsRenderLimit` fetched options render, 250 unless set; searching the server reaches the rest. */
export const OptionsRenderLimit: Story = {
	render: () => html`
		<mo-field-fetchable-select label='Country' searchable optionsRenderLimit='10'
			.fetch=${fetchCountries}
			.searchParameters=${(keyword: string) => ({ keyword })}
			.optionTemplate=${(country: Country) => html`<mo-option value=${country.code}>${country.label}</mo-option>`}
		></mo-field-fetchable-select>
	`,
}

/** Without `optionTemplate`, each fetched item becomes an option showing it as text, with its position as the value. */
export const DefaultOptionTemplate: Story = {
	render: () => html`
		<mo-field-fetchable-select label='Color' .fetch=${() => Promise.resolve(['Red', 'Green', 'Blue'])}></mo-field-fetchable-select>
	`,
}
