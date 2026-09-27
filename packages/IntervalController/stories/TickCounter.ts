import { Component, component, html, state } from '@a11d/lit'
import { IntervalController } from '@3mo/interval-controller'

/** A counter of the ticks it has seen, one a second. */
@component('story-tick-counter')
export class TickCounter extends Component {
	@state() private ticks = 0

	readonly intervalController = new IntervalController(this, 1000, () => { this.ticks++ })

	protected override get template() {
		return html`${this.ticks} ticks`
	}
}