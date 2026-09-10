import { html, property, css, event, component, live, query, eventListener, state, ifDefined, type PropertyValues } from '@a11d/lit'
import { FieldComponent } from '@3mo/field'
import type { ListItem } from '@3mo/list'
import type { Menu } from '@3mo/menu'
import type { FocusMethod } from '@3mo/focus-controller'
import { PopoverFloatingUiPositionController, type PopoverAlignment, type PopoverPlacement } from '@3mo/popover'
import { FieldSelectValueController, type Data, type Index, type Value } from './SelectValueController.js'
import { Option } from './Option.js'

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
 * @attr menuAlignment - Menu popover alignment
 * @attr menuPlacement - Menu popover placement
 *
 * @slot - The select options.
 *
 * @csspart input - The input element.
 * @csspart dropDownIcon - The dropdown icon.
 * @csspart menu - The menu consisting of list of options.
 * @csspart list - The list of options.
 *
 * @i18n "No results"
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
	@property({ type: Boolean, reflect: true, updated(this: FieldSelect<T>) { this.handleItemsChange() } }) multiple = false
	@property({ type: Boolean }) searchable = false
	@property({ type: Boolean }) freeInput = false
	@property() menuAlignment?: PopoverAlignment
	@property() menuPlacement?: PopoverPlacement
	@property({ type: Boolean, reflect: true }) open = false
	@property({ type: String, bindingDefault: true, updated(this: FieldSelect<T>) { this.valueController.accept('value') } }) value: Value
	@property({ type: Number, updated(this: FieldSelect<T>) { this.valueController.accept('index') } }) index: Index
	@property({ type: Object, updated(this: FieldSelect<T>) { this.valueController.accept('data') } }) data: Data<T>

	@state() protected searchString?: string

	@query('input#value') readonly valueInputElement!: HTMLInputElement
	@query('input#search') readonly searchInputElement?: HTMLInputElement
	@query('mo-menu') readonly menu?: Menu

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

	get listItems() { return (this.menu?.list?.items ?? []) as Array<ListItem> }
	get options() { return this.listItems.filter(i => i instanceof Option) as Array<Option<T>> }
	get selectedOptions() { return this.options.filter(o => o.selected) }

	protected readonly valueController = new FieldSelectValueController<T>(this)

	protected override get isActive() {
		return super.isActive || this.open
	}

	protected get showNoOptionsHint() {
		return this.searchable && !this.freeInput && !!this.searchString && !this.default &&
			!this.options.filter(o => !o.hasAttribute('data-search-no-match')).length
	}

	protected override updated(props: PropertyValues) {
		super.updated(props)
		this.toggleAttribute('data-show-no-options-hint', this.showNoOptionsHint)
	}

	protected override firstUpdated(props: PropertyValues) {
		super.firstUpdated(props)
		this.menu?.updateComplete.then(async () => {
			const popover = this.menu?.renderRoot.querySelector('mo-popover')
			if (popover?.positionController instanceof PopoverFloatingUiPositionController) {
				popover.positionController.addMiddleware((await import('./closeWhenOutOfViewport.js')).closeWhenOutOfViewport())
				popover.positionController.addMiddleware((await import('./sameInlineSize.js')).sameInlineSize())
			}
		})
	}

	static override get styles() {
		return css`
			${super.styles}

			:host {
				display: flex;
				flex-flow: column;
				--_grid-column-full-span-in-case: 1 / -1;
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
				position-visibility: anchors-visible;
				background: var(--mo-color-background);
				max-height: 300px;
				overflow-y: auto;
				scrollbar-width: thin;
				color: var(--mo-color-foreground);
				min-width: var(--_popover-min-width, anchor-size(inline));
			}

			mo-list-item {
				min-height: 40px;
				grid-column: var(--_grid-column-full-span-in-case);
			}

			mo-line {
				grid-column: var(--_grid-column-full-span-in-case);
			}

			#no-options-hint {
				display: none;
				padding: 10px;
				color: var(--mo-color-gray);
				grid-column: var(--_grid-column-full-span-in-case);
			}

			:host([data-show-no-options-hint]) #no-options-hint {
				display: block;
			}
		`
	}

	protected override get template() {
		return html`
			${super.template}
			${this.menuTemplate}
		`
	}

	protected get searching() {
		return this.freeInput || (this.searchable && this.focusController.focused)
	}

	protected get hasSearchInput() {
		return !!this.searchString?.trim() && this.valueToInputValue(this.value) !== this.searchString
	}

	protected override get inputTemplate() {
		return html`
			<input
				part='input'
				id=${this.searching ? 'search' : 'value'}
				type='text'
				autocomplete='off'
				?readonly=${!this.searching || !this.searchable}
				?disabled=${this.disabled}
				.value=${live(this.searching ? this.searchString || '' : this.valueToInputValue(this.value) || '')}
				@mousedown=${(e: MouseEvent) => this.handleInputMouseDown(e)}
				@input=${(e: Event) => { this.handleInput((e.target as HTMLInputElement).value, e) }}
			>
		`
	}

	// Focusing turns this input into the search one and selects all of it. The browser places a caret on
	// mouse-up, after that, so a press which is only meant to reach the field would undo the selection.
	private handleInputMouseDown(e: MouseEvent) {
		if (this.searchable && !this.searching) {
			e.preventDefault()
			const input = e.target as HTMLInputElement
			input.focus()
		}
	}

	protected override get endSlotTemplate() {
		return html`
			${this.clearIconButtonTemplate}
			${super.endSlotTemplate}
			<mo-icon slot='end' part='dropDownIcon' icon='unfold_more'></mo-icon>
		`
	}

	private get clearIconButtonTemplate() {
		const clear = () => {
			this.resetSearch()
			this.searchInputElement?.focus()
			this.searchInputElement?.select()
		}
		return !this.searching || !this.hasSearchInput ? html.nothing : html`
			<mo-icon-button tabindex='-1' dense slot='end' icon='cancel'
				style='color: var(--mo-color-gray)'
				@click=${() => clear()}
			></mo-icon-button>
		`
	}

	protected get menuTemplate() {
		return html`
			<mo-menu part='menu' exportparts='list'
				target='field'
				selectability=${this.multiple ? 'multiple' : 'single'}
				.anchor=${this}
				alignment=${ifDefined(this.menuAlignment)}
				placement=${ifDefined(this.menuPlacement)}
				?disabled=${this.disabled}
				?open=${this.open}
				@openChange=${(e: CustomEvent<boolean>) => this.open = e.detail}
				.value=${this.valueController.menuValue}
				@change=${(e: CustomEvent<Array<number>>) => this.handleSelection(e.detail)}
				@itemsChange=${() => this.handleItemsChange()}
			>
				${this.noResultsOptionTemplate}
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

	protected get noResultsOptionTemplate() {
		return html`
			<div id='no-options-hint'>${t('No results')}</div>
		`
	}

	protected get defaultOptionTemplate() {
		return !this.default ? html.nothing : html`
			<mo-list-item value='' @click=${() => this.handleSelection([])}>
				${this.default}
			</mo-list-item>
			<mo-line></mo-line>
		`
	}

	@eventListener('requestSelectValueUpdate')
	protected handleOptionRequestValueSync(e: Event) {
		e.stopPropagation()
		this.valueController.requestSync()
	}

	requestValueUpdate() {
		this.options.forEach(o => o.selected = this.valueController.isSelected(o))
		this.searchString ??= this.valueToInputValue(this.value) || undefined
	}

	protected valueToInputValue(value: Value) {
		const text = this.valueController.selection.map(o => o.text).join(', ')
		const empty = value === undefined || (value instanceof Array && value.length === 0)
		return text || (empty && this.reflectDefault ? this.default ?? '' : '')
	}

	protected override async handleFocus(bubbled: boolean, method: FocusMethod) {
		super.handleFocus(bubbled, method)
		await this.updateComplete
		this.searchInputElement?.focus()
		this.searchInputElement?.select()
	}

	protected override handleBlur(bubbled: boolean, method: FocusMethod) {
		super.handleBlur(bubbled, method)
		this.resetSearch()
		if (method !== 'pointer' && !this.searchable) {
			this.open = false
		}
	}

	protected handleSelection(menuValue: Array<number>) {
		this.valueController.selectFromMenu(menuValue)
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
		this.valueController.handleItemsChange()
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