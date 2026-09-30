import { html, property, css, event, component, live, query, eventListener, state, ifDefined, type PropertyValues } from '@a11d/lit'
import { FieldComponent } from '@3mo/field'
import { ComboboxController, listItems, type ListItem } from '@3mo/list'
import type { FocusMethod } from '@3mo/focus-controller'
import { Popover, PopoverFloatingUiPositionController, type PopoverAlignment, type PopoverPlacement } from '@3mo/popover'
import { Selectability } from '@3mo/selectability'
import { FieldSelectValueController, type Data, type Index, type Value } from './SelectValueController.js'
import { Option } from './Option.js'
import { textEquals, textMatches } from './matchText.js'
import '@3mo/localization'

/**
 * A field that selects one or more of its options from a dropdown menu, which typing can search.
 *
 * @element mo-field-select
 *
 * @attr default - The text of a first menu item that clears the selection.
 * @attr reflectDefault - Whether the input shows the `default` text while nothing is selected.
 * @attr dense - Whether the field is dense.
 * @attr open - Whether the menu is open.
 * @attr multiple - Whether multiple options can be selected.
 * @attr searchable - Whether typing filters the options to those holding every word typed, the first of which Enter takes.
 * @attr freeInput - Whether typed text is kept as the value, on Enter or as focus leaves, unless it is an option's text, which selects that option.
 * @attr value - The selected value, or an array of them when `multiple`.
 * @attr index - The selected index.
 * @attr data - The selected data.
 * @attr menuAlignment - Menu popover alignment
 * @attr menuPlacement - Menu popover placement
 *
 * @slot - The select options.
 *
 * @csspart input - The input element.
 * @csspart dropDownIcon - The dropdown icon.
 * @csspart menu - The popover holding the options.
 * @csspart list - The listbox of options.
 *
 * @i18n "No results"
 * @i18n "No options"
 *
 * @fires change - The selected value, or an array of them when `multiple`, or the text kept by `freeInput`.
 * @fires input - The input's text, as typed or as it shows the selection.
 * @fires dataChange - The selected option's data, or an array of them when `multiple`.
 * @fires indexChange - The selected option's position, or an array of them when `multiple`.
 *
 * @accessibility
 * A [combobox](?path=/docs/behaviors-combobox--overview) over a listbox of its options: the input and the listbox are named after the `label`, and a `searchable` field adds `aria-autocomplete='list'`. Focus stays in the input while the keys move through the options; a field that cannot be typed in moves to the option whose text starts with the letters typed. When no option shows, the menu says why in a `status` region, which screen readers announce.
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
	@query('mo-popover') readonly popoverElement?: Popover

	override get isPopulated() {
		const hasDefaultOptionAndReflectsDefault = !!this.default && this.reflectDefault
		return this.hasValue || hasDefaultOptionAndReflectsDefault
	}

	/** A value, a selected option that has none, or text typed into a free input. */
	private get hasValue() {
		const valueNotNullOrEmpty = ['', undefined, null].includes(this.value as any) === false
			&& (!this.multiple || (this.value instanceof Array && this.value.length > 0))
		return valueNotNullOrEmpty
			|| this.valueController.selection.some(option => option.normalizedValue === undefined)
			|| (this.freeInput && !!this.searchString?.trim())
	}

	private get interactive() {
		return !this.disabled && !this.readonly
	}

	protected override get isDense() {
		return this.dense
	}

	private _listItems = new Array<ListItem>()
	get listItems() { return this._listItems }
	get options() { return this.listItems.filter(i => i instanceof Option) as Array<Option<T>> }
	get selectedOptions() { return this.options.filter(o => o.selected) }

	protected readonly valueController = new FieldSelectValueController<T>(this)

	/** Only options are selected; other list items are actions. */
	protected readonly combobox = new ComboboxController<HTMLElement>(this, host => {
		const field = host as FieldSelect<unknown>
		return {
			get expanded() { return field.open },
			handleExpandedChange: open => {
				if (!open || field.interactive) {
					field.open = open
				}
			},
			get autocomplete() { return field.searchable },
			get items() { return field.listItems },
			get selectability() { return field.multiple ? Selectability.Multiple : Selectability.Single },
			isSelectable: item => item instanceof Option,
			get selection() { return field.valueController.selection as ReadonlyArray<HTMLElement> },
			handleChange: selection => field.handleSelection(selection.map(item => field.listItems.indexOf(item as ListItem))),
		}
	})

	protected override get isActive() {
		return super.isActive || this.open
	}

	protected override willUpdate(props: PropertyValues<this>) {
		super.willUpdate(props)
		if (props.get('open') === true && !this.open) {
			this.resetSearch()
		}
	}

	protected override updated(props: PropertyValues) {
		super.updated(props)
		this.collectListItems()
		this.activateFirstMatch()
	}

	protected override async firstUpdated(props: PropertyValues) {
		super.firstUpdated(props)
		const popover = this.popoverElement
		if (popover?.positionController instanceof PopoverFloatingUiPositionController) {
			popover.positionController.addMiddleware((await import('./closeWhenOutOfViewport.js')).closeWhenOutOfViewport())
			popover.positionController.addMiddleware((await import('./sameInlineSize.js')).sameInlineSize())
		}
	}

	/** Slotted or rendered by a subclass, so read off the listbox after every change. */
	private collectListItems() {
		const listbox = this.combobox.listbox.value
		const items = !listbox ? [] : [...listbox.children].flatMap(child => child[listItems] ?? []) as Array<ListItem>
		if (items.length !== this._listItems.length || items.some((item, index) => item !== this._listItems[index])) {
			this._listItems = items
			this.handleItemsChange()
		}
	}

	/** An option searched away is hidden rather than disabled, so the option's own `disabled` survives the search. */
	private updateListItems() {
		this.combobox.indexability.setItems(this.listItems, (item, index) => ({ index, data: item, disabled: item.disabled || item.hasAttribute('data-search-no-match') }))
	}

	private activated?: { readonly keyword: string, readonly option: Option<T> }

	/** Once text is typed, the first option it matches is the active one, so Enter takes it. */
	private activateFirstMatch() {
		const option = this.open && !this.freeInput && this.hasSearchInput
			? this.options.find(option => !option.disabled && !option.hasAttribute('data-search-no-match'))
			: undefined
		if (!option) {
			this.activated = undefined
		} else if ((option !== this.activated?.option || this.searchKeyword !== this.activated.keyword) && option.checkVisibility()) {
			this.activated = { keyword: this.searchKeyword, option }
			this.combobox.goTo(option)
		}
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
				text-overflow: ellipsis;
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

			mo-popover {
				position-visibility: anchors-visible;
				background: var(--mo-color-background);
				border-radius: var(--mo-border-radius);
				font-size: 0.875rem;
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

			mo-list-item[data-search-no-match], mo-list-item[data-search-no-match] + mo-line {
				display: none;
			}

			#hint {
				padding: 10px;
				color: var(--mo-color-gray);
				grid-column: var(--_grid-column-full-span-in-case);

				&:empty {
					display: none;
				}
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
		return this.searching && !!this.searchString?.trim() && this.valueToInputValue(this.value) !== this.searchString
	}

	protected override get inputTemplate() {
		return html`
			<input
				part='input'
				id=${this.searching ? 'search' : 'value'}
				type='text'
				autocomplete='off'
				aria-label=${ifDefined(this.label || undefined)}
				title=${ifDefined(this.multiple ? this.valueToInputValue(this.value) || undefined : undefined)}
				${this.combobox.input.ref()}
				?readonly=${!this.searching || !this.searchable || this.readonly}
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
			this.handleSelection([])
			this.searchInputElement?.focus()
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
			<mo-popover part='menu'
				target='field'
				.anchor=${this}
				alignment=${ifDefined(this.menuAlignment)}
				placement=${ifDefined(this.menuPlacement)}
				.shouldOpen=${this.shouldOpen}
				?open=${this.open}
				@openChange=${(e: CustomEvent<boolean>) => this.handleOpenChange(e.detail)}
			>
				${this.hintTemplate}
				<div id='listbox' part='list' aria-label=${ifDefined(this.label || undefined)}
					${this.combobox.listbox.ref()}
					@slotchange=${() => this.collectListItems()}
				>
					${this.defaultOptionTemplate}
					${this.optionsTemplate}
				</div>
			</mo-popover>
		`
	}

	private readonly shouldOpen = (e: Event) => this.interactive && Popover.shouldOpen.call({ anchor: this, target: 'field' }, e)

	/** The popover shows its options only now, which is when one of them can become the active one. */
	private handleOpenChange(open: boolean) {
		this.open = open
		this.activateFirstMatch()
	}

	protected get optionsTemplate() {
		return html`
			<slot></slot>
		`
	}

	/** What the menu says while it shows no option: that none matches what was typed, or that there are none. */
	protected get hint(): string | undefined {
		if (this.freeInput || this.options.some(option => !option.hasAttribute('data-search-no-match'))) {
			return undefined
		}
		return this.hasSearchInput ? t('No results') : this.listItems.length === 0 ? t('No options') : undefined
	}

	protected get hintTemplate() {
		return html`<div id='hint' role='status'>${this.hint ?? html.nothing}</div>`
	}

	protected get defaultOptionTemplate() {
		return !this.default ? html.nothing : html`
			<mo-list-item value='' ?data-search-no-match=${this.hasSearchInput && !textMatches(this.default, this.searchKeyword)} @click=${() => this.handleSelection([])}>
				${this.default}
			</mo-list-item>
			<mo-line role='presentation'></mo-line>
		`
	}

	@eventListener('requestSelectValueUpdate')
	protected handleOptionRequestValueSync(e: Event) {
		e.stopPropagation()
		this.valueController.requestSync()
	}

	/** The text of the value as last shown, so a free input takes a new value's text but keeps what is typed while only the options change. */
	private valueText?: string

	requestValueUpdate() {
		this.options.forEach(o => o.selected = this.valueController.isSelected(o))
		const text = this.valueToInputValue(this.value) || undefined
		if (this.freeInput && text !== this.valueText) {
			this.searchString = text
		} else {
			this.searchString ??= text
		}
		this.valueText = text
		this.requestUpdate()
	}

	protected valueToInputValue(value: Value) {
		const selection = this.valueController.selection
		const text = selection.map(o => o.text).join(', ')
		const freeText = this.freeInput && !this.multiple && !selection.length && value !== undefined && !(value instanceof Array) ? String(value) : ''
		const empty = value === undefined || (value instanceof Array && value.length === 0)
		return text || freeText || (empty && this.reflectDefault ? this.default ?? '' : '')
	}

	protected override async handleFocus(bubbled: boolean, method: FocusMethod) {
		super.handleFocus(bubbled, method)
		await this.updateComplete
		this.searchInputElement?.focus()
		this.searchInputElement?.select()
	}

	protected override handleBlur(bubbled: boolean, method: FocusMethod) {
		super.handleBlur(bubbled, method)
		this.commitText()
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
		if (!this.multiple) {
			this.open = false
		}
		super.handleInput(this.valueToInputValue(this.value))
		// Several are picked from one search, which stands until the menu closes.
		if (!this.multiple || !this.open || !this.hasSearchInput) {
			this.searchString = this.valueToInputValue(this.value)
			this.resetSearch()
		}
	}

	/** Keeps a free input's text as the value, or selects the option whose text it is. Returns whether there was text to commit. */
	private commitText() {
		const text = this.searchString ?? ''
		if (!this.freeInput || this.multiple || text === this.valueToInputValue(this.value) || (!text && this.value === undefined)) {
			return false
		}
		const option = this.options.find(option => textEquals(option.text, text))
		if (option && this.valueController.isSelected(option)) {
			this.searchString = this.valueToInputValue(this.value)
		} else if (option?.index !== undefined) {
			this.handleSelection([option.index])
		} else {
			this.valueController.selectText(text || undefined)
			this.change.dispatch(this.value)
			this.dataChange.dispatch(this.data)
			this.indexChange.dispatch(this.index)
		}
		return true
	}

	/**
	 * After the listbox has had its say: Enter commits a free input's text, and Escape with the menu closed takes back what was typed.
	 * Enter with nothing to commit or close is left to the popover, which opens the menu on it.
	 */
	@eventListener('keydown')
	protected handleKeyDown(event: KeyboardEvent) {
		if (event.defaultPrevented || !this.freeInput || this.multiple || event.composedPath()[0] !== this.combobox.input.value) {
			return
		}
		if (event.key === 'Enter') {
			if (this.commitText() || this.open) {
				event.preventDefault()
				this.open = false
			}
		} else if (event.key === 'Escape' && !this.open && (this.searchString ?? '') !== this.valueToInputValue(this.value)) {
			event.preventDefault()
			this.searchString = this.valueToInputValue(this.value)
		}
	}

	protected handleItemsChange() {
		for (const option of this.options) {
			option.index = this.listItems.indexOf(option)
			option.multiple = this.multiple
		}
		this.updateListItems()
		this.valueController.handleItemsChange()
	}

	private customValidity = ''

	override setCustomValidity(error: string) {
		this.customValidity = error
	}

	override async checkValidity() {
		await this.updateComplete
		return !this.customValidity && (!this.required || this.hasValue)
	}

	override reportValidity() {
		this.combobox.input.value?.focus()
	}

	protected get searchKeyword() {
		return this.searchString?.trim() || ''
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
		for (const option of this.options) {
			option.toggleAttribute('data-search-no-match', !option.textMatches(this.searchKeyword))
		}
		this.updateListItems()
		return Promise.resolve()
	}

	protected resetSearch() {
		if (!this.freeInput) {
			this.searchString = this.valueToInputValue(this.value)
		}
		for (const option of this.options) {
			option.removeAttribute('data-search-no-match')
		}
		this.updateListItems()
	}
}

declare global {
	interface HTMLElementTagNameMap {
		'mo-field-select': FieldSelect<unknown>
	}
}