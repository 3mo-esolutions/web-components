import type { Meta, StoryObj } from '@storybook/web-components-vite'
import { html, style } from '@a11d/lit'
import p from './package.json'
import { ButtonType } from './Button.js'
import '.'
import '@3mo/selection-group'

export default {
	title: 'Buttons & Actions / Selectable Button',
	component: 'mo-selectable-button',
	args: {
		type: 'outlined',
		selected: false,
		disabled: false,
	},
	argTypes: {
		type: { control: 'select', options: [ButtonType.Text, ButtonType.Outlined, ButtonType.Elevated, ButtonType.Filled, ButtonType.Tonal] },
		selected: { control: 'boolean' },
		disabled: { control: 'boolean' },
	},
	package: p,
} as Meta

/** Every type, token, slot and part of a `mo-button` applies. `selected` is all that is added. */
export const SelectableButton: StoryObj = {
	render: ({ type, selected, disabled }) => html`
		<mo-selectable-button type=${type} startIcon='payments' ?selected=${selected} ?disabled=${disabled}>
			Cash
		</mo-selectable-button>
	`
}

export const Types: StoryObj = {
	render: () => html`
		<mo-flex gap='0.5rem' alignItems='start'>
			${[ButtonType.Text, ButtonType.Outlined, ButtonType.Elevated, ButtonType.Filled, ButtonType.Tonal].map(type => html`
				<mo-flex direction='horizontal' gap='0.5rem' alignItems='center'>
					<mo-selectable-button type=${type} startIcon='payments'>${type}</mo-selectable-button>
					<mo-selectable-button type=${type} startIcon='payments' selected>${type} selected</mo-selectable-button>
				</mo-flex>
			`)}
		</mo-flex>
	`
}

/** A set of them, driven by `mo-selection-group`, which writes the pattern they announce. */
export const InASelectionGroup: StoryObj = {
	render: ({ type }) => html`
		<mo-selection-group selectability='single' aria-label='Payment method'>
			${[
				{ value: 'cash', label: 'Cash', icon: 'payments' },
				{ value: 'card', label: 'Card', icon: 'credit_card' },
				{ value: 'voucher', label: 'Voucher', icon: 'confirmation_number' },
			].map(method => html`
				<mo-selectable-button type=${type} value=${method.value} startIcon=${method.icon}>${method.label}</mo-selectable-button>
			`)}
		</mo-selection-group>
	`
}

/** The selected look is plain CSS, so an outer `mo-selectable-button[selected]` rule replaces it. */
export const Customized: StoryObj = {
	render: ({ type, selected, disabled }) => html`
		<style>
			mo-selectable-button[selected] {
				background: transparent;
				--mo-button-accent-color: var(--mo-color-accent);
			}
		</style>
		<mo-selectable-button type=${type} startIcon='payments' ?selected=${selected} ?disabled=${disabled}
			${style({ '--mo-button-accent-color': 'var(--mo-color-gray)' })}
		>
			Cash
		</mo-selectable-button>
	`
}