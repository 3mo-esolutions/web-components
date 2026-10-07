import { css, html, property, Component, component } from '@a11d/lit'
import { SlotController } from '@3mo/slot-controller'
import { SlottedInputDirectionController } from './SlottedInputDirectionController.js'

/**
 * The frame every field is drawn in: a floating label, a background and an underline around its content.
 *
 * @element mo-field
 *
 * @attr label - The label, which floats above the content once it is populated or active
 * @attr readonly - Hides the caret in the content
 * @attr disabled - Fades the field and makes it ignore the pointer
 * @attr required - Marks the label with an asterisk
 * @attr dense - Drops the padding and turns the label into a placeholder
 * @attr populated - Whether the content holds a value, which lifts the label
 * @attr invalid - Turns the label, caret and underline red
 * @attr active - Whether the content has focus, which draws the label and underline in the accent color
 *
 * @slot - The field's content
 * @slot start - Content to be placed at the start of the field
 * @slot end - Content to be placed at the end of the field
 *
 * @csspart container - The box holding the label and the content
 *
 * @cssprop --mo-field-background - The field's background color
 * @cssprop --mo-field-border-start-start-radius - The radius of the top corner at the start
 * @cssprop --mo-field-border-start-end-radius - The radius of the top corner at the end
 */
@component('mo-field')
export class Field extends Component {
	static override readonly shadowRootOptions = { ...Component.shadowRootOptions, delegatesFocus: true }

	@property({ reflect: true }) label = ''
	@property({ type: Boolean, reflect: true }) readonly = false
	@property({ type: Boolean, reflect: true }) disabled = false
	@property({ type: Boolean, reflect: true }) required = false
	@property({ type: Boolean, reflect: true }) dense = false
	@property({ type: Boolean, reflect: true }) populated = false
	@property({ type: Boolean, reflect: true }) invalid = false
	@property({ type: Boolean, reflect: true }) active = false

	readonly slotController = new SlotController(this)
	readonly inputDirectionController = new SlottedInputDirectionController(this, () => this.slotController.getAssignedElements('')[0])

	static override get styles() {
		return css`
			:host {
				--mo-field-label-font-size-on-focus: 0.75rem;
				position: relative;
				overflow: clip;
				display: flex;
				padding: 0.375rem 0.675rem;
				gap: 0.375rem;
				min-width: 0;

				border-start-start-radius: var(--mo-field-border-start-start-radius, var(--mo-border-radius));
				border-start-end-radius: var(--mo-field-border-start-end-radius, var(--mo-border-radius));
				box-sizing: border-box;
				background: var(--mo-field-background, light-dark(
					color-mix(in srgb, black, transparent 91%),
					color-mix(in srgb, black, transparent 50%)
				));
				justify-content: center;
				align-items: center;
			}

			:host([active]) {
				outline: none;
			}

			:host([dense]) {
				--mo-field-label-font-size-on-focus: 1rem;
			}

			:host([disabled]) {
				pointer-events: none;
				opacity: 0.5;
			}

			div {
				display: grid;
				grid-template-columns: minmax(0, 1fr);
				position: relative;
				flex: 1 1 auto;
				min-width: 0;
				overflow-x: hidden;
			}

			span, slot:not([name]) {
				grid-area: 1 / 1;
			}

			slot:not([name])::slotted(*) {
				border: 0px;
				width: 100%;
				field-sizing: content;
				font-family: inherit;
				outline: none;
				padding: 0.8rem 0 0 0;
				color: var(--mo-color-foreground);
				background-color: transparent;
				text-align: inherit;
			}

			:host([dense]) slot:not([name])::slotted(*) {
				padding: 0;
			}

			${this.labelStyles}
			${this.caretStyles}
			${this.indicatorLineStyles}

			slot {
				color: var(--mo-color-gray);
				display: flex;
				justify-content: center;
				align-items: center;
			}
		`
	}

	private static get labelStyles() {
		return css`
			span {
				position: sticky;
				inset-inline-start: 0;
				align-self: center;
				color: var(--mo-color-gray);
				transition: font-size .1s ease-out, color .1s ease-out;
				pointer-events: none;
				white-space: nowrap;
				overflow: hidden !important;
				text-overflow: ellipsis;
				user-select: none;
				line-height: 1rem;
			}

			:host([dense][populated]) span {
				visibility: hidden;
			}

			:host([active]) span, :host([populated]) span {
				align-self: start;
				font-size: var(--mo-field-label-font-size-on-focus);
			}

			:host([active]) span {
				color: var(--mo-color-accent);
			}

			:host([invalid]) span {
				color: var(--mo-color-red);
			}
		`
	}

	private static get indicatorLineStyles() {
		return css`
			:host {
				border-bottom: 1px solid var(--mo-color-gray-transparent);
			}

			:host::after {
				--mo-field-initial-outline-width: 10px;
				content: '';
				position: absolute;
				bottom: -1px;
				height: 2px;
				inset-inline-start: calc(calc(100% - var(--mo-field-initial-outline-width)) / 2);
				width: var(--mo-field-initial-outline-width);
				visibility: hidden;
				background-color: var(--mo-color-accent);
				transition: 0.2s ease all;
			}

			:host(:focus), :host([active]) {
				border-bottom: 1px solid var(--mo-color-accent);
			}

			:host([active])::after {
				visibility: visible;
				width: 100%;
				inset-inline-start: 0px;
			}

			:host([invalid]) {
				border-bottom: 1px solid var(--mo-color-red);
			}

			:host([invalid])::after {
				background-color: var(--mo-color-red);
			}
		`
	}

	private static get caretStyles() {
		return css`
			::slotted(*) {
				caret-color: var(--mo-color-accent);
			}

			:host([readonly]) ::slotted(*) {
				caret-color: transparent;
			}

			:host([invalid]) ::slotted(*) {
				caret-color: var(--mo-color-red);
			}
		`
	}

	protected override get template() {
		return html`
			${!this.slotController.hasAssignedContent('start') ? html.nothing : html`<slot name='start'></slot>`}
			<div part='container'>
				<span>${this.label} ${this.required ? '*' : ''}</span>
				<slot @slotchange=${() => this.inputDirectionController.observe()}></slot>
			</div>
			${!this.slotController.hasAssignedContent('end') ? html.nothing : html`<slot name='end'></slot>`}
		`
	}
}

declare global {
	interface HTMLElementTagNameMap {
		'mo-field': Field
	}
}
