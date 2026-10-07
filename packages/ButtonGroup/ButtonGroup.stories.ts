import type { Meta, StoryObj } from '@storybook/web-components-vite'
import { html } from '@a11d/lit'
import { ButtonType } from '@3mo/button'
import './index.js'

type Args = {
	readonly type: ButtonType
	readonly direction: 'horizontal' | 'vertical' | 'horizontal-reversed' | 'vertical-reversed'
}

export default {
	title: 'Actions / Button Group',
	component: 'mo-button-group',
	args: {
		type: ButtonType.Outlined,
		direction: 'horizontal',
	},
	argTypes: {
		type: { control: 'select', options: [ButtonType.Text, ButtonType.Outlined, ButtonType.Tonal, ButtonType.Filled] },
		direction: { control: 'select', options: ['horizontal', 'vertical', 'horizontal-reversed', 'vertical-reversed'] },
	},
	decorators: [story => html`<div style='display: flex; flex-wrap: wrap; align-items: flex-start; gap: 24px'>${story()}</div>`],
} satisfies Meta<Args>

type Story = StoryObj<Args>

export const Default: Story = {
	render: ({ type, direction }) => html`
		<mo-button-group type=${type} direction=${direction}>
			<mo-button>Day</mo-button>
			<mo-button>Week</mo-button>
			<mo-button>Month</mo-button>
		</mo-button-group>
	`,
}

/** The group's `type` is given to every button in it. Every type but `elevated` is supported. */
export const Types: Story = {
	render: ({ direction }) => html`
		<mo-button-group type='text' direction=${direction}>
			<mo-button>Text</mo-button>
			<mo-button>Text</mo-button>
		</mo-button-group>
		<mo-button-group type='outlined' direction=${direction}>
			<mo-button>Outlined</mo-button>
			<mo-button>Outlined</mo-button>
		</mo-button-group>
		<mo-button-group type='tonal' direction=${direction}>
			<mo-button>Tonal</mo-button>
			<mo-button>Tonal</mo-button>
		</mo-button-group>
		<mo-button-group type='filled' direction=${direction}>
			<mo-button>Filled</mo-button>
			<mo-button>Filled</mo-button>
		</mo-button-group>
	`,
}

/** `direction` lays the buttons out in a row or a column, and the reversed ones flip their order. */
export const Directions: Story = {
	render: ({ type }) => html`
		<mo-button-group type=${type} direction='horizontal'>
			<mo-button>One</mo-button>
			<mo-button>Two</mo-button>
			<mo-button>Three</mo-button>
		</mo-button-group>
		<mo-button-group type=${type} direction='horizontal-reversed'>
			<mo-button>One</mo-button>
			<mo-button>Two</mo-button>
			<mo-button>Three</mo-button>
		</mo-button-group>
		<mo-button-group type=${type} direction='vertical'>
			<mo-button>One</mo-button>
			<mo-button>Two</mo-button>
			<mo-button>Three</mo-button>
		</mo-button-group>
		<mo-button-group type=${type} direction='vertical-reversed'>
			<mo-button>One</mo-button>
			<mo-button>Two</mo-button>
			<mo-button>Three</mo-button>
		</mo-button-group>
	`,
}

/** Any subclass of `mo-button` joins the group, such as a `mo-loading-button` waiting on its click handler. */
export const ButtonSubclasses: Story = {
	render: ({ type, direction }) => html`
		<mo-button-group type=${type} direction=${direction}>
			<mo-button>Discard</mo-button>
			<mo-loading-button @click=${() => new Promise(resolve => setTimeout(resolve, 1000))}>Save</mo-loading-button>
			<mo-button>Save as</mo-button>
		</mo-button-group>
	`,
}

/** The outer corners and the separator between buttons are custom properties. */
export const CustomProperties: Story = {
	render: ({ direction }) => html`
		<mo-button-group type='outlined' direction=${direction} style='--mo-button-group-border-radius: 100px'>
			<mo-button>Day</mo-button>
			<mo-button>Week</mo-button>
			<mo-button>Month</mo-button>
		</mo-button-group>
		<mo-button-group type='filled' direction=${direction} style='--mo-button-group-border-radius: 100px; --mo-button-group-separator-color: var(--mo-color-on-accent)'>
			<mo-button>Day</mo-button>
			<mo-button>Week</mo-button>
			<mo-button>Month</mo-button>
		</mo-button-group>
	`,
}
