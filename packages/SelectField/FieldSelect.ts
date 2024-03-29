import { html, property, css, event, component, live, query, eventListener, state, ifDefined } from '@a11d/lit'
import { FieldComponent } from '@3mo/field'
import type { ListItem } from '@3mo/list'
import type { Menu } from '@3mo/menu'
import type { FocusMethod } from '@3mo/focus-controller'
import { PopoverAlignment } from '@3mo/popover'
import { Option } from './Option.js'
import { Data, FieldSelectValueController, Index, Value } from './SelectValueController.js'

/**
 * @element mo-field-select
 *
 * @attr default - The default value.
 * @attr reflectDefault - Whether the default value should be reflected to the attribute.
 * @attr multiple - Whether multiple options can be selected.
 * @attr searchable - Whether the options should be searchable.
 * @attr freeInput - Whether the user can input values that are not in the options.
 * @attr value - The selected value.
 * @attr index - The selected index.
 * @attr data - The selected data.
 * @attr alignment - Popover alignment
 *
 * @slot - The select options.
 *
 * @csspart input - The input element.
 * @csspart dropDownIcon - The dropdown icon.
 *
 * @fires change
 * @fires input
 * @fires dataChange
 * @fires indexChange
 */
@component('mo-field-select')
export class FieldSelect<T> extends FieldComponent<Value> {
	@event() readonly dataChange!: EventDispatcher<Data<T>>
	@event() readonly indexChange!: EventDispatcher<Index>

	@property() default?: string
	@property({ type: Boolean }) dense = false
	@property({ type: Boolean }) reflectDefault = false
	@property({ type: Boolean }) multiple = false
	@property({ type: Boolean }) searchable = false
	@property({ type: Boolean }) freeInput = false
	@property() menuAlignment?: PopoverAlignment
	@property({ type: Boolean, reflect: true }) open = false
	@property({ type: String, bindingDefault: true, updated(this: FieldSelect<T>) { this.valueController.value = this.value } }) value: Value
	@property({ type: Number, updated(this: FieldSelect<T>) { this.valueController.index = this.index } }) index: Index
	@property({ type: Object, updated(this: FieldSelect<T>) { this.valueController.data = this.data } }) data: Data<T>

	@state({
		updated(this: FieldSelect<T>, value: number, oldValue: number) {
			if (value && value !== oldValue) {
				this.valueController.sync()
				this.requestValueUpdate()
			}
		}
	}) protected [FieldSelectValueController.requestSyncKey] = 0

	@state() protected searchString?: string

	@query('input#value') readonly valueInputElement!: HTMLInputElement
	@query('input#search') readonly searchInputElement?: HTMLInputElement

	override get isPopulated() {
		const valueNotNullOrEmpty = ['', undefined, null].includes(this.value as any) === false
			&& (!this.multiple || (this.value instanceof Array && this.value.length > 0))
		const hasDefaultOptionAndReflectsDefault = !!this.default && this.reflectDefault
		const hasInputValueInFreeInputMode = this.freeInput && !!this.searchString?.trim()
		return valueNotNullOrEmpty || hasDefaultOptionAndReflectsDefault || hasInputValueInFreeInputMode
	}

	protected override get isDense() {
		return this.dense
	}

	@query('mo-menu') readonly menu?: Menu

	get listItems() { return (this.menu?.list?.items ?? []) as Array<ListItem> }
	get options() { return this.listItems.filter(i => i instanceof Option) as Array<Option<T>> }
	get selectedOptions() { return this.options.filter(o => o.selected) }

	protected readonly valueController = new FieldSelectValueController<T>(this)

	protected override get isActive() {
		return super.isActive || this.open
	}

	static override get styles() {
		return css`
			${super.styles}

			:host {
				display: flex;
				flex-flow: column;
			}

			input {
				cursor: pointer;
			}

			mo-icon[part=dropDownIcon] {
				font-size: 20px;
				color: var(--mo-color-gray);
				user-select: none;
				margin-inline-end: -4px;
				cursor: pointer;
			}

			mo-field[active] mo-icon[part=dropDownIcon] {
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

	protected override get template() {
		return html`
			${super.template}
			${this.menuTemplate}
		`
	}

	protected override get inputTemplate() {
		if (this.freeInput) {
			return this.searchInputTemplate
		}

		if (this.searchable && this.focusController.focused) {
			return this.searchInputTemplate
		}

		return this.valueInputTemplate
	}

	private get valueInputTemplate() {
		return html`
			<input
				part='input'
				id='value'
				type='text'
				autocomplete='off'
				readonly
				value=${this.valueToInputValue(this.value) || ''}
			>
		`
	}

	private get searchInputTemplate() {
		return html`
			<input
				part='input'
				id='search'
				type='text'
				autocomplete='off'
				?readonly=${!this.searchable}
				?disabled=${this.disabled}
				.value=${live(this.searchString || '')}
				@input=${(e: Event) => { this.handleInput((e.target as HTMLInputElement).value, e) }}
			>
		`
	}

	protected override get endSlotTemplate() {
		this.style.setProperty('--mo-field-width', this.offsetWidth + 'px')
		return html`
			${super.endSlotTemplate}
			<mo-icon slot='end' part='dropDownIcon' icon='expand_more'></mo-icon>
		`
	}

	protected get menuTemplate() {
		return html`
			<mo-menu
				fixed
				target='field'
				selectionMode=${this.multiple ? 'multiple' : 'single'}
				.anchor=${this}
				alignment=${ifDefined(this.menuAlignment)}
				?disabled=${this.disabled}
				?open=${this.open}
				@openChange=${(e: CustomEvent<boolean>) => this.open = e.detail}
				.value=${this.valueController.menuValue}
				@change=${(e: CustomEvent<Array<number>>) => this.handleSelection(e.detail)}
				@itemsChange=${() => this.handleItemsChange()}
			>
				${this.defaultOptionTemplate}
				${this.optionsTemplate}
			</mo-menu>
		`
	}

	protected get optionsTemplate() {
		return html`
			<slot></slot>
		`
	}

	protected get defaultOptionTemplate() {
		return !this.default ? html.nothing : html`
			<mo-list-item value='' @click=${() => this.handleSelection([])}>
				${this.default}
			</mo-list-item>
		`
	}

	@eventListener('requestSelectValueUpdate')
	protected handleOptionRequestValueSync(e: Event) {
		e.stopPropagation()
		this.valueController.requestSync()
	}

	requestValueUpdate() {
		this.options.forEach(o => o.selected = o.index !== undefined && this.valueController.menuValue.includes(o.index))
	}

	protected valueToInputValue(value: Value) {
		const valueArray = value instanceof Array ? value : value === undefined ? undefined : [value]
		return !valueArray || valueArray.length === 0
			? this.reflectDefault ? this.default ?? '' : ''
			: this.options
				.filter(o => valueArray.some(v => o.valueMatches(v)))
				.map(o => o.text).join(', ')
	}

	protected override async handleFocus(bubbled: boolean, method: FocusMethod) {
		super.handleFocus(bubbled, method)
		if (method === 'pointer') {
			this.open = true
		}
		await this.updateComplete
		this.searchInputElement?.setSelectionRange(0, this.searchString?.length ?? 0)
		this.searchInputElement?.focus()
	}

	protected override handleBlur(bubbled: boolean, method: FocusMethod) {
		super.handleBlur(bubbled, method)
		this.resetSearch()
		if (method !== 'pointer' && !this.searchable) {
			this.open = false
		}
	}

	protected handleSelection(menuValue: Array<number>) {
		this.valueController.menuValue = menuValue
		this.change.dispatch(this.value)
		this.dataChange.dispatch(this.data)
		this.indexChange.dispatch(this.index)
		this.handleInput(this.valueToInputValue(this.value))
		this.resetSearch()
		if (!this.multiple) {
			this.open = false
		}
	}

	protected handleItemsChange() {
		for (const option of this.options) {
			option.index = this.listItems.indexOf(option)
			option.multiple = this.multiple
		}
	}

	override setCustomValidity(error: string) { error }

	override async checkValidity() {
		await this.updateComplete
		return true
	}

	override reportValidity() { }

	protected get searchKeyword() {
		return this.searchString?.toLowerCase().trim() || ''
	}

	protected override async handleInput(value: Value, e?: Event | undefined) {
		if (this.open === false) {
			this.open = true
		}
		this.searchString = value as string
		super.handleInput(value, e)
		await this.search()
	}

	protected search() {
		const matchedValues = this.options
			.filter(option => option.textMatches(this.searchKeyword))
			.map(option => option.normalizedValue)
		for (const option of this.options) {
			const matches = matchedValues.some(v => option.valueMatches(v))
			option.toggleAttribute('data-search-no-match', !matches)
			option.disabled = !matches
		}
		return Promise.resolve()
	}

	protected resetSearch() {
		if (!this.freeInput) {
			this.searchString = this.valueToInputValue(this.value)
		}
		for (const option of this.options) {
			option.removeAttribute('data-search-no-match')
			option.disabled = false
		}
	}
}

declare global {
	interface HTMLElementTagNameMap {
		'mo-field-select': FieldSelect<unknown>
	}
}