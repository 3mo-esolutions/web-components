import { component, css } from '@a11d/lit'
import { MdFocusRing } from '@material/web/focus/md-focus-ring.js'

/**
 * A ring that marks keyboard focus on its parent, or on the element it is attached to.
 *
 * @element mo-focus-ring
 *
 * @attr visible - Whether the ring shows; keyboard focus sets it and blur clears it.
 * @attr inward - Draws the ring inside the element instead of around it.
 * @attr for - The id of the element whose focus the ring follows, in place of its parent.
 * @prop control - The element whose focus the ring follows, in place of its parent.
 *
 * @cssprop --mo-focus-ring-color - The color of the focus ring, defaults to var(--mo-color-accent).
 */
@component('mo-focus-ring')
export class FocusRing extends MdFocusRing {
	static override get styles() {
		return [
			...MdFocusRing.styles,
			css`
				:host {
					--md-focus-ring-color: var(--mo-focus-ring-color, var(--mo-color-accent));
					--md-focus-ring-shape: var(--mo-border-radius);
				}
			`,
		]
	}

	override ariaHidden = 'true'

	override setAttribute(qualifiedName: string, value: string) {
		// Skip setting "aria-hidden" as attribute as it is already set as property.
		if (qualifiedName !== 'aria-hidden') {
			return super.setAttribute(qualifiedName, value)
		}
	}

	override dispatchEvent(event: Event) {
		// Prevent dispatching "visibility-changed" event as it causes performance issues.
		if (event.type === 'visibility-changed') {
			return false
		}
		return super.dispatchEvent(event)
	}
}
