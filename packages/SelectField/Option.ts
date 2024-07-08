import { component, property, css, html, eventListener, event } from '@a11d/lit'
import { SelectionListItem } from '@3mo/list'

@component('mo-option')
export class Option<T> extends SelectionListItem {
	@event({ bubbles: true, cancelable: true, composed: true }) readonly requestSelectValueUpdate!: EventDispatcher<void>

	override readonly role = 'option'

	@property({ type: Boolean, reflect: true }) selected = false

	@property({ type: Number, reflect: true, updated(this: Option<T>) { this.requestSelectValueUpdate.dispatch() } }) index?: number
	@property({ updated(this: Option<T>) { this.requestSelectValueUpdate.dispatch() } }) value?: string
	@property({ type: Object, updated(this: Option<T>) { this.requestSelectValueUpdate.dispatch() } }) data?: T
	@property({ type: Boolean, reflect: true }) multiple = false
	@property() inputText?: string

	override readonly preventClickOnSpace = true

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
		return [this.textContent, this.inputText]
			.map(text => text?.replaceAll(/\s+/g, '').toLowerCase())
			.filter(Boolean)
			.some(keyword => keyword!.includes(text.toLowerCase()))
	}

	static override get styles() {
		return css`
			${super.styles}

			:host {
				cursor: pointer;
				min-height: 36px;
				min-width: var(--mo-field-width);
			}

			:host([focused]) {
				background-color: var(--mo-color-transparent-gray);
			}

			:host([selected]) {
				background-color: var(--mo-color-accent-transparent);
			}

			:host([data-search-no-match]) {
				display: none;
				pointer-events: none;
			}

			mo-checkbox {
				height: fit-content;
			}
		`
	}

	protected override get template() {
		return html`
			${super.template}
			${this.checkboxTemplate}
		`
	}

	protected get checkboxTemplate() {
		return !this.multiple ? html.nothing : html`
			<mo-checkbox tabindex='-1'
				?selected=${this.selected}
				@click=${(e: MouseEvent) => e.stopImmediatePropagation()}
				@change=${(e: CustomEvent<boolean>) => this.handleChange(e.detail)}
			></mo-checkbox>
		`
	}

	@eventListener('click')
	protected handleClick() {
		this.handleChange(!this.multiple || !this.selected)
	}

	protected handleChange(value: boolean) {
		this.selected = value
		this.change.dispatch(value)
	}
}

declare global {
	interface HTMLElementTagNameMap {
		'mo-option': Option<unknown>
	}
}