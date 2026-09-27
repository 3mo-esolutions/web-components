import type { Meta, StoryObj } from '@storybook/web-components-vite'
import { html } from '@a11d/lit'
import { fn } from 'storybook/test'
import { ButtonType } from './Button.js'
import './index.js'

type Args = {
	readonly type: ButtonType
	readonly disabled: boolean
	readonly onProceed?: (event: Event) => void
	readonly onHelp?: (event: Event) => void
}

export default {
	title: 'Actions / Button',
	component: 'mo-button',
	args: {
		type: ButtonType.Outlined,
		disabled: false,
	},
	argTypes: {
		type: { control: 'select', options: Object.values(ButtonType) },
	},
	decorators: [story => html`<div style='display: flex; flex-wrap: wrap; align-items: center; gap: 12px'>${story()}</div>`],
} satisfies Meta<Args>

type Story = StoryObj<Args>

export const Default: Story = {
	render: ({ type, disabled }) => html`<mo-button type=${type} ?disabled=${disabled}>Save</mo-button>`,
}

/** From `text` for the least important action to `filled` for the one that completes a task. */
export const Types: Story = {
	render: ({ disabled }) => html`
		<mo-button type='text' ?disabled=${disabled}>Text</mo-button>
		<mo-button type='outlined' ?disabled=${disabled}>Outlined</mo-button>
		<mo-button type='tonal' ?disabled=${disabled}>Tonal</mo-button>
		<mo-button type='elevated' ?disabled=${disabled}>Elevated</mo-button>
		<mo-button type='filled' ?disabled=${disabled}>Filled</mo-button>
	`,
}

/** A disabled button keeps its type, fades and ignores presses. */
export const Disabled: Story = {
	render: () => html`
		<mo-button type='text' disabled>Text</mo-button>
		<mo-button type='outlined' disabled>Outlined</mo-button>
		<mo-button type='tonal' disabled>Tonal</mo-button>
		<mo-button type='elevated' disabled>Elevated</mo-button>
		<mo-button type='filled' disabled>Filled</mo-button>
	`,
}

/** Icons take Material icon names and follow the writing direction - pick a right-to-left language in the toolbar to see them swap sides. */
export const Icons: Story = {
	render: ({ type, disabled }) => html`
		<mo-button type=${type} ?disabled=${disabled} startIcon='add'>Add</mo-button>
		<mo-button type=${type} ?disabled=${disabled} endIcon='arrow_forward'>Next</mo-button>
		<mo-button type=${type} ?disabled=${disabled} startIcon='download' endIcon='expand_more'>Export</mo-button>
	`,
}

/** The `start` and `end` slots take any content in place of the icons, and the label may hold more than text. */
export const Slots: Story = {
	render: ({ type, disabled }) => html`
		<mo-button type=${type} ?disabled=${disabled}>
			<mo-icon icon='delete'></mo-icon>
		</mo-button>
		<mo-button type=${type} ?disabled=${disabled} style='min-height: 56px; min-width: 220px'>
			<mo-flex>
				<span style='font-size: 12px'>To pay</span>
				<span style='font-size: 22px'>€ 1,204.50</span>
			</mo-flex>
			<mo-icon slot='end' icon='payments' style='font-size: 32px'></mo-icon>
		</mo-button>
	`,
}

/** A label that does not fit is truncated with an ellipsis. */
export const Overflow: Story = {
	render: ({ type, disabled }) => html`
		<mo-button type=${type} ?disabled=${disabled} style='max-width: 200px'>Save the changes made to this document</mo-button>
	`,
}

/** An interactive element in a slot handles its own presses; stopping their propagation keeps the button from firing too. */
export const NestedAction: Story = {
	args: {
		onProceed: fn(),
		onHelp: fn(),
	},
	render: ({ type, disabled, onProceed, onHelp }) => html`
		<mo-button type=${type} ?disabled=${disabled} @click=${onProceed}>
			Proceed
			<mo-icon-button slot='end' icon='help' dense @click=${(event: Event) => { event.stopPropagation(); onHelp?.(event) }}></mo-icon-button>
		</mo-button>
	`,
}

/** Colors and padding are custom properties; the corner radius is the host's own `border-radius`. */
export const CustomProperties: Story = {
	render: () => html`
		<mo-button type='outlined' style='--mo-button-accent-color: var(--mo-color-red)'>Delete</mo-button>
		<mo-button type='filled' style='--mo-button-accent-color: #ffb300; --mo-button-on-accent-color: black'>Warn</mo-button>
		<mo-button type='outlined' style='--mo-button-horizontal-padding: 48px'>Wide</mo-button>
		<mo-button type='filled' style='border-radius: 100px'>Rounded</mo-button>
		<mo-button type='filled' disabled style='--mo-button-disabled-color: var(--mo-color-red); --mo-button-disabled-background-color: var(--mo-color-red)'>Disabled</mo-button>
	`,
}

/** The `ripple` and `focus-ring` parts can be restyled or hidden from outside. */
export const Parts: Story = {
	render: ({ type, disabled }) => html`
		<style>
			.no-ripple::part(ripple) { display: none; }
			.no-focus-ring::part(focus-ring) { display: none; }
		</style>
		<mo-button class='no-ripple' type=${type} ?disabled=${disabled}>Without ripple</mo-button>
		<mo-button class='no-focus-ring' type=${type} ?disabled=${disabled}>Without focus ring</mo-button>
	`,
}