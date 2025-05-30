import type { Meta, StoryObj } from '@storybook/web-components'
import { html, style } from '@a11d/lit'
import p from './package.json'
import '.'

const itemsOptions = [
	'normal', 'stretch',
	'center', 'start', 'end', 'flex-start', 'flex-end',
	'baseline', 'first baseline', 'last baseline', 'safe center', 'unsafe center',
]

const contentsOptions = [
	'center', 'start', 'end', 'flex-start', 'flex-end', 'left', 'right', 'normal',
	'space-between', 'space-around', 'space-evenly', 'stretch',
	'safe center', 'unsafe center',
]

export default {
	title: 'Layout & Containment / Flex',
	component: 'mo-flex',
	args: {
		direction: 'vertical',
		wrap: 'wrap',
		gap: '10px',
		justifyItems: 'start',
		justifyContent: 'space-between',
		alignItems: 'stretch',
		alignContent: 'stretch',
	},
	argTypes: {
		direction: {
			description: 'Direction of the flex box, which is tunneled to `flex-direction` CSS property.',
			control: 'select',
			options: ['horizontal', 'vertical', 'horizontal-reversed', 'vertical-reversed']
		},
		wrap: {
			description: 'Tunnels `flex-wrap` CSS property which indicates whether flex items are forced onto one line or can wrap onto multiple lines.',
			control: 'select',
			options: ['nowrap', 'wrap', 'wrap-reverse']
		},
		gap: {
			description: 'Tunnels `gap` CSS property which defines the gap between flex items.',
		},
		justifyItems: {
			description: 'Tunnels `justify-items` CSS property',
			control: 'select',
			options: itemsOptions,
		},
		justifyContent: {
			description: 'Tunnels `justifyContent` CSS property',
			control: 'select',
			options: contentsOptions,
		},
		alignItems: {
			description: 'Tunnels `alignItems` CSS property',
			control: 'select',
			options: itemsOptions,
		},
		alignContent: {
			description: 'Tunnels `alignContent` CSS property',
			control: 'select',
			options: contentsOptions,
		},
	},
	package: p,
	decorators: [
		story => html`
			${story()}

			<!-- Styles only for better visualization -->
			<style>
				html, body, #root, #root-inner { height: 100%; }
				#flex { min-height: 300px; }
				#flex div { color: black; font-size: xx-large; display: flex; align-items: center; justify-content: center; }
				#flex div:nth-of-type(4n + 1) { background: #F7CAC9; }
				#flex div:nth-of-type(4n + 2) { background: #7FCDCD; }
				#flex div:nth-of-type(4n + 3) { background: #92A8D1; }
				#flex div:nth-of-type(4n + 4) { background: #F3E0BE; }
			</style>
		`
	]
} as Meta

export const Flex: StoryObj = {
	render: ({ direction, wrap, gap, justifyItems, justifyContent, alignItems, alignContent }) => {
		const orientationX = direction === 'horizontal' || direction === 'horizontal-reversed'
		return html`
			<mo-flex id='flex' direction=${direction} wrap=${wrap} gap=${gap} justifyItems=${justifyItems} justifyContent=${justifyContent} alignItems=${alignItems} alignContent=${alignContent}>
				<div ${style({ [orientationX ? 'width' : 'height']: '100px' })}>100px</div>
				<div ${style({ flex: '2' })}>2*</div>
				<div>auto</div>
				<div ${style({ flex: '1' })}>*</div>
			</mo-flex>
		`
	}
}