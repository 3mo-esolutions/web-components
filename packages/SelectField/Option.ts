import { component, property, css, html, nothing, eventListener } from '@a11d/lit'
import { SelectionListItem } from '@3mo/list'

@component('mo-option')
export class Option<T> extends SelectionListItem {
	override readonly role = 'option'

	@property({ type: Boolean, reflect: true }) selected = false

	@property() value?: string
	@property({ type: Object }) data?: T
	@property({ type: Boolean, reflect: true }) multiple = false
	@property() inputText?: string

	@property({ type: Number, reflect: true }) index?: number

	dataMatches(data: T | undefined) {
		return JSON.stringify(this.data) === JSON.stringify(data)
	}

	get normalizedValue() {
		return this.normalizeValue(this.value)
	}

	valueMatches(value: string | number | undefined) {
		return this.normalizedValue === this.normalizeValue(value)
	}

	private normalizeValue(value: string | number | undefined) {
		return typeof value === 'number'
			? value
			: isNaN(Number(value))
				? value
				: Number(value)
	}

	get text() {
		return this.inputText ?? this.textContent?.trim() ?? ''
	}

	textMatches(text: string) {
		return this.text.toLowerCase().includes(text.toLowerCase())
	}

	static override get styles() {
		return css`
			${super.styles}

			:host {
				cursor: pointer;
			}

			:host([focused]) {
				background-color: var(--mo-color-transparent-gray);
			}

			:host([selected]) {
				background-color: var(--mo-color-accent-transparent);
			}
		`
	}

	override get template() {
		return html`
			${super.template}
			${this.checkboxTemplate}
		`
	}

	protected get checkboxTemplate() {
		return !this.multiple ? nothing : html`
			<mo-checkbox tabindex='-1'
				?checked=${this.selected}
				@click=${(e: MouseEvent) => e.stopImmediatePropagation()}
				@change=${(e: CustomEvent<CheckboxValue>) => this.handleChange(e.detail)}
			></mo-checkbox>
		`
	}

	@eventListener('click')
	protected handleClick() {
		this.handleChange(this.selected ? 'unchecked' : 'checked')
	}

	protected handleChange(value: CheckboxValue) {
		this.selected = value === 'checked'
		this.change.dispatch(this.selected)
	}
}

declare global {
	interface HTMLElementTagNameMap {
		'mo-option': Option<unknown>
	}
}