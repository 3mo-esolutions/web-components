import { Component, component, css, html, property, queryAssignedElements } from '@a11d/lit'
import type { TimelineItem } from './TimelineItem.js'

/**
 * @element mo-timeline - A component that represents a timeline.
 *
 * @attr direction - The direction of the timeline, either 'vertical' or 'horizontal'. Defaults to 'vertical'.
 *
 * @slot - The items of the timeline.
 */
@component('mo-timeline')
export class Timeline extends Component {
	@property({ reflect: true, updated(this: Timeline) { this.updateItemsDirection() } }) direction: 'vertical' | 'horizontal' = 'vertical'

	static override get styles() {
		return css`
			:host {
				display: grid;
			}

			:host([direction=vertical]) {
				grid-template-columns: auto 1fr;
				column-gap: max(0.2vw, 6px);
			}

			:host([direction=vertical][has-meta]) {
				grid-template-columns: auto auto 1fr;
			}

			:host([direction=horizontal]) {
				grid-template-rows: auto 1fr;
				grid-auto-flow: column;
				row-gap: max(0.2vh, 6px);
			}

			:host([direction=horizontal][has-meta]) {
				grid-template-rows: auto auto 1fr;
			}
		`
	}

	@queryAssignedElements({ selector: '[instanceof*=mo-timeline-item]' }) readonly items!: Array<TimelineItem>

	protected override get template() {
		return html`<slot @slotchange=${this.handleSlotChange}></slot>`
	}

	private handleSlotChange() {
		this.toggleAttribute('has-meta', this.items.some(item => item.hasMeta))
		this.updateItemsDirection()
	}

	private updateItemsDirection() {
		this.items.forEach(item => item.setAttribute('direction', this.direction))
	}
}

declare global {
	interface HTMLElementTagNameMap {
		'mo-timeline': Timeline
	}
}