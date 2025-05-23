import { css, html, property, Component, component } from '@a11d/lit'
import { SlotController } from '@3mo/slot-controller'
import { DirectionsByLanguage } from '@3mo/localization'
import { ThemeController } from '@3mo/theme'

/**
 * @element mo-field
 *
 * @attr label
 * @attr readonly
 * @attr disabled
 * @attr required
 * @attr dense
 * @attr populated
 * @attr invalid
 *
 * @slot - The field's content
 * @slot start - Content to be placed at the start of the field
 * @slot end - Content to be placed at the end of the field
 *
 * @cssprop --mo-field-background - The field's background color
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
	readonly themeController = new ThemeController(this)

	static override get styles() {
		return css`
			:host {
				--mo-field-label-scale-on-focus: scale(0.75);
				--mo-field-label-translate-on-focus: translateY(-50%);
				--mo-field-label-transform-on-focus : var(--mo-field-label-translate-on-focus) var(--mo-field-label-scale-on-focus);
				position: relative;
				overflow: hidden;
				display: flex;
				gap: 4px;
				min-width: 0;

				border-start-start-radius: var(--mo-field-border-start-start-radius, var(--mo-border-radius));
				border-start-end-radius: var(--mo-field-border-start-end-radius, var(--mo-border-radius));
				box-sizing: border-box;
				background: var(--mo-field-background, var(--mo-field-background-default));
				gap: 6px;
				/* TODO: Better handling of height */
				height: 40px;
				justify-content: center;
				align-items: center;
			}

			:host([data-theme=light]) {
				--mo-field-background-default: color-mix(in srgb, black, transparent 91%);
			}

			:host([data-theme=dark]) {
				--mo-field-background-default: color-mix(in srgb, black, transparent 50%);
			}

			:host([active]) {
				outline: none;
			}

			:host([dense]) {
				height: 32px;
				--mo-field-label-scale-on-focus: scale(1);
			}

			:host([disabled]) {
				pointer-events: none;
				opacity: 0.5;
			}

			div {
				position: relative;
				flex: 1 1 auto;
				height: 100%;
			}

			div:first-child {
				margin-inline-start: 10px;
			}

			slot[name=start]:first-child {
				margin-inline-start: 8px;
			}

			div:last-child {
				margin-inline-end: var(--mo-field-input-padding-inline-end, 10px);
			}

			slot[name=end]:last-child {
				margin-inline-end: 8px;
			}

			slot:not([name])::slotted(*) {
				border: 0px;
				width: 100%;
				font-family: inherit;
				outline: none;
				padding: 0.8rem 0 0 0;
				height: calc(100% - 0.8rem);
				color: var(--mo-color-foreground);
				background-color: transparent;
				text-align: inherit;
			}

			:host([dense]) slot:not([name])::slotted(*) {
				padding: 0;
				height: 100%;
			}

			${this.labelStyles}
			${this.caretStyles}
			${this.indicatorLineStyles}

			slot {
				color: var(--mo-color-gray);
				display: flex;
				height: 100%;
				justify-content: center;
				align-items: center;
			}
		`
	}

	protected static get labelStyles() {
		return css`
			span {
				position: absolute;
				top: min(50%, 30px);
				transform: var(--mo-field-label-translate-on-focus);
				color: var(--mo-color-gray);
				transition: .1s ease-out;
				pointer-events: none;
				white-space: nowrap;
				overflow: hidden !important;
				text-overflow: ellipsis;
				max-width: 100%;
				user-select: none;
			}

			div[data-direction=left] span {
				left: 0px;
				transform-origin: top left;
			}

			div[data-direction=right] span {
				right: 0px;
				transform-origin: top right;
			}

			:host([dense][populated]) span {
				visibility: hidden;
			}

			:host([active]) span, :host([populated]) span {
				top: 14px;
				transform: var(--mo-field-label-transform-on-focus);
			}

			:host([active]) span {
				color: var(--mo-color-accent);
			}

			:host([invalid]) span {
				color: var(--mo-color-red);
			}
		`
	}

	protected static get indicatorLineStyles() {
		return css`
			:host {
				border-bottom: 1px solid var(--mo-color-gray-transparent);
			}

			:host:after {
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

			:host([active]):after {
				visibility: visible;
				width: 100%;
				inset-inline-start: 0px;
			}

			:host([invalid]) {
				border-bottom: 1px solid var(--mo-color-red);
			}

			:host([invalid]):after {
				background-color: var(--mo-color-red);
			}
		`
	}

	protected static get caretStyles() {
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

	private get direction() {
		const styles = getComputedStyle(this)
		const isRtl = DirectionsByLanguage.get() === 'rtl'
			|| this.slotController.getAssignedElements('').some(e => e.getAttribute('dir') === 'rtl')
		return isRtl
			? ['end', 'left'].includes(styles.textAlign) ? 'left' : 'right'
			: ['end', 'right'].includes(styles.textAlign) ? 'right' : 'left'
	}

	protected override get template() {
		return html`
			${!this.slotController.hasAssignedContent('start') ? html.nothing : html`<slot name='start'></slot>`}
			<div part='container' data-direction=${this.direction}>
				<span>${this.label} ${this.required ? '*' : ''}</span>
				<slot></slot>
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