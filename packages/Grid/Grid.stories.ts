import { story, meta } from '../../.storybook/story'
import { html, style } from '@a11d/lit'
import p from './package.json'
import '.'

export default meta({
	title: 'Grid',
	component: 'mo-grid',
	argTypes: {
		columns: { description: 'Tunnels the value to the native "grid-template-columns" css property which defines the layout of columns. Additionally it supports Asterix syntax for grid fraction (e.g. "2*" equals to "2fr")' },
		rows: { description: 'Tunnels the value to the native "grid-template-rows" css property which defines the layout of rows. Additionally it supports Asterix syntax for grid fraction (e.g. "2*" equals to "2fr")' },
		gap: { description: 'Tunnels the value to the native "gap" css property which defines the gap between grid items.' },
	},
	parameters: {
		docs: {
			description: {
				component: p.description,
			},
		}
	},
	decorators: [
		story => html`
			${story()}

			<!-- Styles only for better visualization -->
			<style>
				html, body, #root, #root-inner { height: 100%; }
				mo-grid { min-height: 250px; }
				mo-grid div { color: black; font-size: xx-large; display: flex; align-items: center; justify-content: center; }
				mo-grid div.card { height: 100px; }
				mo-grid div:nth-of-type(4n + 1) { background: #F7CAC9; }
				mo-grid div:nth-of-type(4n + 2) { background: #7FCDCD; }
				mo-grid div:nth-of-type(4n + 3) { background: #92A8D1; }
				mo-grid div:nth-of-type(4n + 4) { background: #F3E0BE; }
			</style>
		`
	]
})

export const Application = story({
	args: {
		gap: '10px',
		columns: '3* *',
		rows: '60px * 50px',
	},
	render: ({ gap, columns, rows }) => html`
		<mo-grid columns=${columns} rows=${rows} gap=${gap} ${style({ height: '100%' })}>
			<div ${style({ gridColumn: '1 / -1' })}>Header</div>
			<div ${style({ gridColumn: '1 / 2' })}>Main</div>
			<div ${style({ gridColumn: '2' })}>Sidebar</div>
			<div ${style({ gridColumn: '1 / -1' })}>Footer</div>
		</mo-grid>
	`
})

export const Responsive = story({
	args: {
		gap: '10px',
		columns: 'repeat(auto-fit, minmax(150px, 1fr))',
	},
	render: ({ gap, columns }) => html`
		<mo-grid columns=${columns} gap=${gap}>
			${new Array(50).fill(undefined).map((_, i) => html`
				<div class='card'>Card ${i + 1}</div>
			`)}
		</mo-grid>
	`
})