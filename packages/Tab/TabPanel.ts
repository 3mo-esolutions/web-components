import { Component, component, css, html, property } from '@a11d/lit'

/**
 * One view of a tabbed interface: the content which a single tab reveals.
 *
 * It is the "tabpanel" of the ARIA tabs pattern and belongs into a "mo-tabs", which pairs it with the tab
 * carrying the same "value", names it after that tab and shows it while that tab is active. On its own it
 * shows nothing, as nothing activates it.
 *
 * Its content stays in the DOM while another panel is shown, so scroll offsets, form state and anything
 * already fetched survive a switch. Content which must not survive one is better rendered conditionally.
 *
 * The panel is always focusable, which ARIA asks for wherever a panel holds nothing focusable itself - which
 * cannot be told from the outside once the content sits behind a shadow root. Set "tabindex" to opt out.
 *
 * @element mo-tab-panel
 *
 * @attr value - Pairs the panel with the tab of the same "value".
 * @attr active - Whether this is the panel being shown. The tabs writes it; it is meant to be read and styled, as in "mo-tab-panel[active]".
 *
 * @slot - The content of the panel.
 */
@component('mo-tab-panel')
export class TabPanel extends Component {
	@property({ reflect: true }) value?: string

	@property({ type: Boolean, reflect: true }) active = false

	protected override connected() {
		this.slot ||= 'panel'
		this.role ||= 'tabpanel'
		if (this.hasAttribute('tabindex') === false) {
			this.tabIndex = 0
		}
	}

	static override get styles() {
		return css`
			:host {
				display: block;
				flex: 1 1 auto;
				min-block-size: 0;
			}

			:host(:not([active])) {
				display: none;
			}

			:host(:focus-visible) {
				outline: 2px solid var(--mo-color-accent);
				outline-offset: -2px;
			}
		`
	}

	protected override get template() {
		return html`<slot></slot>`
	}
}

declare global {
	interface HTMLElementTagNameMap {
		'mo-tab-panel': TabPanel
	}
}