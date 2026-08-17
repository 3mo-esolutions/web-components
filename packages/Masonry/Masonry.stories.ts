import type { Meta, StoryObj } from '@storybook/web-components-vite'
import { html, style } from '@a11d/lit'
import p from './package.json'
import '.'

const supported = CSS.supports('display', 'grid-lanes')
	|| CSS.supports('display', 'masonry')
	|| CSS.supports('grid-template-rows', 'masonry')

export default {
	title: 'Layout & Containment / Masonry',
	component: 'mo-masonry',
	args: {
		columns: '4',
		gap: '10px',
		tolerance: '1em',
	},
	argTypes: {
		columns: { description: 'Tunnels `grid-template-columns` CSS property which defines the lanes of a vertical »waterfall« masonry. Additionally it supports a bare lane count (e.g. `4` equals `repeat(4, 1fr)`).' },
		rows: { description: 'Tunnels `grid-template-rows` CSS property which defines the lanes of a horizontal »brick« masonry. Defining these instead of `columns` is all it takes to flip the masonry sideways.' },
		gap: { description: 'Tunnels `gap` CSS property which defines the gap between masonry items.' },
		tolerance: { description: 'Tunnels the masonry placement tolerance (`flow-tolerance` CSS property). Items normally flow into the shortest lane; lanes within this threshold of each other count as ties which are resolved in favor of the natural item order. `0` packs the tightest, larger values (e.g. `100px` or even `infinity`) preserve more of the order. Defaults to `1em`.' },
	},
	package: p,
	decorators: [
		story => html`
			${supported ? '' : html`
				<mo-alert type='warning'>
					This browser does not lay out native CSS masonry yet, so items fall back to a regular grid with aligned rows.
					Try Safari 26.4+, or enable the »CSS Masonry Layout« flag in Chromium or »layout.css.grid-template-masonry-value.enabled« in Firefox.
				</mo-alert>
			`}
			${story()}

			<!-- Styles only for better visualization -->
			<style>
				mo-masonry {
					div {
						color: black;
						font-size: x-large;
						display: flex;
						align-items: center;
						justify-content: center;
						border-radius: 4px;
						&:nth-of-type(4n + 1) { background: #F7CAC9; }
						&:nth-of-type(4n + 2) { background: #7FCDCD; }
						&:nth-of-type(4n + 3) { background: #92A8D1; }
						&:nth-of-type(4n + 4) { background: #F3E0BE; }
					}

					img {
						display: block;
						width: 100%;
						height: auto;
						border-radius: 4px;
					}
				}
			</style>
		`
	]
} as Meta

const heights = [90, 190, 120, 60, 220, 140, 80, 170, 110, 200, 70, 150, 100, 180, 130, 120]

export const Masonry: StoryObj = {
	render: ({ columns, gap, tolerance }) => html`
		<mo-masonry columns=${columns} gap=${gap} tolerance=${tolerance}>
			${heights.map((height, index) => html`
				<div ${style({ height: `${height}px` })}>${index + 1}</div>
			`)}
		</mo-masonry>
	`
}

export const Brick: StoryObj = {
	args: {
		columns: undefined,
		rows: '3',
		gap: '10px',
	},
	render: ({ rows, gap, tolerance }) => html`
		<mo-masonry rows=${rows} gap=${gap} tolerance=${tolerance} ${style({ height: '400px' })}>
			${[220, 90, 140, 300, 110, 180, 80, 250, 130, 200, 100, 160, 240, 120, 190, 140].map((width, index) => html`
				<div ${style({ width: `${width}px` })}>${index + 1}</div>
			`)}
		</mo-masonry>
	`
}

const photos = [
	['mountain-dawn', 400, 600], ['harbour', 400, 300], ['pine-forest', 400, 500],
	['tram', 400, 260], ['dunes', 400, 550], ['rooftops', 400, 400],
	['glacier', 400, 620], ['market', 400, 300], ['lighthouse', 400, 480],
	['vineyard', 400, 340], ['fjord', 400, 560], ['old-town', 400, 420],
	['desert-road', 400, 280], ['waterfall', 400, 600], ['bridge', 400, 360],
	['orchard', 400, 460], ['countryside', 400, 500], ['beach', 400, 300],
	['forest', 400, 500], ['ocean', 400, 600], ['mountain-sunset', 400, 500],
] as const

export const Gallery: StoryObj = {
	args: {
		columns: 'repeat(auto-fill, minmax(200px, 1fr))',
		gap: '8px',
	},
	render: ({ columns, gap, tolerance }) => html`
		<mo-masonry columns=${columns} gap=${gap} tolerance=${tolerance}>
			${photos.map(([seed, width, height]) => html`
				<img src=${`https://picsum.photos/seed/${seed}/${width}/${height}`} width=${width} height=${height} loading='lazy' alt=${seed.replaceAll('-', ' ')}>
			`)}
		</mo-masonry>
	`
}

export const SpanningItems: StoryObj = {
	render: ({ columns, gap, tolerance }) => html`
		<mo-masonry columns=${columns} gap=${gap} tolerance=${tolerance}>
			<div ${style({ gridColumn: '1 / -1', height: '70px' })}>1 / -1</div>
			${heights.slice(0, 5).map((height, index) => html`
				<div ${style({ height: `${height}px` })}>${index + 1}</div>
			`)}
			<div ${style({ gridColumn: 'span 2', height: '110px' })}>span 2</div>
			${heights.slice(5, 10).map((height, index) => html`
				<div ${style({ height: `${height}px` })}>${index + 6}</div>
			`)}
			<div ${style({ gridColumn: 'span 2', height: '90px' })}>span 2</div>
			${heights.slice(10).map((height, index) => html`
				<div ${style({ height: `${height}px` })}>${index + 11}</div>
			`)}
		</mo-masonry>
	`
}