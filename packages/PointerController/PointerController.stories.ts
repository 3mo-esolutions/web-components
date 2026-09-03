import type { Meta, StoryObj } from '@storybook/web-components-vite'
import { Component, css, html, state, style } from '@a11d/lit'
import { IntervalController } from '@3mo/interval-controller'
import p from './package.json'
import { PointerController as PointerC } from './PointerController.js'
import { PointerHoverController } from './PointerHoverController.js'

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

class StoryPointerHoverBox extends Component {
	@state() private events = 0

	protected readonly hoverController = new PointerHoverController(this, {
		handleHoverChange: () => this.events++,
	})

	static override get styles() {
		return css`
			:host {
				display: grid;
				place-content: center;
				gap: 6px;
				height: 160px;
				border: 3px dashed var(--mo-color-red);
				color: var(--mo-color-red);
				text-align: center;
				user-select: none;
			}

			:host([data-hovered]) {
				border-color: var(--mo-color-green);
				color: var(--mo-color-green);
			}

			small {
				color: var(--mo-color-foreground);
				opacity: 0.7;
			}
		`
	}

	protected override get template() {
		this.toggleAttribute('data-hovered', this.hoverController.hover)
		return html`
			<strong>${this.hoverController.hover ? 'hovered' : 'not hovered'}</strong>
			<small>${this.events} boundary events</small>
		`
	}
}

customElements.define('story-pointer-hover-box', StoryPointerHoverBox)

class StoryPointerHoverLayoutShift extends Component {
	@state() private shifted = false

	readonly timer = new IntervalController(this, 1000, () => {
		this.shifted = !this.shifted
	})

	protected override get template() {
		return html`
			<mo-flex gap='1rem' style='width: 480px'>
				<div ${style({ height: this.shifted ? '50px' : '0px', transition: 'height 0.5s ease' })}></div>
				<story-pointer-hover-box></story-pointer-hover-box>
			</mo-flex>
		`
	}
}

customElements.define('story-pointer-hover-layout-shift', StoryPointerHoverLayoutShift)

/** Demonstrates that hover tracked from the boundary events alone follows layout changes underneath a resting pointer. */
export const HoverUnderLayoutShift: StoryObj = {
	render: () => html`<story-pointer-hover-layout-shift></story-pointer-hover-layout-shift>`
}