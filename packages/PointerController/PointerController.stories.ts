import type { Meta, StoryObj } from '@storybook/web-components'
import { Component, css, html, style } from '@a11d/lit'
import p from './package.json'
import { PointerController as PointerC } from './PointerController.js'

export default {
	title: 'Utilities / Pointer Controller',
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
		const color = !hover ? 'var(--mo-color-red)' : press ? 'var(--mo-color-green)' : 'var(--mo-color-blue)'
		return html`
			<mo-flex alignItems='center' justifyContent='center' ${style({ width: '400px', height: '300px', border: `2px dashed ${color}`, textAlign: 'center', userSelect: 'none' })}>
				<span>${[hoverText, pressText].filter(Boolean).join(' and ')} ${typeText}</span>
			</mo-flex>
		`
	}
}

customElements.define('story-pointer-controller', StoryPointerController)

export const PointerController: StoryObj = {
	render: () => html`<story-pointer-controller></story-pointer-controller>`
}