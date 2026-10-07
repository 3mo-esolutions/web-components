import type { Meta, StoryObj } from '@storybook/web-components-vite'
import { html } from '@a11d/lit'
import { ButtonType } from './Button.js'
import './index.js'
import '@3mo/selection-group'

type Args = {
	readonly type: ButtonType
	readonly selected: boolean
	readonly disabled: boolean
}

export default {
	title: 'Actions / Selectable Button',
	component: 'mo-selectable-button',
	args: {
		type: ButtonType.Outlined,
		selected: false,
		disabled: false,
	},
	argTypes: {
		type: { control: 'select', options: Object.values(ButtonType) },
	},
	decorators: [story => html`<div style='display: flex; flex-wrap: wrap; align-items: center; gap: 12px'>${story()}</div>`],
} satisfies Meta<Args>

type Story = StoryObj<Args>

export const Default: Story = {
	render: ({ type, selected, disabled }) => html`
		<mo-selectable-button type=${type} startIcon='payments' ?selected=${selected} ?disabled=${disabled}>Cash</mo-selectable-button>
	`,
}

/** Every type of `mo-button`, unselected and selected. Press one to toggle it. */
export const Types: Story = {
	decorators: [story => html`<div style='display: grid; grid-template-columns: repeat(2, max-content); gap: 8px'>${story()}</div>`],
	render: () => html`
		<mo-selectable-button type='text' startIcon='payments'>Text</mo-selectable-button>
		<mo-selectable-button type='text' startIcon='payments' selected>Text</mo-selectable-button>
		<mo-selectable-button type='outlined' startIcon='payments'>Outlined</mo-selectable-button>
		<mo-selectable-button type='outlined' startIcon='payments' selected>Outlined</mo-selectable-button>
		<mo-selectable-button type='tonal' startIcon='payments'>Tonal</mo-selectable-button>
		<mo-selectable-button type='tonal' startIcon='payments' selected>Tonal</mo-selectable-button>
		<mo-selectable-button type='elevated' startIcon='payments'>Elevated</mo-selectable-button>
		<mo-selectable-button type='elevated' startIcon='payments' selected>Elevated</mo-selectable-button>
		<mo-selectable-button type='filled' startIcon='payments'>Filled</mo-selectable-button>
		<mo-selectable-button type='filled' startIcon='payments' selected>Filled</mo-selectable-button>
	`,
}

/** In a `mo-selection-group` the group owns the selection and the tab stop, and the buttons announce themselves as radios. */
export const InASelectionGroup: Story = {
	render: ({ type }) => html`
		<mo-selection-group selectability='single' aria-label='Payment method' value='cash'>
			<mo-selectable-button type=${type} value='cash' startIcon='payments'>Cash</mo-selectable-button>
			<mo-selectable-button type=${type} value='card' startIcon='credit_card'>Card</mo-selectable-button>
			<mo-selectable-button type=${type} value='voucher' startIcon='confirmation_number'>Voucher</mo-selectable-button>
		</mo-selection-group>
	`,
}

/** A disabled button keeps its selected state and ignores presses. */
export const Disabled: Story = {
	render: ({ type }) => html`
		<mo-selectable-button type=${type} startIcon='payments' disabled>Cash</mo-selectable-button>
		<mo-selectable-button type=${type} startIcon='payments' disabled selected>Cash</mo-selectable-button>
	`,
}

/** The selected look is plain CSS, so an outer `mo-selectable-button[selected]` rule replaces it. */
export const Customized: Story = {
	render: ({ type, disabled }) => html`
		<style>
			mo-selectable-button.outlined-when-selected[selected] {
				background: transparent;
				--mo-button-accent-color: var(--mo-color-accent);
			}
		</style>
		<mo-selectable-button class='outlined-when-selected' type=${type} startIcon='payments' ?disabled=${disabled}>Cash</mo-selectable-button>
		<mo-selectable-button class='outlined-when-selected' type=${type} startIcon='credit_card' ?disabled=${disabled} selected>Card</mo-selectable-button>
	`,
}
