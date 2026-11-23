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
 * @attr active - Whether the content is being used, which draws the label and underline in the accent color. Focus inside the field draws them as well.
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
	readonly inputDirectionController = new SlottedInputDirectionController(this, (): Element | undefined => {
		const [element] = this.slotController.getAssignedElements('')
		return element?.querySelector('input, textarea') ?? element
	})

	static override get styles() {
		return css`
			:host {
				position: relative;
				overflow: clip;
				display: flex;
				padding: 0.25rem 0.675rem;
				gap: 0.375rem;
				min-width: 0;
				min-height: 2.375rem;

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

			:host([dense]) {
				min-height: 1.75rem;
			}

			:host([active]), :host(:focus-within) {
				outline: none;
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

			span, slot:not([name]), div::before {
				grid-area: 1 / 1;
			}

			/* Reserves the label's resting width, so the field keeps its width once the label floats and shrinks. */
			div::before {
				content: attr(data-label) / '';
				font-size: 0.875rem;
				height: 0;
				visibility: hidden;
				overflow: hidden;
				white-space: nowrap;
			}

			slot:not([name])::slotted(*) {
				border: 0px;
				width: 100%;
				font-family: inherit;
				font-size: 0.875rem;
				outline: none;
				padding: 0.8125rem 0 0 0;
				color: var(--mo-color-foreground);
				background-color: transparent;
				text-align: inherit;
			}

			/* Fills the field, and counts as 20 characters where the field is sized by its content, whatever the value. */
			slot:not([name])::slotted(:is(input, textarea)) {
				width: 20ch;
				min-width: 100%;
				max-width: 100%;
			}

			/* Engines give an input lines of different heights, which would change the field's height; a larger font still fits. */
			slot:not([name])::slotted(input) {
				box-sizing: content-box;
				height: max(1rem, 1.1em);
			}

			/* Without a label, its room is split above and below, so the content is centered at the same height. */
			:host(:is(:not([label]), [label=''])) slot:not([name])::slotted(*) {
				padding: 0.40625rem 0;
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

			/* Start and end content may use the room of the padding and the underline, so an icon button does not make the field taller. */
			slot[name] {
				margin-block: -0.25rem calc(-0.25rem - 1px);
				min-height: 1.75rem;
				align-items: var(--_mo-field-slot-align-items, center);
			}
		`
	}

	private static get labelStyles() {
		return css`
			/* At rest as large as the content it stands for. Sticky "top" is measured from the container, so it can slide the label from its center to its top. It shrinks by font size, as Chrome draws scaled text without subpixel antialiasing. */
			span {
				position: sticky;
				inset-inline-start: 0;
				top: var(--_mo-field-label-rest-top, calc(50% - 0.5lh));
				align-self: start;
				font-size: 0.875rem;
				line-height: 1;
				color: var(--mo-color-gray);
				transition: calc(var(--mo-duration-quick) * 0.6) ease-out;
				transition-property: top, font-size, color;
				pointer-events: none;
				white-space: nowrap;
				/* Clipped only inline, as the tight line box would cut the descenders. */
				overflow-x: clip !important;
				text-overflow: ellipsis;
				user-select: none;
			}

			:host([dense][populated]) span {
				visibility: hidden;
			}

			:host(:not([dense])[active]) span, :host(:not([dense]):focus-within) span, :host(:not([dense])[populated]) span {
				/* 12px is the smallest size Roboto renders cleanly at; it sits a pixel below the top, just clear of the content. */
				top: 0.0625rem;
				font-size: 0.75rem;
			}

			:host([active]) span, :host(:focus-within) span {
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
				content: '';
				position: absolute;
				bottom: -1px;
				height: 2px;
				inset-inline: 0;
				scale: 0 1;
				background-color: var(--mo-color-accent);
				transition: scale calc(var(--mo-duration-quick) * 0.6) ease-out;
			}

			:host(:focus), :host(:focus-within), :host([active]) {
				border-bottom: 1px solid var(--mo-color-accent);
			}

			:host([active])::after, :host(:focus-within)::after {
				scale: 1;
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

	private get labelText() {
		return [this.label, this.required ? '*' : ''].filter(Boolean).join(' ')
	}

	protected override get template() {
		return html`
			${!this.slotController.hasAssignedContent('start') ? html.nothing : html`<slot name='start'></slot>`}
			<div part='container' data-label=${this.labelText}>
				<span>${this.labelText}</span>
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
