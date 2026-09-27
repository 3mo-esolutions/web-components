import { Component, component, css, html, state } from '@a11d/lit'
import { IntervalController } from '@3mo/interval-controller'

/** A clock that reads the time once a second. */
@component('story-clock')
export class Clock extends Component {
	@state() private now = new Date()

	readonly intervalController = new IntervalController(this, 1000, () => { this.now = new Date() })

	static override get styles() {
		return css`
			:host { font-size: 2rem; font-variant-numeric: tabular-nums; }
		`
	}

	protected override get template() {
		return html`<time datetime=${this.now.toISOString()}>${this.now.toLocaleTimeString()}</time>`
	}
}