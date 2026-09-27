import { Component, component, css, html } from '@a11d/lit'
import { MediaQueryController } from '@3mo/media-query-observer'

/** A readout of the user preferences and input capabilities the operating system reports. */
@component('story-user-preferences')
export class UserPreferences extends Component {
	readonly darkController = new MediaQueryController(this, '(prefers-color-scheme: dark)')
	readonly reducedMotionController = new MediaQueryController(this, '(prefers-reduced-motion: reduce)')
	readonly coarsePointerController = new MediaQueryController(this, '(pointer: coarse)')

	static override get styles() {
		return css`
			dl { display: grid; grid-template-columns: auto auto; gap: 0.25rem 1rem; margin: 0; }
			dt { font-family: monospace; }
			dd { margin: 0; }
		`
	}

	protected override get template() {
		return html`
			<dl>
				<dt>prefers-color-scheme: dark</dt>
				<dd>${this.darkController.matches}</dd>
				<dt>prefers-reduced-motion: reduce</dt>
				<dd>${this.reducedMotionController.matches}</dd>
				<dt>pointer: coarse</dt>
				<dd>${this.coarsePointerController.matches}</dd>
			</dl>
		`
	}
}