import type { Meta, StoryObj } from '@storybook/web-components-vite'
import { html } from '@a11d/lit'
import { sourceOf } from '../../.storybook/source.js'
import invoiceMasterDetailSource from './stories/InvoiceMasterDetail.ts?raw'
import editorAndOutputSource from './stories/EditorAndOutput.ts?raw'
import './stories/InvoiceMasterDetail.js'
import './stories/EditorAndOutput.js'
import './index.js'

type Args = {
	readonly direction: 'vertical' | 'vertical-reversed' | 'horizontal' | 'horizontal-reversed'
	readonly masterSize: string
	readonly minSize: string
}

export default {
	title: 'Layout / Master Detail',
	component: 'mo-master-detail',
	args: {
		direction: 'vertical',
		masterSize: '50%',
		minSize: '100px',
	},
	argTypes: {
		direction: { control: 'select', options: ['vertical', 'vertical-reversed', 'horizontal', 'horizontal-reversed'] },
	},
} satisfies Meta<Args>

type Story = StoryObj<Args>

export const Default: Story = {
	render: ({ direction, masterSize, minSize }) => html`
		<mo-master-detail direction=${direction} masterSize=${masterSize} minSize=${minSize} style='height: 600px'>
			<mo-card slot='master' heading='Invoices'>#24001 Blake Logistics</mo-card>
			<mo-card slot='detail' heading='Positions of #24001'>2 × Cable drum, 1 × Junction box</mo-card>
		</mo-master-detail>
	`,
}

/** Select a row and the detail pane takes its share of the space; deselect it and the master pane gets all of it back. */
export const Selection: Story = {
	parameters: sourceOf(invoiceMasterDetailSource),
	render: () => html`<story-invoice-master-detail></story-invoice-master-detail>`,
}

/** `direction='horizontal'` lays the panes out side by side; `masterSize` and `minSize` follow the axis. */
export const SideBySide: Story = {
	render: () => html`<story-invoice-master-detail direction='horizontal'></story-invoice-master-detail>`,
}

/** `collapsed` shrinks the detail pane to its own content, here a collapsed card, and gives the rest and the resizer to the master pane. */
export const CollapsibleDetail: Story = {
	render: () => html`<story-invoice-master-detail collapsible></story-invoice-master-detail>`,
}

/** The detail pane can follow an action instead of a selection: Run opens it, Collapse leaves only its header and Close empties it. */
export const EditorAndOutput: Story = {
	parameters: sourceOf(editorAndOutputSource),
	render: () => html`<story-editor-and-output></story-editor-and-output>`,
}