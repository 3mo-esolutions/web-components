import { html, property, css, event, component, style, live, PropertyValues, query, nothing } from '@a11d/lit'
import { InputFieldComponent } from '@3mo/field'
import { Menu } from '@3mo/menu'
import { Option } from './Option.js'
import { Data, FieldSelectValueController, Index, Value } from './SelectValueController.js'

/**
 * @element mo-field-select
 *
 * @attr default - The default value.
 * @attr reflectDefault - Whether the default value should be reflected to the attribute.
 * @attr multiple - Whether multiple options can be selected.
 * @attr searchable - Whether the options should be searchable.
 * @attr value - Whether the options should be searchable.
 * @attr index - Whether the options should be searchable.
 * @attr data - Whether the options should be searchable.
 *
 * @slot - The select options.
 *
 * @fires dataChange {CustomEvent<Data<T>>}
 * @fires indexChange {CustomEvent<Index>}
 */
@component('mo-field-select')
export class FieldSelect<T> extends InputFieldComponent<Value> {
	@event() readonly dataChange!: EventDispatcher<Data<T>>
	@event() readonly indexChange!: EventDispatcher<Index>

	@property() default?: string
	@property({ type: Boolean }) reflectDefault = false
	@property({ type: Boolean }) multiple = false
	@property({ type: Boolean }) searchable = false
	@property({ type: Boolean, reflect: true }) open = false
	@property({ type: Object })
	get value() { return this.valueController.value }
	set value(value) { this.valueController.value = value }
	@property({ type: Array })
	get index() { return this.valueController.index }
	set index(value) { this.valueController.index = value }
	@property({ type: Array })
	get data() { return this.valueController.data }
	set data(value) { this.valueController.data = value }

	@query('mo-menu') readonly menu?: Menu

	get listItems() { return (this.menu?.list?.items ?? []) }
	get options() { return this.listItems.filter(i => i instanceof Option) as Array<Option<T>> }
	get selectedOptions() { return this.options.filter(o => o.selected) }

	protected readonly valueController: FieldSelectValueController<T> = new FieldSelectValueController<T>(this, () => {
		this.requestUpdate()
		this.inputStringValue = this.valueToInputValue(this.value)
	})

	protected override updated(props: PropertyValues<this>) {
		super.updated(props)
		this.options.forEach(o => o.multiple = this.multiple)
	}

	protected override get isActive() {
		return super.isActive || this.open
	}

	static override get styles() {
		return css`
			${super.styles}

			input:hover {
				cursor: pointer;
			}

			mo-icon-button[part=dropDownIcon] {
				display: flex;
				align-items: center;
				color: var(--mo-color-gray);
			}

			:host([open]) mo-icon-button[part=dropDownIcon], :host([active]) mo-icon-button[part=dropDownIcon] {
				color: var(--mo-color-accent);
			}

			mo-menu::part(popover) {
				background: var(--mo-color-background);
				max-height: 300px;
				overflow-y: auto;
				scrollbar-width: thin;
				color: var(--mo-color-foreground);
			}

			slot:not([name]) {
				display: flex;
				flex-direction: column;
				align-items: stretch;
			}

			mo-option, ::slotted(mo-option) {
				transform: scaleY(1);
				transition: 0.2s ease-in-out;
				height: 36px;
				opacity: 1;
				min-width: var(--mo-field-width);
			}

			mo-option[data-search-no-match], ::slotted(mo-option[data-search-no-match]) {
				transform: scaleY(0);
				opacity: 0;
				height: 0px;
				pointer-events: none;
			}
		`
	}

	protected override get inputTemplate() {
		return html`
			<input
				part='input'
				type='text'
				autocomplete='off'
				?readonly=${!this.searchable}
				?disabled=${this.disabled}
				.value=${live(this.inputStringValue || '')}
				@input=${(e: Event) => this.handleInput((e.target as HTMLInputElement).value, e)}
			>
		`
	}

	protected override get endSlotTemplate() {
		this.style.setProperty('--mo-field-width', this.offsetWidth + 'px')
		return html`
			${super.endSlotTemplate}

			<mo-icon-button tabindex='-1' slot='end'
				part='dropDownIcon'
				dense
				icon='expand_more'
				${style({ color: 'var(--mo-color-gray)' })}
			></mo-icon-button>

			<mo-menu tabindex='-1' slot='end'
				selectionMode=${this.multiple ? 'multiple' : 'single'}
				.anchor=${this}
				?open=${this.open}
				@openChange=${(e: CustomEvent<boolean>) => this.open = e.detail}
				.value=${this.valueController.menuValue}
				@change=${(e: CustomEvent<Array<number>>) => this.handleSelection(e.detail)}
			>${this.optionsTemplate}</mo-menu>
		`
	}

	protected get optionsTemplate() {
		return html`
			${!this.default ? nothing : html`
				<mo-list-item value='' @click=${() => this.handleSelection([])}>${this.default}</mo-list-item>
			`}
			<slot></slot>
		`
	}

	protected valueToInputValue(value: Value) {
		const valueArray = value instanceof Array ? value : value === undefined ? undefined : [value]
		return !valueArray || valueArray.length === 0
			? this.reflectDefault ? this.default ?? '' : ''
			: this.options
				.filter(o => valueArray.some(v => o.valueMatches(v)))
				.map(o => o.text).join(', ')
	}

	protected override handleFocus() {
		super.handleFocus()
		this.inputElement.setSelectionRange(0, 0)
		if (this.searchable) {
			this.select()
		}
	}

	protected override handleInput(v: Value, e: Event) {
		super.handleInput(v, e)
		if (this.searchable) {
			this.searchOptions()
		}
	}

	protected handleSelection(menuValue: Array<number>) {
		this.valueController.menuValue = menuValue
		this.change.dispatch(this.value)
		this.dataChange.dispatch(this.data)
		this.indexChange.dispatch(this.index)
		if (!this.multiple) {
			this.open = false
		}
	}

	protected get searchKeyword() {
		return this.inputElement.value.toLowerCase().trim()
	}

	private async searchOptions() {
		await this.search()
		await this.updateComplete
		this.open = this.options.length > 0
	}

	protected search() {
		const matchedValues = this.options
			.filter(option => option.textMatches(this.searchKeyword))
			.map(option => option.normalizedValue)
		for (const option of this.options) {
			const matches = matchedValues.some(v => option.valueMatches(v))
			if (matches) {
				option.removeAttribute('data-search-no-match')
			} else {
				option.setAttribute('data-search-no-match', '')
			}
			option.disabled = !matches
		}
		return Promise.resolve()
	}
}

declare global {
	interface HTMLElementTagNameMap {
		'mo-field-select': FieldSelect<unknown>
	}
}