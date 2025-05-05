import { component, Component, css, property } from '@a11d/lit'
import type { PopoverCoordinates } from './PopoverCoordinates.js'

@component('mo-popover-virtual-anchor')
export class PopoverVirtualAnchor extends Component {
	@property({
		type: Object,
		updated(this: PopoverVirtualAnchor, [x, y]: PopoverCoordinates = [0, 0]) {
			this.style.left = `${x}px`
			this.style.top = `${y}px`
		}
	}) coordinates?: PopoverCoordinates

	static override get styles() {
		return css`
			:host {
				position: fixed;
				pointer-events: none;
				width: 0;
				height: 0;
			}
		`
	}
}