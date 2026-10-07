import type { Meta, StoryObj } from '@storybook/web-components-vite'
import { html } from '@a11d/lit'
import type { FlexDirection } from './Flex.js'
import './index.js'

type Args = {
	readonly direction: FlexDirection
	readonly gap: string
	readonly justifyContent: string
	readonly alignItems: string
}

export default {
	title: 'Layout / Flex',
	component: 'mo-flex',
	args: {
		direction: 'horizontal',
		gap: '10px',
		justifyContent: 'normal',
		alignItems: 'stretch',
	},
	argTypes: {
		direction: { control: 'select', options: ['horizontal', 'vertical', 'horizontal-reversed', 'vertical-reversed'] },
		justifyContent: { control: 'select', options: ['normal', 'start', 'center', 'end', 'space-between', 'space-around', 'space-evenly', 'stretch'] },
		alignItems: { control: 'select', options: ['normal', 'stretch', 'start', 'center', 'end', 'baseline'] },
	},
	decorators: [story => html`
		<style>
			mo-flex > div { display: flex; align-items: center; justify-content: center; min-width: 48px; min-height: 48px; border-radius: 4px; color: black; font-size: x-large; }
			mo-flex > div:nth-of-type(4n + 1) { background: #F7CAC9; }
			mo-flex > div:nth-of-type(4n + 2) { background: #7FCDCD; }
			mo-flex > div:nth-of-type(4n + 3) { background: #92A8D1; }
			mo-flex > div:nth-of-type(4n + 4) { background: #F3E0BE; }
		</style>
		${story()}
	`],
} satisfies Meta<Args>

type Story = StoryObj<Args>

export const Default: Story = {
	render: ({ direction, gap, justifyContent, alignItems }) => html`
		<mo-flex direction=${direction} gap=${gap} justifyContent=${justifyContent} alignItems=${alignItems} style='height: 300px'>
			<div>1</div>
			<div>2</div>
			<div>3</div>
			<div>4</div>
		</mo-flex>
	`,
}

/** `flex` on an item shares out the free space: `2` takes twice what `1` takes, while `auto` and `100px` keep their size. */
export const Sizing: Story = {
	render: ({ direction, gap }) => html`
		<mo-flex direction=${direction} gap=${gap} style='height: 300px'>
			<div style='flex-basis: 100px'>100px</div>
			<div style='flex: 2'>2</div>
			<div>auto</div>
			<div style='flex: 1'>1</div>
		</mo-flex>
	`,
}

/** The four directions, in order: `horizontal`, `horizontal-reversed`, `vertical`, which is the default, and `vertical-reversed`. */
export const Directions: Story = {
	decorators: [story => html`<div style='display: grid; grid-template-columns: repeat(auto-fit, minmax(180px, 1fr)); gap: 32px'>${story()}</div>`],
	render: () => html`
		<mo-flex direction='horizontal' gap='8px'>
			<div>1</div>
			<div>2</div>
			<div>3</div>
		</mo-flex>
		<mo-flex direction='horizontal-reversed' gap='8px'>
			<div>1</div>
			<div>2</div>
			<div>3</div>
		</mo-flex>
		<mo-flex direction='vertical' gap='8px'>
			<div>1</div>
			<div>2</div>
			<div>3</div>
		</mo-flex>
		<mo-flex direction='vertical-reversed' gap='8px'>
			<div>1</div>
			<div>2</div>
			<div>3</div>
		</mo-flex>
	`,
}

/** `wrap='wrap'` continues items that do not fit on a new line, and `alignContent` places the lines. */
export const Wrap: Story = {
	render: () => html`
		<mo-flex direction='horizontal' wrap='wrap' gap='10px' alignContent='start' style='height: 300px'>
			${Array.from({ length: 16 }, (_, index) => html`<div style='width: 120px'>${index + 1}</div>`)}
		</mo-flex>
	`,
}

/** `justifyContent` and `alignItems` place the items, here a heading and its actions at the two ends of a row. */
export const Alignment: Story = {
	render: () => html`
		<mo-flex direction='horizontal' justifyContent='space-between' alignItems='center' gap='8px'>
			<mo-heading typography='heading4'>Invoices</mo-heading>
			<mo-flex direction='horizontal' gap='8px'>
				<mo-button startIcon='download'>Export</mo-button>
				<mo-button type='filled' startIcon='add'>Create</mo-button>
			</mo-flex>
		</mo-flex>
	`,
}
