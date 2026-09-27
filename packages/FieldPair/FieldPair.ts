import { Component, component, css, html, property } from '@a11d/lit'

export enum FieldPairMode {
	Attach = 'attach',
	Overlay = 'overlay',
}

/**
 * A field joined with an attachment, such as a unit or a country code, into one seamless control.
 *
 * @element mo-field-pair
 *
 * @attr mode - `attach` places the attachment beside the field, `overlay` lays it over the field's top corner at the end
 * @attr reversed - Puts the attachment before the field
 *
 * @slot - The field
 * @slot attachment - The field attached to it
 *
 * @cssprop --mo-field-pair-attachment-width - The attachment's width, 100px by default
 */
@component('mo-field-pair')
export class FieldPair extends Component {
	@property({ reflect: true }) mode = FieldPairMode.Attach
	@property({ type: Boolean, reflect: true }) reversed = false

	static override get styles() {
		return css`
			:host {
				position: relative;
				display: flex;
			}

			:host([mode=overlay]) {
				display: block;
			}

			slot[name=attachment] {
				display: inline-block;
				flex: 0 0 var(--mo-field-pair-attachment-width, 100px);
				width: var(--mo-field-pair-attachment-width, 100px);
			}

			:host([mode=overlay]) slot[name=attachment] {
				height: auto;
				position: absolute;
				inset-inline-end: 0;
				top: 0;
			}

			::slotted(:not([slot])) {
				width: 100%;
				height: 100%;
			}

			:host(:not([reversed])) ::slotted(:not([slot])) {
				--mo-field-border-start-end-radius: 0px;
			}

			:host([reversed]) ::slotted(:not([slot])) {
				--mo-field-border-start-start-radius: 0px;
			}

			::slotted([slot=attachment]) {
				height: 100%;
				align-items: center;
			}

			:host(:not([reversed])) ::slotted([slot=attachment]) {
				--mo-field-border-start-start-radius: 0px;
			}

			:host([reversed]) ::slotted([slot=attachment]) {
				--mo-field-border-start-end-radius: 0px;
			}
		`
	}

	protected override get template() {
		return this.reversed ? html`
			${this.attachmentsSlotTemplate}
			${this.contentSlotTemplate}
		` : html`
			${this.contentSlotTemplate}
			${this.attachmentsSlotTemplate}
		`
	}

	protected get contentSlotTemplate() {
		return html`<slot></slot>`
	}

	protected get attachmentsSlotTemplate() {
		return html`<slot name='attachment'></slot>`
	}
}

declare global {
	interface HTMLElementTagNameMap {
		'mo-field-pair': FieldPair
	}
}