import type { Meta, StoryObj } from '@storybook/web-components-vite'
import { html } from '@a11d/lit'
import '@3mo/collapsible-card'
import './index.js'

type Args = {
	readonly direction: 'horizontal' | 'horizontal-reversed' | 'vertical' | 'vertical-reversed'
}

export default {
	title: 'Layout / Splitter',
	component: 'mo-splitter',
	args: {
		direction: 'horizontal',
	},
	argTypes: {
		direction: { control: 'select', options: ['horizontal', 'horizontal-reversed', 'vertical', 'vertical-reversed'] },
	},
	decorators: [story => html`
		<style>
			mo-splitter-item > div { display: flex; justify-content: center; align-items: center; }
		</style>
		${story()}
	`],
} satisfies Meta<Args>

type Story = StoryObj<Args>

export const Default: Story = {
	render: ({ direction }) => html`
		<mo-splitter direction=${direction} style='height: 500px'>
			<mo-splitter-item size='60%'>
				<div style='background: rgba(0, 128, 128, 0.3)'>Item 1</div>
			</mo-splitter-item>
			<mo-splitter-item>
				<div style='background: rgba(255, 192, 203, 0.3)'>Item 2</div>
			</mo-splitter-item>
		</mo-splitter>
	`,
}

/** The four directions, in order: `horizontal`, `horizontal-reversed`, `vertical`, which is the default, and `vertical-reversed`. */
export const Directions: Story = {
	decorators: [story => html`<div style='display: grid; grid-template-columns: repeat(auto-fit, minmax(240px, 1fr)); gap: 16px'>${story()}</div>`],
	render: () => html`
		${['horizontal', 'horizontal-reversed', 'vertical', 'vertical-reversed'].map(direction => html`
			<mo-splitter direction=${direction} style='height: 240px'>
				<mo-splitter-item size='60%'>
					<div style='background: rgba(0, 128, 128, 0.3)'>1</div>
				</mo-splitter-item>
				<mo-splitter-item>
					<div style='background: rgba(255, 192, 203, 0.3)'>2</div>
				</mo-splitter-item>
			</mo-splitter>
		`)}
	`,
}

/** `size` sets where an item starts and `min` how far it can shrink - drag either resizer toward the narrow items to feel them stop. */
export const Sizes: Story = {
	render: () => html`
		<mo-splitter direction='horizontal' style='height: 300px'>
			<mo-splitter-item size='25%' min='150px'>
				<div style='background: rgba(0, 128, 128, 0.3)'>25%, at least 150px</div>
			</mo-splitter-item>
			<mo-splitter-item size='50%'>
				<div style='background: rgba(255, 192, 203, 0.3)'>50%</div>
			</mo-splitter-item>
			<mo-splitter-item min='100px'>
				<div style='background: rgba(139, 133, 237, 0.3)'>The rest, at least 100px</div>
			</mo-splitter-item>
		</mo-splitter>
	`,
}

/** A splitter inside an item splits it again, along the other direction or the same one. */
export const Nested: Story = {
	render: () => html`
		<mo-splitter direction='horizontal' style='height: 500px'>
			<mo-splitter-item>
				<div style='background: rgba(0, 128, 128, 0.3)'>Item 1</div>
			</mo-splitter-item>
			<mo-splitter-item min='50%'>
				<mo-splitter direction='vertical' style='height: 100%'>
					<mo-splitter-item>
						<div style='background: rgba(255, 192, 203, 0.3)'>Item 2</div>
					</mo-splitter-item>
					<mo-splitter-item min='50%'>
						<mo-splitter direction='horizontal' style='height: 100%'>
							<mo-splitter-item>
								<div style='background: rgba(139, 133, 237, 0.3)'>Item 3</div>
							</mo-splitter-item>
							<mo-splitter-item>
								<div style='background: rgba(211, 237, 133, 0.3)'>Item 4</div>
							</mo-splitter-item>
						</mo-splitter>
					</mo-splitter-item>
				</mo-splitter>
			</mo-splitter-item>
			<mo-splitter-item>
				<div style='background: rgba(0, 128, 128, 0.3)'>Item 5</div>
			</mo-splitter-item>
		</mo-splitter>
	`,
}

/** A `collapsed` item shrinks to its content and gives its space to the others; here each card collapses the item it sits in. */
export const CollapsibleItems: Story = {
	render: () => html`
		<mo-splitter style='height: 600px'>
			<mo-splitter-item>
				<mo-collapsible-card heading='Card 1' @collapse=${(e: CustomEvent<boolean>) => (e.target as HTMLElement).closest('mo-splitter-item')!.collapsed = e.detail}></mo-collapsible-card>
			</mo-splitter-item>
			<mo-splitter-item>
				<mo-collapsible-card heading='Card 2' @collapse=${(e: CustomEvent<boolean>) => (e.target as HTMLElement).closest('mo-splitter-item')!.collapsed = e.detail}></mo-collapsible-card>
			</mo-splitter-item>
			<mo-splitter-item>
				<mo-collapsible-card heading='Card 3' @collapse=${(e: CustomEvent<boolean>) => (e.target as HTMLElement).closest('mo-splitter-item')!.collapsed = e.detail}></mo-collapsible-card>
			</mo-splitter-item>
		</mo-splitter>
	`,
}

/** `resizerTemplate` replaces the knob between the items, here with `mo-splitter-resizer-line`. */
export const CustomResizer: Story = {
	render: () => html`
		<mo-splitter direction='horizontal' style='height: 500px' .resizerTemplate=${html`<mo-splitter-resizer-line></mo-splitter-resizer-line>`}>
			<mo-splitter-item>
				<div style='background: rgba(0, 128, 128, 0.3)'>Item 1</div>
			</mo-splitter-item>
			<mo-splitter-item>
				<div style='background: rgba(255, 192, 203, 0.3)'>Item 2</div>
			</mo-splitter-item>
		</mo-splitter>
	`,
}

/** The knob and the line take their colors from custom properties, and the line also its thickness. */
export const CustomProperties: Story = {
	decorators: [story => html`<div style='display: grid; grid-template-columns: 1fr 1fr; gap: 16px'>${story()}</div>`],
	render: () => html`
		<mo-splitter direction='horizontal' style='height: 300px; --mo-splitter-resizer-knob-background: var(--mo-color-accent); --mo-splitter-resizer-knob-active-background: var(--mo-color-red)'>
			<mo-splitter-item>
				<div style='background: rgba(0, 128, 128, 0.3)'>Knob</div>
			</mo-splitter-item>
			<mo-splitter-item>
				<div style='background: rgba(255, 192, 203, 0.3)'>Item 2</div>
			</mo-splitter-item>
		</mo-splitter>
		<mo-splitter direction='horizontal' style='height: 300px; --mo-splitter-resizer-line-thickness: 4px; --mo-splitter-resizer-line-idle-background: var(--mo-color-accent); --mo-splitter-resizer-line-accent-color: var(--mo-color-red)' .resizerTemplate=${html`<mo-splitter-resizer-line></mo-splitter-resizer-line>`}>
			<mo-splitter-item>
				<div style='background: rgba(0, 128, 128, 0.3)'>Line</div>
			</mo-splitter-item>
			<mo-splitter-item>
				<div style='background: rgba(255, 192, 203, 0.3)'>Item 2</div>
			</mo-splitter-item>
		</mo-splitter>
	`,
}
