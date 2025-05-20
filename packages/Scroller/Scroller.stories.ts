import type { Meta, StoryObj } from '@storybook/web-components'
import { html, style } from '@a11d/lit'
import p from './package.json'
import './index.js'

export default {
	title: 'Layout & Containment / Scroller',
	component: 'mo-scroller',
	package: p,
} as Meta

const loremIpsum = (repetition: number) => new Array(repetition).fill(0).map(() => html`<p>Lorem ipsum dolor sit.</p>`)

export const Scroller: StoryObj = {
	render: () => html`
		<mo-scroller ${style({ height: '400px' })}>
			${loremIpsum(50)}
		</mo-scroller>
	`
}

export const Snapping: StoryObj = {
	render: () => html`
		<mo-scroller ${style({ height: '400px' })} snapType='y proximity'>
			${new Array(50).fill(0).map((_, i) => html`
				<div ${style({ textAlign: 'center', lineHeight: '300px', color: 'black', backgroundColor: i % 2 ? '#7FCDCD' : '#F3E0BE', scrollSnapAlign: 'center' })}>
					${loremIpsum(1)}
				</div>
			`)}
		</mo-scroller>
	`
}