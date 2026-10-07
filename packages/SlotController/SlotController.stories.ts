import type { Meta, StoryObj } from '@storybook/web-components-vite'
import { html } from '@a11d/lit'
import { useState } from 'storybook/preview-api'
import { sourceOf } from '../../.storybook/source.js'
import slotCardSource from './stories/SlotCard.ts?raw'
import './stories/SlotCard.js'

export default {
	title: 'Behaviors / Slot Controller',
} satisfies Meta

/** The card asks the controller whether its `heading` and `footer` slots hold anything, and renders their areas only then. */
export const Default: StoryObj = {
	parameters: sourceOf(slotCardSource),
	render: () => html`
		<story-slot-card>
			<span slot='heading'>Invoice 1024</span>
			Due in 14 days.
			<mo-button slot='footer' type='filled'>Pay</mo-button>
		</story-slot-card>
	`,
}

/** With nothing slotted into `heading` or `footer`, neither area renders. The controller answers from the children before a slot exists. */
export const EmptySlots: StoryObj = {
	render: () => html`<story-slot-card>Due in 14 days.</story-slot-card>`,
}

/** Adding or removing slotted children re-renders the host. Turn the switch on and the footer goes away with its button. */
export const ChangingContent: StoryObj = {
	decorators: [story => html`<mo-flex gap='16px'>${story()}</mo-flex>`],
	render: () => {
		const [paid, setPaid] = useState(false)
		return html`
			<mo-switch label='Paid' ?selected=${paid} @change=${(event: CustomEvent<boolean>) => setPaid(event.detail)}></mo-switch>
			<story-slot-card>
				<span slot='heading'>Invoice 1024</span>
				${paid ? 'Paid, thank you.' : 'Due in 14 days.'}
				${paid ? html.nothing : html`<mo-button slot='footer' type='filled'>Pay</mo-button>`}
			</story-slot-card>
		`
	},
}
