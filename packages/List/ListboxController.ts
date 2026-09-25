import { Controller, ElementRef, eventListener, type ReactiveElement } from '@a11d/lit'
import { IndexabilityController } from '@3mo/indexability'
import { NavigabilityController, type NavigabilityChange } from '@3mo/navigability'
import { Selectability, SelectabilityController, SelectabilityInteraction, type SelectabilityItemOptions } from '@3mo/selectability'
import { SelectionListItemChangeEvent } from './SelectionListItemChangeEvent.js'

export type ListboxOrientation = 'vertical' | 'horizontal'

export interface ListboxControllerOptions<T> {
	/** The owner's full ordered options, rendered or not. Defaults to the rendered options' data, whose indices then run from 0 without gaps. */
	readonly items?: ReadonlyArray<T>
	/** Identity. Defaults to the item itself. */
	readonly key?: (item: T) => unknown
	/** Defaults to single. */
	readonly selectability?: Selectability
	/** An option that is not selectable is still navigable and clickable, as an action among options is. */
	readonly isSelectable?: (item: T) => boolean
	/** The host's own selection. Given, the host owns the state and commits it in `handleChange`. */
	readonly selection?: ReadonlyArray<T>
	readonly handleChange?: (selection: ReadonlyArray<T>) => void
	/** Single selection only: an option the arrow keys reach is selected. Defaults to `false`. */
	readonly selectionFollowsFocus?: boolean
	/** Defaults to `vertical`. */
	readonly orientation?: ListboxOrientation
	/** The arrows run on from the last option to the first and back. */
	readonly wrap?: boolean
	/** The element that keeps focus while the options are browsed, such as a combobox's input. The active option is then announced on it instead of receiving focus. */
	readonly combobox?: HTMLElement
}

/**
 * The ARIA listbox pattern over options declared in a template:
 *
 * ```ts
 * readonly fruits = new ListboxController<Fruit>(this, host => ({
 *   get selection() { return host.selection },
 *   handleChange: selection => host.selection = selection,
 * }))
 * ```
 * ```html
 * <ul ${this.fruits.listbox.ref()}>
 *   <li ${this.fruits.option({ index, data: fruit })}>
 * ```
 *
 * Arrows, Home, End and typeahead move between the options; Space and Enter select. With multiple
 * selection, Shift+Arrow and Shift+Space extend a range, Ctrl+Shift+Home and End select to either end,
 * and Ctrl+A selects everything or, when everything is selected, nothing.
 */
export class ListboxController<T, THost extends ReactiveElement = ReactiveElement> extends Controller {
	/** The listbox itself. Without it, the host is the listbox. */
	readonly listbox = new ElementRef<HTMLElement>({
		updated: () => this.stampListbox(),
	})

	readonly indexability = new IndexabilityController<T, SelectabilityItemOptions<T>>(this.host)

	protected readonly options: ListboxControllerOptions<T>

	private readonly selectability: SelectabilityController<T>
	private readonly navigability: NavigabilityController<T>

	constructor(protected override readonly host: THost, options: ListboxControllerOptions<T> | ((host: THost) => ListboxControllerOptions<T>)) {
		super(host)
		this.options = typeof options === 'function' ? options(host) : options
		const controller = this

		// Observed before selectability exists, so an option has its role by the time the state that role takes is written.
		this.indexability.observe({
			handleItemUpdated: ({ element, options }) => this.stampOption(element, options),
			handleItemRemoved: element => this.forget(element),
		})

		this.selectability = new SelectabilityController<T>(host, {
			get selectability() { return controller.options.selectability ?? Selectability.Single },
			get items() { return controller.items },
			key: item => controller.keyOf(item),
			isSelectable: item => !controller.disabled.has(controller.keyOf(item)) && (controller.options.isSelectable?.(item) ?? true),
			get selection() { return controller.options.selection },
			handleChange: ({ selection }) => controller.options.handleChange?.(selection),
			interaction: SelectabilityInteraction.Manual,
			indexability: this.indexability,
		})

		this.navigability = new NavigabilityController<T>(host, {
			get items() { return controller.items },
			key: item => controller.keyOf(item),
			get focus() { return controller.options.combobox ? 'activedescendant' : 'roving' },
			get orientation() { return controller.options.orientation ?? 'vertical' },
			get wrap() { return controller.options.wrap },
			isNavigable: item => controller.isNavigable(item),
			typeahead: true,
			get keyboardTarget() { return controller.options.combobox ?? controller.listbox.value ?? host },
			handleChange: change => controller.handleCursorChange(change),
			handleKeyDown: event => controller.handleKeyDown(event),
			indexability: this.indexability as unknown as IndexabilityController<T>,
		})
	}

	private renderedItems?: ReadonlyArray<T>
	private readonly disabled = new Set<unknown>()
	private readonly keys = new WeakMap<HTMLElement, unknown>()
	private readonly elements = new Map<unknown, HTMLElement>()
	private entered = false

	/** Registers an option: `<li ${controller.option({ index, data })}>`. */
	get option() { return this.indexability.item }

	/** Makes the option the active one, or leaves none active. */
	goTo(item: T | undefined) {
		if (item === undefined) {
			this.navigability.clear()
		} else {
			this.navigability.goTo(item, { method: 'programmatic' })
		}
	}

	goFirst() {
		this.navigability.goFirst({ method: 'programmatic' })
	}

	goLast() {
		this.navigability.goLast({ method: 'programmatic' })
	}

	/** Makes the first selected option the active one. Returns whether there was one. */
	goToSelection() {
		const selected = this.firstSelected
		if (selected !== undefined) {
			this.goTo(selected)
		}
		return selected !== undefined
	}

	private get firstSelected() {
		return this.items.find(item => this.selectability.isSelected(item) && !this.disabled.has(this.keyOf(item)))
	}

	private get items() {
		return this.options.items ?? (this.renderedItems ??= this.indexability.data)
	}

	private get multiple() {
		return this.options.selectability === Selectability.Multiple
	}

	private keyOf(item: T) {
		return this.options.key?.(item) ?? item
	}

	override hostUpdated() {
		this.stampListbox()
	}

	private stampListbox() {
		const listbox = this.listbox.value ?? this.host
		listbox.setAttribute('role', 'listbox')
		if (this.multiple) {
			listbox.setAttribute('aria-multiselectable', 'true')
		} else {
			listbox.removeAttribute('aria-multiselectable')
		}
		if (this.options.orientation === 'horizontal') {
			listbox.setAttribute('aria-orientation', 'horizontal')
		} else {
			listbox.removeAttribute('aria-orientation')
		}
	}

	private stampOption(element: HTMLElement, { data, disabled }: SelectabilityItemOptions<T>) {
		this.renderedItems = undefined
		const key = this.keyOf(data)
		this.keys.set(element, key)
		this.elements.set(key, element)
		element.setAttribute('role', 'option')
		if (disabled) {
			this.disabled.add(key)
			element.setAttribute('aria-disabled', 'true')
		} else {
			this.disabled.delete(key)
			element.removeAttribute('aria-disabled')
		}
	}

	private forget(element: HTMLElement) {
		this.renderedItems = undefined
		const key = this.keys.get(element)
		this.disabled.delete(key)
		if (this.elements.get(key) === element) {
			this.elements.delete(key)
		}
		this.keys.delete(element)
	}

	/** Disabled options are passed over, and so are options not shown, such as a collapsed item's children. */
	private isNavigable(item: T) {
		const key = this.keyOf(item)
		const element = this.elements.get(key)
		return !this.disabled.has(key) && (!element || element.checkVisibility())
	}

	private handleCursorChange({ item, method, event }: NavigabilityChange<T>) {
		const entering = !this.entered
		this.entered = true
		this.markKeyboardFocus(item === undefined ? undefined : this.elementOf(item), method === 'keyboard')
		if (item === undefined) {
			return
		}
		// Tab lands on the first option before any cursor exists; the pattern wants it on the selection.
		if (entering && event?.type === 'focusin' && method !== 'pointer') {
			const selected = this.firstSelected
			if (selected !== undefined && this.keyOf(selected) !== this.keyOf(item)) {
				this.navigability.goTo(selected, { method, event })
				return
			}
		}
		if (method !== 'keyboard' || !(event instanceof KeyboardEvent)) {
			return
		}
		if (this.multiple) {
			this.selectability.follow(item, event)
		} else if (this.options.selectionFollowsFocus) {
			this.selectability.select(item, { event })
		}
	}

	private handleKeyDown(event: KeyboardEvent) {
		const current = this.navigability.current
		const editing = isTextField(this.options.combobox)
		switch (event.key) {
			case ' ':
				if (editing || current === undefined) {
					return false
				}
				this.press(current, event)
				return true
			case 'Enter':
				if (current === undefined) {
					return false
				}
				this.press(current, event)
				return true
			case 'a':
			case 'A':
				if (!this.multiple || editing || !(event.ctrlKey || event.metaKey)) {
					return false
				}
				if (this.selectability.selectableItems.every(item => this.selectability.isSelected(item))) {
					this.selectability.deselectAll()
				} else {
					this.selectability.selectAll()
				}
				return true
			case 'Home':
			case 'End':
				if (!this.multiple || editing || !event.shiftKey || !(event.ctrlKey || event.metaKey)) {
					return false
				}
				if (current !== undefined) {
					this.selectability.select(current, { selected: true, preserve: true, range: false })
				}
				if (event.key === 'Home') {
					this.navigability.goFirst({ method: 'keyboard', event })
				} else {
					this.navigability.goLast({ method: 'keyboard', event })
				}
				return true
			default:
				return false
		}
	}

	/** A key activates an option the way a click does, so the option's own click handlers run for it too. */
	private elementOf(item: T) {
		return this.elements.get(this.keyOf(item))
	}

	private keyboardFocused?: HTMLElement

	/** The active option of a combobox never takes focus, so the one a key reached shows keyboard focus this way. */
	private markKeyboardFocus(element: HTMLElement | undefined, keyboard: boolean) {
		if (!this.options.combobox) {
			return
		}
		this.keyboardFocused?.removeAttribute('data-keyboard-focus')
		this.keyboardFocused = keyboard ? element : undefined
		this.keyboardFocused?.setAttribute('data-keyboard-focus', '')
	}

	private press(item: T, event: KeyboardEvent) {
		const element = this.elementOf(item)
		if (!element) {
			this.activate(item, event)
			return
		}
		const { shiftKey, ctrlKey, metaKey, altKey } = event
		element.dispatchEvent(new MouseEvent('click', { bubbles: true, composed: true, cancelable: true, shiftKey, ctrlKey, metaKey, altKey }))
	}

	/** Shift turns a multiple selection's activation into a range, through the event. */
	private activate(item: T, event: Event) {
		this.selectability.select(item, this.multiple ? { preserve: true, event } : { event })
	}

	/** In the capture phase, so an option's own click handlers run after the selection and have the last word. */
	@eventListener({ type: 'click', options: { capture: true } })
	protected handleClick(event: MouseEvent) {
		const item = this.indexability.itemAt(event.composedPath())
		if (item && !item.options.disabled && !('selected' in item.element)) {
			this.activate(item.options.data, event)
		}
	}

	/** An option rendering its own `selected` selects itself and reports it here, on the render root, which rendered and slotted options both reach. */
	@eventListener({ type: 'change', target(this: ListboxController<unknown>) { return this.host.renderRoot } })
	protected handleOptionChange(event: Event) {
		if (!(event instanceof SelectionListItemChangeEvent)) {
			return
		}
		const item = this.indexability.itemAt(event.composedPath())
		if (item && !item.options.disabled && this.selectability.isSelectable(item.options.data)) {
			event.stopImmediatePropagation()
			this.selectability.select(item.options.data, { selected: event.selected, preserve: true, event })
		}
	}

	/** A press on an option would otherwise take focus away from the combobox. */
	@eventListener('mousedown')
	protected handleMouseDown(event: MouseEvent) {
		if (this.options.combobox && this.indexability.itemAt(event.composedPath())) {
			event.preventDefault()
		}
	}
}

const nonTextInputTypes = ['button', 'checkbox', 'color', 'file', 'hidden', 'image', 'radio', 'range', 'reset', 'submit']

function isTextField(element: HTMLElement | null | undefined) {
	return element instanceof HTMLTextAreaElement
		|| (element instanceof HTMLInputElement && !nonTextInputTypes.includes(element.type))
		|| !!element?.isContentEditable
}