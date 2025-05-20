import type { Meta, StoryObj } from '@storybook/web-components-vite'
import { html, style } from '@a11d/lit'
import { ButtonType } from '@3mo/button'
import p from './package.json'
import './index.js'

export default {
	title: 'Buttons & Actions / Button Group',
	component: 'mo-button-group',
	args: {
		type: ButtonType.Outlined,
		direction: 'horizontal',
	},
	argTypes: {
		type: { control: 'select', options: [ButtonType.Text, ButtonType.Outlined, ButtonType.Filled] },
		direction: { control: 'select', options: ['horizontal', 'vertical', 'horizontal-reversed', 'vertical-reversed'] },
	},
	package: p,
} as Meta

export const ButtonGroup: StoryObj = {
	render: ({ type, direction }) => html`
		<mo-button-group type=${type} direction=${direction}>
			<mo-button>B</mo-button>
			<mo-button>I</mo-button>
			<mo-button>U</mo-button>
		</mo-button-group>
	`
}

export const WithCustomBorderRadius: StoryObj = {
	render: ({ type, direction }) => html`
		<mo-button-group type=${type} direction=${direction} ${style({ '--mo-button-group-border-radius': '100px' })}>
			<mo-button>B</mo-button>
			<mo-button>I</mo-button>
			<mo-button>U</mo-button>
		</mo-button-group>
	`
}

export const WithSubclassComposition: StoryObj = {
	render: ({ type, direction }) => html`
		<mo-button-group type=${type} direction=${direction}>
			<mo-button>mo-button</mo-button>
			<mo-loading-button @click=${() => new Promise(resolve => setTimeout(resolve, 1000))}>mo-loading-button</mo-loading-button>
			<mo-button>mo-button</mo-button>
		</mo-button-group>
	`
}