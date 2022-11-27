import { component, html, nothing, css } from '@a11d/lit'
import { Section } from '@3mo/section'
import '@3mo/card'

/**
 * @element mo-group-box
 *
 * @slot footer
 *
 * @csspart card - The card element.
 */
@component('mo-group-box')
export class GroupBox extends Section {
	static override get styles() {
		return css`
			${super.styles}
			mo-card { flex: 1; }
		`
	}

	protected override get contentTemplate() {
		return html`
			<mo-card part='card'>
				${super.contentTemplate}
				${this.footerTemplate}
			</mo-card>
		`
	}

	protected get footerTemplate() {
		return html`<slot slot='footer' name='footer'>${this.defaultFooterTemplate}</slot>`
	}

	protected get defaultFooterTemplate() {
		return nothing
	}
}

declare global {
	interface HTMLElementTagNameMap {
		'mo-group-box': GroupBox
	}
}