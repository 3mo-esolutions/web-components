import { component, css, event, eventListener, property } from '@a11d/lit'
import { SelectionGroupPattern } from '@3mo/selection-group'
import { Button } from './Button.js'

/**
 * A `mo-button` that carries a selected state. Inside a `mo-selection-group` the group owns the selection
 * and the tab stop; on its own it is a toggle bound with `selected`.
 *
 * The selection state is announced on the host, not on the native button two shadow roots down in
 * `@material/web`, which forwards only `aria-label`, `aria-haspopup` and `aria-expanded`.
 *
 * @element mo-selectable-button
 *
 * @attr value - Identifies the button within a `mo-selection-group`.
 * @attr selected - Whether the button is selected.
 *
 * @fires requestSelect - Dispatched with the state the button would take, before it takes it. Cancelable: a group prevents it and rules instead.
 * @fires change - Dispatched with the new state when the user toggles the button.
 */
@component('mo-selectable-button')
export class SelectableButton extends Button {
	@event({ bubbles: true }) readonly change!: EventDispatcher<boolean>

	@property() value?: string
	@property({ type: Boolean, reflect: true, bindingDefault: true, event: 'change' }) selected = false
	/** The pattern of the group the button is in, written by that group. Alone, it is a toggle. */
	@property() selectionPattern?: SelectionGroupPattern

	private get isRadio() {
		return this.selectionPattern === SelectionGroupPattern.Radio
	}

	static override get styles() {
		return css`
			${super.styles}

			:host(:not([selected])) {
				--mo-button-accent-color: var(--mo-color-gray);
				--mo-button-on-accent-color: var(--mo-color-gray);
			}

			:host(:not([selected])[type=elevated]),
			:host(:not([selected])[type=filled]),
			:host(:not([selected])[type=tonal]) {
				--mo-button-accent-color: var(--mo-color-transparent-gray);
			}

			:host([selected]) {
				background: var(--mo-color-selected);
			}
		`
	}

	protected override updated(...parameters: Parameters<Button['updated']>) {
		super.updated(...parameters)
		this.role = this.isRadio ? 'radio' : 'button'
		this.setAttribute(this.isRadio ? 'aria-checked' : 'aria-pressed', String(this.selected))
		this.removeAttribute(this.isRadio ? 'aria-pressed' : 'aria-checked')
	}

	@eventListener('click')
	protected handleClick() {
		if (!this.requestSelect(!this.selected)) {
			return
		}
		this.selected = !this.selected
		this.change.dispatch(this.selected)
	}

	protected requestSelect(selected: boolean) {
		return this.dispatchEvent(new CustomEvent<boolean>('requestSelect', {
			detail: selected,
			bubbles: true,
			cancelable: true,
		}))
	}
}

declare global {
	interface HTMLElementTagNameMap {
		'mo-selectable-button': SelectableButton
	}
}