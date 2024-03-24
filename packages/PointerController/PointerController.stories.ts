import type { Meta, StoryObj } from '@storybook/web-components'
import { Component, css, html } from '@a11d/lit'
import p from './package.json'
import { PointerController as PointerC } from './PointerController.js'

export default {
	title: 'Pointer Controller',
	package: p,
} as Meta

class StoryPointerController extends Component {
	protected readonly pointerController = new PointerC(this)

	static override get styles() {
		return css`
			:host {
				display: inline-block;
			}
		`
	}

	protected override get template() {
		const { hover, press, type } = this.pointerController
		const hoverText = !hover ? '' : 'hovered'
		const pressText = !press ? '' : 'pressed'
		const typeText = !hover && !press || !type ? '' : `using ${type}`
		return html`
			<mo-button type='raised'>
				Button ${[hoverText, pressText].filter(Boolean).join(' and ')} ${typeText}
			</mo-button>
		`
	}
}

customElements.define('story-pointer-controller', StoryPointerController)

export const PointerController: StoryObj = {
	render: () => html`<story-pointer-controller></story-pointer-controller>`
}