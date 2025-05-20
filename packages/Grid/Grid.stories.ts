import type { Meta, StoryObj } from '@storybook/web-components'
import { html, style } from '@a11d/lit'
import p from './package.json'
import '.'

export default {
	title: 'Layout & Containment / Grid',
	component: 'mo-grid',
	argTypes: {
		columns: { description: 'Tunnels `grid-template-columns` CSS property which defines the layout of columns. Additionally it supports Asterix syntax for grid fraction (e.g. `2*` equals to `2fr`)' },
		rows: { description: 'Tunnels `grid-template-rows` CSS property which defines the layout of rows. Additionally it supports Asterix syntax for grid fraction (e.g. `2*` equals to `2fr`)' },
		gap: { description: 'Tunnels `gap` CSS property which defines the gap between grid items.' },
	},
	package: p,
	decorators: [
		story => html`
			${story()}

			<!-- Styles only for better visualization -->
			<style>
				html, body, #root, #root-inner { height: 100%; }
				.grid { min-height: 250px; }
				.grid div { color: black; font-size: xx-large; display: flex; align-items: center; justify-content: center; }
				.grid div.card { height: 100px; }
				.grid div:nth-of-type(4n + 1) { background: #F7CAC9; }
				.grid div:nth-of-type(4n + 2) { background: #7FCDCD; }
				.grid div:nth-of-type(4n + 3) { background: #92A8D1; }
				.grid div:nth-of-type(4n + 4) { background: #F3E0BE; }
			</style>
		`
	]
} as Meta

export const Application: StoryObj = {
	args: {
		gap: '10px',
		columns: '3* *',
		rows: '60px * 50px',
	},
	render: ({ gap, columns, rows }) => html`
		<mo-grid class='grid' columns=${columns} rows=${rows} gap=${gap} ${style({ height: '100%' })}>
			<div ${style({ gridColumn: '1 / -1' })}>Header</div>
			<div ${style({ gridColumn: '1 / 2' })}>Main</div>
			<div ${style({ gridColumn: '2' })}>Sidebar</div>
			<div ${style({ gridColumn: '1 / -1' })}>Footer</div>
		</mo-grid>
	`
}

export const Responsive: StoryObj = {
	args: {
		gap: '10px',
		columns: 'repeat(auto-fit, minmax(150px, 1fr))',
	},
	render: ({ gap, columns }) => html`
		<mo-grid class='grid' columns=${columns} gap=${gap}>
			${new Array(50).fill(undefined).map((_, i) => html`
				<div class='card'>Card ${i + 1}</div>
			`)}
		</mo-grid>
	`
}