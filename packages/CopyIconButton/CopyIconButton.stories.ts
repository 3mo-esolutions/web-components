import type { Meta, StoryObj } from '@storybook/web-components-vite'
import { html } from '@a11d/lit'
import './index.js'
import '@3mo/flex'
import '@3mo/icon'

type Args = {
	readonly value: string
	readonly label: string
	readonly disabled: boolean
	readonly dense: boolean
	readonly feedbackDuration: number
}

export default {
	title: 'Actions / Copy Icon Button',
	component: 'mo-copy-icon-button',
	args: {
		value: 'https://www.3mo.de',
		label: 'Copy link',
		disabled: false,
		dense: false,
		feedbackDuration: 1500,
	},
	decorators: [story => html`<div style='display: flex; flex-wrap: wrap; align-items: center; gap: 16px'>${story()}</div>`],
} satisfies Meta<Args>

type Story = StoryObj<Args>

export const Default: Story = {
	render: ({ value, label, disabled, dense, feedbackDuration }) => html`
		<mo-copy-icon-button value=${value} label=${label} ?disabled=${disabled} ?dense=${dense} feedbackDuration=${feedbackDuration}></mo-copy-icon-button>
	`,
}

/** Beside the value it copies, the button confirms in place, and a `label` for each tells them apart on hover and to a screen reader. */
export const NextToAValue: Story = {
	render: () => html`
		<style>
			#credentials {
				font-family: var(--mo-font-family-mono);
				background: var(--mo-color-transparent-gray-3);
				border-radius: var(--mo-border-radius);
				padding: 8px 8px 8px 16px;
				max-width: 460px;
			}

			#credentials mo-flex[direction=horizontal] {
				min-height: 32px;
			}

			#credentials span {
				font-family: initial;
				color: var(--mo-color-gray);
				min-width: 90px;
			}
		</style>
		<mo-flex id='credentials' gap='4px'>
			<mo-flex direction='horizontal' gap='12px' alignItems='center'>
				<span>Endpoint</span>
				https://api.3mo.de/v2
				<mo-copy-icon-button dense label='Copy endpoint' value='https://api.3mo.de/v2' style='margin-inline-start: auto'></mo-copy-icon-button>
			</mo-flex>
			<mo-flex direction='horizontal' gap='12px' alignItems='center'>
				<span>API key</span>
				sk_live_9f2c4a1ab7e
				<mo-copy-icon-button dense label='Copy API key' value='sk_live_9f2c4a1ab7e' style='margin-inline-start: auto'></mo-copy-icon-button>
			</mo-flex>
		</mo-flex>
	`,
}

/** `icon`, `successIcon` and `errorIcon` pick the Material icon of each state. */
export const Icons: Story = {
	render: () => html`
		<mo-copy-icon-button value='https://www.3mo.de/share/8f21' icon='insert_link' successIcon='done_all'></mo-copy-icon-button>
		<mo-copy-icon-button value='' icon='key' errorIcon='block'></mo-copy-icon-button>
	`,
}

/** Each state takes its content from a slot, so a button that copies a color can show it. */
export const Slots: Story = {
	render: () => html`
		<mo-copy-icon-button value='#5daa60'>
			<mo-icon slot='icon' icon='palette' style='color: #5daa60'></mo-icon>
		</mo-copy-icon-button>
		<mo-copy-icon-button value='🎉'>
			<span slot='icon'>🎨</span>
			<span slot='success-icon'>🎉</span>
		</mo-copy-icon-button>
	`,
}

/** A clipboard that refuses the value, as outside a secure context, or an empty value ends in the error state and fires `copyError` with the reason. */
export const WhenCopyingFails: Story = {
	render: () => html`<mo-copy-icon-button value=''></mo-copy-icon-button>`,
}

/** `dense` reduces the size, and a disabled button ignores presses. */
export const DenseAndDisabled: Story = {
	render: () => html`
		<mo-copy-icon-button value='https://www.3mo.de' dense></mo-copy-icon-button>
		<mo-copy-icon-button value='https://www.3mo.de' disabled></mo-copy-icon-button>
		<mo-copy-icon-button value='https://www.3mo.de' dense disabled></mo-copy-icon-button>
	`,
}

/** The colors of success and failure are custom properties. Press both. */
export const CustomProperties: Story = {
	render: () => html`
		<mo-copy-icon-button value='https://www.3mo.de' style='--mo-copy-icon-button-success-color: var(--mo-color-accent)'></mo-copy-icon-button>
		<mo-copy-icon-button value='' style='--mo-copy-icon-button-error-color: var(--mo-color-yellow)'></mo-copy-icon-button>
	`,
}
