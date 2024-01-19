import { Component, component, css, html, property, style } from '@a11d/lit'
import { SlotController } from '@3mo/slot-controller'
import '@3mo/heading'

/**
 * @element mo-section
 *
 * @attr heading
 *
 * @slot - Content
 * @slot header - The whole header
 * @slot heading - The heading which has a default template rendering a mo-heading element
 * @slot action - Actions in the header
 *
 * @csspart heading
 */
@component('mo-section')
export class Section extends Component {
	@property() heading = ''

	protected readonly slotController = new SlotController(this)

	static override get styles() {
		return css`
			:host { display: block; }

			section {
				display: flex;
				flex-direction: column;
				gap: 8px;
				width: 100%;
				height: 100%;
			}

			slot[name=action], slot[name=heading], slot[name=heading]::slotted(*) {
				font-weight: 500;
			}
		`
	}

	protected override get template() {
		return html`
			<section>
				${this.headerTemplate}
				${this.contentTemplate}
			</section>
		`
	}

	protected get headerTemplate() {
		return html`
			<slot name='header'>
				${this.defaultHeaderTemplate}
			</slot>
		`
	}

	protected get defaultHeaderTemplate() {
		return html`
			<div ${style({ display: 'flex', alignItems: 'center', minHeight: '30px' })}>
				${this.headingTemplate}
				${this.actionTemplate}
			</div>
		`
	}

	protected get headingTemplate() {
		return html`<slot name='heading'>${this.defaultHeadingTemplate}</slot>`
	}

	protected get defaultHeadingTemplate() {
		return html`<mo-heading part='heading' typography='heading4' ${style({ flex: '1' })}>${this.heading}</mo-heading>`
	}

	protected get actionTemplate() {
		return html`<slot name='action'>${this.defaultActionTemplate}</slot>`
	}

	protected get defaultActionTemplate() {
		return html.nothing
	}

	protected get contentTemplate() {
		return !this.slotController.hasAssignedContent('') ? html.nothing : html`
			<mo-grid ${style({ height: '100%' })}>
				<slot></slot>
			</mo-grid>
		`
	}
}

declare global {
	interface HTMLElementTagNameMap {
		'mo-section': Section
	}
}