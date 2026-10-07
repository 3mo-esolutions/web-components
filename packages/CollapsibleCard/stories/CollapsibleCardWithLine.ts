import { component, css, html } from '@a11d/lit'
import { CollapsibleCard } from '@3mo/collapsible-card'
import '@3mo/line'

/** A collapsible card with a line between its header and body, and a body that lays its content out in a grid. */
@component('story-collapsible-card-with-line')
export class CollapsibleCardWithLine extends CollapsibleCard {
	static override get styles() {
		return css`
			${super.styles}

			mo-line {
				margin-block-end: 0.875rem;
			}

			slot:not([name]) {
				display: grid;
				grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
				gap: 0.875rem;
			}
		`
	}

	protected override get bodyTemplate() {
		return html`
			${this.collapsed ? html.nothing : html`<mo-line></mo-line>`}
			${super.bodyTemplate}
		`
	}
}
