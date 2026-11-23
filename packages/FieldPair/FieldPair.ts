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
 * @cssprop --mo-field-pair-attachment-width - The attachment's width, as wide as its content by default
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

			/* The field spans both columns, so the attachment lies over its top corner at the end. */
			:host([mode=overlay]) {
				display: grid;
				grid-template-columns: minmax(0, 1fr) auto;
			}

			:host([mode=overlay]) ::slotted(:not([slot])) {
				grid-area: 1 / 1 / 2 / 3;
			}

			slot[name=attachment] {
				display: inline-block;
				flex: 0 0 auto;
				width: var(--mo-field-pair-attachment-width, auto);
			}

			:host([mode=overlay]) slot[name=attachment] {
				grid-area: 1 / 2;
				align-self: start;
				z-index: 1;
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
