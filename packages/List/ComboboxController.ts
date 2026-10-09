import { Controller, ElementRef, eventListener, type ReactiveElement } from '@a11d/lit'
import type { IndexabilityController, IndexabilityItemOptions } from '@3mo/indexability'
import { ListboxController, type ListboxControllerOptions } from './ListboxController.js'

/**
 * What a combobox browses from its input, which keeps focus: a {@link ListboxController}, or any controller of the same
 * shape given the input as its `combobox`, such as a tree's.
 */
export interface ComboboxPopup<T> {
	/** The popup, which the input controls. Its `role` is the input's `aria-haspopup` where it is no listbox. */
	readonly element: ElementRef<HTMLElement>
	/** Its registry, whose items all stand for an item. */
	readonly indexability: IndexabilityController<T, IndexabilityItemOptions<T> & { readonly data: T }>
	/** Makes the item the active one, or leaves none active. */
	goTo(item: T | undefined): void
	goFirst(): void
	goLast(): void
	/** Makes the first selected item the active one. Returns whether there was one. */
	goToSelection(): boolean
}

export interface ComboboxControllerOptions<T> extends Omit<ListboxControllerOptions<T>, 'combobox' | 'orientation' | 'selectionFollowsFocus' | 'wrap'> {
	/** What the input browses. Without it, a listbox of the options above; with it, those options are the popup's business. */
	readonly popup?: ComboboxPopup<T>
	/** Whether the listbox shows. The host owns it and commits the controller's answer in `handleExpandedChange`. */
	readonly expanded: boolean
	/** Called when a key, a choice or Tab opens or closes the listbox. */
	readonly handleExpandedChange?: (expanded: boolean) => void
	/** Typing filters the options. */
	readonly autocomplete?: boolean
	/** The first option is active as the listbox opens with nothing selected and whenever the options change, so Enter takes it. */
	readonly activateFirst?: boolean
}

/**
 * The ARIA combobox pattern: an input that keeps focus over a listbox of options.
 *
 * ```ts
 * readonly combobox = new ComboboxController<Country>(this, host => ({
 *   get expanded() { return host.open },
 *   handleExpandedChange: open => host.open = open,
 *   get selection() { return host.selection },
 *   handleChange: selection => host.selection = selection,
 * }))
 * ```
 * ```html
 * <input ${this.combobox.input.ref()}>
 * <div ${this.combobox.listbox.ref()}>
 *   <div ${this.combobox.option({ index, data: country })}>
 * ```
 *
 * @accessibility
 * The input is a `combobox` with `aria-expanded` and `aria-controls` pointing at the listbox, whose options follow the [listbox](?path=/docs/behaviors-listbox--overview) pattern.
 * Focus stays in the input: the active option is named by `aria-activedescendant`, set as an element reference so it reaches options in another shadow root, and gets `data-keyboard-focus` so it can show a focus ring.
 *
 * | Key | Does |
 * | --- | --- |
 * | `ArrowDown` `PageDown` | Closed: opens on the selected option, else on the first. |
 * | `ArrowUp` `PageUp` | Closed: opens on the selected option, else on the last. |
 * | `Home` `End`, `Enter` `Space` | Closed, where the input takes no typing: opens, on the first or last option for `Home` and `End`, on the selected one for `Enter` and `Space`. |
 * | `ArrowDown` `ArrowUp` | Open: the next or previous option. |
 * | `Home` `End` | Open: the first or last option; in an input that takes typing they move the caret instead. |
 * | A letter | Typeahead, or the typing that filters the options. |
 * | `Enter` | Chooses the active option and closes; `Space` too, where the input takes no typing. |
 * | `Escape` `Tab` | Closes; `Tab` moves focus on as well. |
 *
 * Name the input and the listbox, for example after a visible label.
 *
 * Another popup takes the listbox's place through `popup`: a tree's controller given the input as its `combobox`, for
 * options nested under others. Its keys and roles are the tree's own.
 */
export class ComboboxController<T, THost extends ReactiveElement = ReactiveElement> extends Controller implements EventListenerObject {
	private static readonly firstKeys = ['ArrowDown', 'Down', 'PageDown']
	private static readonly lastKeys = ['ArrowUp', 'Up', 'PageUp']
	private static readonly selectOnlyKeys = ['Home', 'End', 'Enter', ' ']

	readonly input = new ElementRef<HTMLElement>({
		updated: element => {
			element.addEventListener('keydown', this, { capture: true })
			this.stampInput()
		},
		disconnected: element => element.removeEventListener('keydown', this, { capture: true }),
	})

	protected readonly options: ComboboxControllerOptions<T>

	private readonly popup: ComboboxPopup<T>

	constructor(protected override readonly host: THost, options: ComboboxControllerOptions<T> | ((host: THost) => ComboboxControllerOptions<T>)) {
		super(host)
		this.options = typeof options === 'function' ? options(host) : options
		const controller = this
		this.popup = this.options.popup ?? new ListboxController<T>(host, {
			get items() { return controller.options.items },
			get key() { return controller.options.key },
			get selectability() { return controller.options.selectability },
			get isSelectable() { return controller.options.isSelectable },
			get selection() { return controller.options.selection },
			get handleChange() { return controller.options.handleChange },
			get combobox() { return controller.input.value },
			wrap: true,
		})
	}

	/** The popup: the listbox, or what `popup` gave. */
	get listbox() { return this.popup.element }

	/** Registers an option of the listbox: `<div ${controller.option({ index, data })}>`. */
	get option() { return this.popup.indexability.item }

	get indexability() { return this.popup.indexability }

	/** Makes the option the active one, or leaves none active. */
	goTo(item: T | undefined) {
		this.popup.goTo(item)
	}

	private expanded = false
	private landing = false
	private openingKey?: string
	private shownOptions?: ReadonlyArray<T>
	private observedListbox?: HTMLElement
	private readonly resizeObserver = new ResizeObserver(() => this.land())
	private stampedPopup = false

	override hostDisconnected() {
		this.resizeObserver.disconnect()
		this.observedListbox = undefined
	}

	override hostUpdated() {
		this.stampInput()
		this.observeListbox()
		if (this.options.expanded && !this.expanded) {
			this.shownOptions = this.options.activateFirst ? this.indexability.data : undefined
			this.landing = true
			this.land()
		} else if (this.options.expanded) {
			this.activateFirstOfNewOptions()
		} else {
			this.landing = false
			this.openingKey = undefined
			this.shownOptions = undefined
			this.popup.goTo(undefined)
		}
		this.expanded = this.options.expanded
	}

	private stampInput() {
		const input = this.input.value
		if (!input) {
			return
		}
		input.setAttribute('role', 'combobox')
		input.setAttribute('aria-expanded', String(this.options.expanded))
		input.ariaControlsElements = this.listbox.value ? [this.listbox.value] : null
		// A listbox is what a combobox pops up unless it says otherwise; only what it wrote itself is taken back.
		const popup = this.listbox.value?.getAttribute('role')
		if (popup && popup !== 'listbox') {
			input.setAttribute('aria-haspopup', popup)
			this.stampedPopup = true
		} else if (this.stampedPopup) {
			input.removeAttribute('aria-haspopup')
			this.stampedPopup = false
		}
		if (this.options.autocomplete) {
			input.setAttribute('aria-autocomplete', 'list')
		} else {
			input.removeAttribute('aria-autocomplete')
		}
	}

	private observeListbox() {
		const listbox = this.listbox.value
		if (listbox !== this.observedListbox) {
			this.resizeObserver.disconnect()
			if (listbox) {
				this.resizeObserver.observe(listbox)
			}
			this.observedListbox = listbox
		}
	}

	/** Waits for the listbox to be laid out, which a popover does only after the host's update, so the option scrolls into view. */
	private land() {
		const listbox = this.listbox.value
		if (!this.landing || !this.options.expanded || (listbox && !listbox.checkVisibility())) {
			return
		}
		this.landing = false
		const key = this.openingKey
		this.openingKey = undefined
		if (key === 'Home') {
			this.popup.goFirst()
		} else if (key === 'End') {
			this.popup.goLast()
		} else if (!this.popup.goToSelection()) {
			if (key !== undefined && ComboboxController.lastKeys.includes(key)) {
				this.popup.goLast()
			} else if ((key !== undefined && ComboboxController.firstKeys.includes(key)) || this.options.activateFirst) {
				this.popup.goFirst()
			}
		}
	}

	private activateFirstOfNewOptions() {
		if (!this.options.activateFirst || this.landing) {
			return
		}
		const options = this.indexability.data
		const key = (item: T) => this.options.key?.(item) ?? item
		const shown = this.shownOptions
		if (shown && shown.length === options.length && shown.every((item, index) => key(item) === key(options[index]!))) {
			return
		}
		this.shownOptions = options
		this.popup.goFirst()
	}

	handleEvent(event: KeyboardEvent) {
		if (event.defaultPrevented) {
			return
		}
		if (this.options.expanded && event.key === 'Tab') {
			this.options.handleExpandedChange?.(false)
			return
		}
		if (event.ctrlKey || event.metaKey || event.shiftKey) {
			return
		}
		if (!this.options.expanded) {
			const typeable = event.target instanceof HTMLInputElement && !event.target.readOnly
			if ([...ComboboxController.firstKeys, ...ComboboxController.lastKeys].includes(event.key) || (!typeable && ComboboxController.selectOnlyKeys.includes(event.key))) {
				event.preventDefault()
				this.openingKey = event.key
				this.options.handleExpandedChange?.(true)
			}
		} else if (event.key === 'Escape') {
			event.preventDefault()
			this.options.handleExpandedChange?.(false)
		}
	}

	private readonly choices = new WeakSet<Event>()

	/** Decided as the click starts, as a re-render it causes may remove the option before it ends. */
	@eventListener({ type: 'click', options: { capture: true } })
	protected handleClickCapture(event: MouseEvent) {
		const path = event.composedPath()
		const item = this.indexability.itemAt(path)
		const tree = item?.element.getAttribute('role') === 'treeitem'
		if (this.options.expanded && item && !item.options.disabled && !path.slice(0, path.indexOf(item.element)).some(target => isControl(target) || (tree && isIndicator(target)))) {
			this.choices.add(event)
		}
	}

	@eventListener('click')
	protected handleClick(event: MouseEvent) {
		if (this.choices.has(event) && this.options.expanded) {
			this.options.handleExpandedChange?.(false)
		}
	}
}

function isControl(target: EventTarget) {
	return target instanceof Element && target.matches('input, button, select, textarea, [role=checkbox], [role=switch], [role=radio], [role=button]')
}

/** A press on a tree item's indicator opens the item rather than choosing it. */
function isIndicator(target: EventTarget) {
	return target instanceof Element && target.matches('[part~=indicator]')
}
