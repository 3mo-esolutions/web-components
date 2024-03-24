import type { Meta, StoryObj } from '@storybook/web-components'
import { html, style } from '@a11d/lit'
import p from './package.json'
import './index.js'

export default {
	title: 'Scroller',
	component: 'mo-scroller',
	package: p,
} as Meta

export const Scroller: StoryObj = {
	render: () => {
		return html`
			<mo-scroller ${style({ height: '400px' })}>
				${loremIpsum(50)}
			</mo-scroller>
		`
	}
}

const loremIpsum = (repetition: number) => new Array(repetition).fill(0).map(() => html`<p>Lorem ipsum dolor sit.</p>`)