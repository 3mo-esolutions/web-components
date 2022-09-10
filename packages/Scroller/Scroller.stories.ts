import { story, meta } from '../../.storybook/story.js'
import { html, style } from '@a11d/lit'
import p from './package.json'
import './index.js'

export default meta({
	title: 'Core/Layout/Scroller',
	component: 'mo-scroller',
	parameters: {
		docs: {
			description: {
				component: p.description,
			},
		}
	}
})

export const Scroller = story({
	render: () => {
		return html`
			<mo-scroller ${style({ height: '400px' })}>
				${loremIpsum(50)}
			</mo-scroller>
		`
	}
})

const loremIpsum = (repetition: number) => new Array(repetition).fill(0).map(() => html`<p>Lorem ipsum dolor sit.</p>`)