import type { Meta, StoryObj } from '@storybook/web-components-vite'
import { html } from '@a11d/lit'
import './index.js'

type Args = {
	readonly columns: string
	readonly rows: string
	readonly gap: string
}

export default {
	title: 'Layout / Grid',
	component: 'mo-grid',
	args: {
		columns: '3* *',
		rows: '60px * 50px',
		gap: '10px',
	},
	decorators: [story => html`
		<style>
			mo-grid > div { display: flex; align-items: center; justify-content: center; min-height: 48px; border-radius: 4px; color: black; font-size: x-large; }
			mo-grid > div:nth-of-type(4n + 1) { background: #F7CAC9; }
			mo-grid > div:nth-of-type(4n + 2) { background: #7FCDCD; }
			mo-grid > div:nth-of-type(4n + 3) { background: #92A8D1; }
			mo-grid > div:nth-of-type(4n + 4) { background: #F3E0BE; }
		</style>
		${story()}
	`],
} satisfies Meta<Args>

type Story = StoryObj<Args>

export const Default: Story = {
	render: ({ columns, rows, gap }) => html`
		<mo-grid columns=${columns} rows=${rows} gap=${gap} style='height: 400px'>
			<div style='grid-column: 1 / -1'>Header</div>
			<div>Main</div>
			<div>Sidebar</div>
			<div style='grid-column: 1 / -1'>Footer</div>
		</mo-grid>
	`,
}

/** In `columns` and `rows`, `*` stands for `1fr` and `2*` for `2fr`. */
export const AsteriskSyntax: Story = {
	render: ({ gap }) => html`
		<mo-grid columns='200px * 2*' gap=${gap}>
			<div>200px</div>
			<div>*</div>
			<div>2*</div>
		</mo-grid>
	`,
}

/** `repeat(auto-fit, minmax(150px, 1fr))` fits in as many columns as there is room for - resize the window to watch them reflow. */
export const Responsive: Story = {
	render: ({ gap }) => html`
		<mo-grid columns='repeat(auto-fit, minmax(150px, 1fr))' gap=${gap}>
			${Array.from({ length: 20 }, (_, index) => html`<div style='height: 100px'>Card ${index + 1}</div>`)}
		</mo-grid>
	`,
}

/** `rowGap` and `columnGap` set the two gaps apart, where `gap` sets both. */
export const Gaps: Story = {
	render: () => html`
		<mo-grid columns='* * *' rowGap='32px' columnGap='8px'>
			${Array.from({ length: 6 }, (_, index) => html`<div>${index + 1}</div>`)}
		</mo-grid>
	`,
}

/** `autoFlow='column'` fills one column after the other, and `autoColumns` sizes the columns it adds. */
export const AutoFlow: Story = {
	render: ({ gap }) => html`
		<mo-grid rows='repeat(3, 60px)' autoFlow='column' autoColumns='120px' gap=${gap}>
			${Array.from({ length: 8 }, (_, index) => html`<div>${index + 1}</div>`)}
		</mo-grid>
	`,
}