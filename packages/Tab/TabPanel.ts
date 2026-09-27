import { Component, component, css, html, property } from '@a11d/lit'

/**
 * One view of a tabbed interface: the content which a single tab reveals.
 *
 * It belongs into a `mo-tabs` and stays in the DOM while hidden. It is focusable unless it is given a `tabindex`.
 *
 * @element mo-tab-panel
 *
 * @attr value - Pairs the panel with the tab of the same `value`
 * @attr active - Whether this is the panel being shown; set by `mo-tabs`, meant to be read and styled
 *
 * @slot - The content of the panel
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