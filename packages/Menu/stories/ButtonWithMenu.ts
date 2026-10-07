import { Component, component, css, html, query } from '@a11d/lit'
import '@3mo/menu'

/** A component of your own that anchors its menu to itself and opens it from the button inside. */
@component('story-button-with-menu')
export class ButtonWithMenu extends Component {
	@query('mo-button') private readonly button!: HTMLElement

	static override get styles() {
		return css`:host { display: inline-flex; }`
	}

	// The menu returns the focus to its anchor, which is this host.
	override focus() {
		this.button.focus()
	}

	protected override get template() {
		return html`
			<mo-button id='button' type='outlined' endIcon='chevron_right'>Share</mo-button>
			<mo-menu .anchor=${this} target='button' placement='inline-end' alignment='start'>
				<mo-menu-item icon='mail'>Email</mo-menu-item>
				<mo-menu-item icon='insert_link'>Copy link</mo-menu-item>
				<mo-menu-item icon='qr_code'>QR code</mo-menu-item>
			</mo-menu>
		`
	}
}
