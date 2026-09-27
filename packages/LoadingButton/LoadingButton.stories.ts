import type { Meta, StoryObj } from '@storybook/web-components-vite'
import { html } from '@a11d/lit'
import { useState } from 'storybook/preview-api'
import { fn } from 'storybook/test'
import { ButtonType } from '@3mo/button'
import './index.js'

type Args = {
	readonly type: ButtonType
	readonly disabled: boolean
	readonly loading: boolean
	readonly onHelp?: (event: Event) => void
}

export default {
	title: 'Actions / Loading Button',
	component: 'mo-loading-button',
	args: {
		type: ButtonType.Outlined,
		disabled: false,
		loading: false,
	},
	argTypes: {
		type: { control: 'select', options: Object.values(ButtonType) },
	},
	decorators: [story => html`<div style='display: flex; flex-wrap: wrap; align-items: center; gap: 12px'>${story()}</div>`],
} satisfies Meta<Args>

type Story = StoryObj<Args>

export const Default: Story = {
	render: ({ type, disabled, loading }) => html`
		<mo-loading-button type=${type} ?disabled=${disabled} ?loading=${loading} @click=${() => new Promise(resolve => setTimeout(resolve, 2000))}>Save</mo-loading-button>
	`,
}

/** A `click` handler that returns a promise keeps the button loading until it settles. Press each one. */
export const Types: Story = {
	render: ({ disabled }) => html`
		<mo-loading-button type='text' ?disabled=${disabled} @click=${() => new Promise(resolve => setTimeout(resolve, 2000))}>Text</mo-loading-button>
		<mo-loading-button type='outlined' ?disabled=${disabled} @click=${() => new Promise(resolve => setTimeout(resolve, 2000))}>Outlined</mo-loading-button>
		<mo-loading-button type='tonal' ?disabled=${disabled} @click=${() => new Promise(resolve => setTimeout(resolve, 2000))}>Tonal</mo-loading-button>
		<mo-loading-button type='elevated' ?disabled=${disabled} @click=${() => new Promise(resolve => setTimeout(resolve, 2000))}>Elevated</mo-loading-button>
		<mo-loading-button type='filled' ?disabled=${disabled} @click=${() => new Promise(resolve => setTimeout(resolve, 2000))}>Filled</mo-loading-button>
	`,
}

/** While loading, the progress covers the label, or takes the place of the start icon when there is one. */
export const Loading: Story = {
	render: ({ type }) => html`
		<mo-loading-button type=${type} loading>Save</mo-loading-button>
		<mo-loading-button type=${type} loading startIcon='save'>Save</mo-loading-button>
		<mo-loading-button type=${type} loading endIcon='arrow_forward'>Next</mo-loading-button>
	`,
}

/** Icons work as on `mo-button`. Press each to see where the progress appears. */
export const Icons: Story = {
	render: ({ type, disabled }) => html`
		<mo-loading-button type=${type} ?disabled=${disabled} startIcon='add' @click=${() => new Promise(resolve => setTimeout(resolve, 2000))}>Add</mo-loading-button>
		<mo-loading-button type=${type} ?disabled=${disabled} endIcon='done' @click=${() => new Promise(resolve => setTimeout(resolve, 2000))}>Done</mo-loading-button>
		<mo-loading-button type=${type} ?disabled=${disabled} startIcon='download' endIcon='expand_more' @click=${() => new Promise(resolve => setTimeout(resolve, 2000))}>Export</mo-loading-button>
	`,
}

/** The label and the `start` and `end` slots take any content; the progress keeps to the size of the button. */
export const Slots: Story = {
	render: ({ type, disabled }) => html`
		<mo-loading-button type=${type} ?disabled=${disabled} @click=${() => new Promise(resolve => setTimeout(resolve, 2000))}>
			<mo-icon icon='delete'></mo-icon>
		</mo-loading-button>
		<mo-loading-button type=${type} ?disabled=${disabled} style='min-height: 56px; min-width: 220px' @click=${() => new Promise(resolve => setTimeout(resolve, 2000))}>
			<mo-flex>
				<span style='font-size: 12px'>To pay</span>
				<span style='font-size: 22px'>0.0001₿</span>
			</mo-flex>
		</mo-loading-button>
		<mo-loading-button type=${type} ?disabled=${disabled} style='min-height: 56px; min-width: 220px' @click=${() => new Promise(resolve => setTimeout(resolve, 2000))}>
			<mo-flex>
				<span style='font-size: 12px'>To pay</span>
				<span style='font-size: 22px'>0.0001</span>
			</mo-flex>
			<span slot='end' style='font-size: 32px'>₿</span>
		</mo-loading-button>
	`,
}

/** `preventClickEventInference` ignores what the handlers return, so `loading` is yours to set. */
export const ManualLoading: Story = {
	render: ({ type, disabled }) => {
		const [loading, setLoading] = useState(false)
		return html`
			<mo-loading-button type=${type} ?disabled=${disabled} preventClickEventInference ?loading=${loading}
				@click=${() => { setLoading(true); setTimeout(() => setLoading(false), 2000) }}
			>Sync</mo-loading-button>
		`
	},
}

/** An interactive element in a slot handles its own presses; stopping their propagation keeps the button from loading. */
export const NestedAction: Story = {
	args: {
		onHelp: fn(),
	},
	render: ({ type, disabled, onHelp }) => html`
		<mo-loading-button type=${type} ?disabled=${disabled} @click=${() => new Promise(resolve => setTimeout(resolve, 2000))}>
			Proceed
			<mo-icon-button slot='end' icon='help' dense ?disabled=${disabled} @click=${(event: Event) => { event.stopImmediatePropagation(); onHelp?.(event) }}></mo-icon-button>
		</mo-loading-button>
	`,
}

/** The custom properties of `mo-button` apply, and the corner radius is the host's own `border-radius`. */
export const CustomProperties: Story = {
	render: ({ disabled }) => html`
		<mo-loading-button type='filled' ?disabled=${disabled} style='border-radius: 100px' @click=${() => new Promise(resolve => setTimeout(resolve, 2000))}>Rounded</mo-loading-button>
		<mo-loading-button type='outlined' ?disabled=${disabled} style='min-height: 56px; --mo-button-accent-color: var(--mo-color-red)' @click=${() => new Promise(resolve => setTimeout(resolve, 2000))}>
			<span slot='start' style='font-size: 32px'>⚠️</span>
			<mo-flex>
				<span style='font-size: 12px'>Danger</span>
				<span style='font-size: 22px'>Proceed at your own risk</span>
			</mo-flex>
		</mo-loading-button>
	`,
}