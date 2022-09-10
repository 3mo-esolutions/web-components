import { story, meta } from '../../.storybook/story.js'
import { Component, component, css, html, state, style } from '@a11d/lit'
import p from './package.json'
import './index.js'

export default meta({
	title: 'Core/Layout/Virtualized Scroller',
	component: 'mo-virtualized-scroller',
	parameters: {
		docs: {
			description: {
				component: p.description,
			},
		}
	}
})

const items = new Array(1000).fill(undefined).map((_, i) => i)

export const VirtualizedScroller = story({
	render: () => {
		return html`
			<mo-virtualized-scroller ${style({ height: '400px' })}
				.items=${items}
				.getItemTemplate=${number => html`<mo-virtualized-scroller-story-box>Box #${number}</mo-virtualized-scroller-story-box>`}
			></mo-virtualized-scroller>
		`
	}
})

@component('mo-virtualized-scroller-story-box')
class Box extends Component {
	@state() private secondPassedConnected = false

	override connected() {
		setTimeout(() => this.secondPassedConnected = true, 1000)
	}

	override disconnected() {
		this.secondPassedConnected = false
	}

	static override get styles() {
		return css`
			:host {
				display: block;
				width: 100%;
				margin: 10px;
			}
		`
	}

	protected override get template() {
		return html`
			<div ${style({ padding: '10px', backgroundColor: this.secondPassedConnected ? '#7FCDCD' : '#F7CAC9' })}>
				${this.secondPassedConnected ? '✅' : '⌛'}
				<slot></slot>
			</div>
		`
	}
}