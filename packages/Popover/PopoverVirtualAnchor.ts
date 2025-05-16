import { component, Component, css, property } from '@a11d/lit'
import type { PopoverCoordinates } from './PopoverCoordinates.js'

@component('mo-popover-virtual-anchor')
export class PopoverVirtualAnchor extends Component {
	@property({
		type: Object,
		updated(this: PopoverVirtualAnchor, [x, y]: PopoverCoordinates = [0, 0]) {
			// Do not set "style.left" and "style.top" directly
			// as it will cause the anchor positioning to disabled somehow
			// but updating the CSS properties does not lead to this issue
			this.style.setProperty('--x', `${x}px`)
			this.style.setProperty('--y', `${y}px`)
		}
	}) coordinates?: PopoverCoordinates

	static override get styles() {
		return css`
			:host {
				position: fixed;
				pointer-events: none;
				width: 0;
				height: 0;
				left: var(--x);
				top: var(--y);
			}
		`
	}
}