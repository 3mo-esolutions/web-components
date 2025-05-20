import type { Meta, StoryObj } from '@storybook/web-components'
import { html } from '@a11d/lit'
import '@3mo/collapsible-card'
import p from './package.json'
import './index.js'

export default {
	title: 'Layout & Containment / Splitter',
	component: 'mo-splitter',
	args: {
		gap: '0px',
	},
	argTypes: {
		gap: { control: 'text' },
	},
	package: p,
	decorators: [story => html`
		<style>
			mo-splitter-item {
				div {
					display: flex;
					justify-content: center;
					align-items: center;
				}
			}
		</style>
		${story()}
	`]
} as Meta

export const Splitter: StoryObj = {
	render: ({ gap }) => html`
		<mo-splitter direction='horizontal' gap=${gap} style='height:500px'>
			<mo-splitter-item size='60%'>
				<div style='background:rgba(0, 128, 128, 0.3)'>Item 1</div>
			</mo-splitter-item>

			<mo-splitter-item>
				<div style='background:rgba(255, 192, 203, 0.3)'>Item 2</div>
			</mo-splitter-item>
		</mo-splitter>
	`
}

export const Nested: StoryObj = {
	render: ({ gap }) => html`
		<mo-splitter direction='horizontal' gap=${gap} style='height:500px'>
			<mo-splitter-item>
				<div style='background:rgba(0, 128, 128, 0.3)'>Item 1</div>
			</mo-splitter-item>

			<mo-splitter-item min='50%'>
				<mo-splitter direction='vertical' gap=${gap} style='height:100%'>
					<mo-splitter-item>
						<div style='background:rgba(255, 192, 203, 0.3)'>Item 2</div>
					</mo-splitter-item>

					<mo-splitter-item min='50%'>
						<mo-splitter direction='horizontal' gap=${gap} style='height:100%'>
							<mo-splitter-item>
								<div style='background:rgba(139, 133, 237, 0.3)'>Item 3</div>
							</mo-splitter-item>

							<mo-splitter-item>
								<div style='background:rgb(211, 237, 133, 0.3)'>Item 4</div>
							</mo-splitter-item>
						</mo-splitter>
					</mo-splitter-item>
				</mo-splitter>
			</mo-splitter-item>
			<mo-splitter-item>
				<div style='background:rgba(0, 128, 128, 0.3)'>Item 5</div>
			</mo-splitter-item>
		</mo-splitter>
	`
}

export const CollapsableItems: StoryObj = {
	render: ({ gap }) => html`
		<mo-splitter gap=${gap} style='height:600px; padding: 3px; border: 3px dashed rgba(255, 192, 203, 0.3)'>
			<mo-splitter-item>
				<mo-collapsible-card heading='Card 1'
					@collapse=${(e: CustomEvent<boolean>) => (e.target as HTMLElement).closest('mo-splitter-item')!.collapsed = e.detail}
				></mo-collapsible-card>
			</mo-splitter-item>
			<mo-splitter-item>
				<mo-collapsible-card heading='Card 2'
					@collapse=${(e: CustomEvent<boolean>) => (e.target as HTMLElement).closest('mo-splitter-item')!.collapsed = e.detail}
				></mo-collapsible-card>
			</mo-splitter-item>
			<mo-splitter-item>
				<mo-collapsible-card heading='Card 3'
					@collapse=${(e: CustomEvent<boolean>) => (e.target as HTMLElement).closest('mo-splitter-item')!.collapsed = e.detail}
				></mo-collapsible-card>
			</mo-splitter-item>
		</mo-splitter>
	`
}

export const WithCustomResizer: StoryObj = {
	render: ({ gap }) => html`
		<mo-splitter direction='horizontal' gap=${gap} style='height:500px'
			.resizerTemplate=${html`<mo-splitter-resizer-line></mo-splitter-resizer-line>`}
		>
			<mo-splitter-item>
				<div style='background:rgba(0, 128, 128, 0.3)'>Item 1</div>
			</mo-splitter-item>

			<mo-splitter-item>
				<div style='background:rgba(255, 192, 203, 0.3)'>Item 2</div>
			</mo-splitter-item>
		</mo-splitter>
	`
}