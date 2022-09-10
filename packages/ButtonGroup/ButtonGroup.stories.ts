import { story, meta } from '../../.storybook/story.js'
import { html, style } from '@a11d/lit'
import p from './package.json'
import './index.js'

export default meta({
	title: 'Core/Button/ButtonGroup',
	component: 'mo-button-group',
	args: {
		type: 'outlined',
		direction: 'horizontal',
	},
	argTypes: {
		type: { control: 'select', options: ['normal', 'outlined', 'raised', 'unelevated'] },
		direction: { control: 'select', options: ['horizontal', 'vertical', 'horizontal-reversed', 'vertical-reversed'] },
	},
	parameters: {
		docs: {
			description: {
				component: p.description,
			},
		}
	}
})

export const ButtonGroup = story({
	render: ({ type, direction }) => html`
		<mo-button-group type=${type} direction=${direction}>
			<mo-button>B</mo-button>
			<mo-button>I</mo-button>
			<mo-button>U</mo-button>
		</mo-button-group>
	`
})

export const WithCustomBorderRadius = story({
	render: ({ type, direction }) => html`
		<mo-button-group type=${type} direction=${direction} ${style({ '--mo-button-group-border-radius': '100px' })}>
			<mo-button>B</mo-button>
			<mo-button>I</mo-button>
			<mo-button>U</mo-button>
		</mo-button-group>
	`
})

export const WithSubclassComposition = story({
	render: ({ type, direction }) => html`
		<mo-button-group type=${type} direction=${direction}>
			<mo-button>mo-button</mo-button>
			<mo-loading-button @click=${() => new Promise(resolve => setTimeout(resolve, 1000))}>mo-loading-button</mo-loading-button>
			<mo-button>mo-button</mo-button>
		</mo-button-group>
	`
})