import type { Meta, StoryObj } from '@storybook/web-components-vite'
import { html } from '@a11d/lit'
import { photos } from '../../stories/index.js'
import './index.js'

type Args = {
	readonly columns: string
	readonly gap: string
	readonly tolerance: string
}

export default {
	title: 'Layout / Masonry',
	component: 'mo-masonry',
	args: {
		columns: '4',
		gap: '10px',
		tolerance: '1em',
	},
	decorators: [story => html`
		<style>
			mo-masonry > div { display: flex; align-items: center; justify-content: center; border-radius: 4px; color: black; font-size: x-large; }
			mo-masonry > div:nth-of-type(4n + 1) { background: #F7CAC9; }
			mo-masonry > div:nth-of-type(4n + 2) { background: #7FCDCD; }
			mo-masonry > div:nth-of-type(4n + 3) { background: #92A8D1; }
			mo-masonry > div:nth-of-type(4n + 4) { background: #F3E0BE; }
			mo-masonry > img { display: block; width: 100%; height: auto; border-radius: 4px; }
		</style>
		${story()}
	`],
} satisfies Meta<Args>

type Story = StoryObj<Args>

export const Default: Story = {
	render: ({ columns, gap, tolerance }) => html`
		<mo-masonry columns=${columns} gap=${gap} tolerance=${tolerance}>
			${[90, 190, 120, 60, 220, 140, 80, 170, 110, 200, 70, 150, 100, 180, 130, 120].map((height, index) => html`
				<div style='height: ${height}px'>${index + 1}</div>
			`)}
		</mo-masonry>
	`,
}

/** `rows` instead of `columns` flips the masonry sideways into a »brick« layout that fills rows of a given height. */
export const Brick: Story = {
	render: () => html`
		<mo-masonry rows='3' gap='10px' style='height: 400px'>
			${[220, 90, 140, 300, 110, 180, 80, 250, 130, 200, 100, 160, 240, 120, 190, 140].map((width, index) => html`
				<div style='width: ${width}px'>${index + 1}</div>
			`)}
		</mo-masonry>
	`,
}

/** Photos of different heights in as many columns as fit - resize the window to watch them reflow. */
export const Gallery: Story = {
	render: () => html`
		<mo-masonry columns='repeat(auto-fill, minmax(200px, 1fr))' gap='8px'>
			${photos.map(photo => html`
				<img src=${photo.thumbnailUrl} width=${photo.width} height=${photo.height} loading='lazy' alt=${photo.title}>
			`)}
		</mo-masonry>
	`,
}

/** `tolerance` counts lanes within that distance as ties, resolved in item order: `0` packs the tightest, `infinity` keeps the order. */
export const Tolerance: Story = {
	render: () => html`
		<mo-flex direction='horizontal' gap='32px'>
			${['0', 'infinity'].map(tolerance => html`
				<mo-masonry columns='3' gap='8px' tolerance=${tolerance} style='flex: 1'>
					${[90, 190, 120, 60, 220, 140, 80, 170, 110, 200, 70, 150].map((height, index) => html`<div style='height: ${height}px'>${index + 1}</div>`)}
				</mo-masonry>
			`)}
		</mo-flex>
	`,
}

/** Items can span several lanes with `grid-column`, such as `1 / -1` across all of them or `span 2`. */
export const SpanningItems: Story = {
	render: ({ columns, gap, tolerance }) => html`
		<mo-masonry columns=${columns} gap=${gap} tolerance=${tolerance}>
			<div style='grid-column: 1 / -1; height: 70px'>1 / -1</div>
			${[90, 190, 120, 60, 220].map((height, index) => html`<div style='height: ${height}px'>${index + 1}</div>`)}
			<div style='grid-column: span 2; height: 110px'>span 2</div>
			${[140, 80, 170, 110, 200].map((height, index) => html`<div style='height: ${height}px'>${index + 6}</div>`)}
			<div style='grid-column: span 2; height: 90px'>span 2</div>
			${[70, 150, 100, 180, 130, 120].map((height, index) => html`<div style='height: ${height}px'>${index + 11}</div>`)}
		</mo-masonry>
	`,
}