import type { Meta, StoryObj } from '@storybook/web-components-vite'
import { Component, css, html, state, style } from '@a11d/lit'
import p from './package.json'
import './index.js'

export default {
	title: 'Layout & Containment / Virtualized Scroller',
	component: 'mo-virtualized-scroller',
	package: p,
} as Meta

const items = new Array(1000).fill(undefined).map((_, i) => i)

export const VirtualizedScroller: StoryObj = {
	render: () => {
		return html`
			<mo-virtualized-scroller ${style({ height: '400px' })}
				.items=${items}
				.getItemTemplate=${(number: number) => html`<story-virtualized-scroller-box>Box #${number}</story-virtualized-scroller-box>`}
			></mo-virtualized-scroller>
		`
	}
}

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

customElements.define('story-virtualized-scroller-box', Box)