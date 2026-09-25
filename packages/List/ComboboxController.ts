import { Controller, ElementRef, eventListener, type ReactiveElement } from '@a11d/lit'
import { ListboxController, type ListboxControllerOptions } from './ListboxController.js'

export interface ComboboxControllerOptions<T> extends Omit<ListboxControllerOptions<T>, 'combobox' | 'orientation' | 'selectionFollowsFocus' | 'wrap'> {
	readonly expanded: boolean
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
 * Opening lands on the selected option, or else on the first or last one for the key that opened it. Home,
 * End, Enter and Space open it too where the input takes no typing. Escape, Tab and a choice close it, unless
 * the choice is made through a control nested in the option, such as a checkbox.
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

	private readonly listboxController: ListboxController<T>

	constructor(protected override readonly host: THost, options: ComboboxControllerOptions<T> | ((host: THost) => ComboboxControllerOptions<T>)) {
		super(host)
		this.options = typeof options === 'function' ? options(host) : options
		const controller = this
		this.listboxController = new ListboxController<T>(host, {
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

	get listbox() { return this.listboxController.listbox }

	/** Registers an option: `<div ${controller.option({ index, data })}>`. */
	get option() { return this.listboxController.option }

	get indexability() { return this.listboxController.indexability }

	/** Makes the option the active one, or leaves none active. */
	goTo(item: T | undefined) {
		this.listboxController.goTo(item)
	}

	private expanded = false
	private landing = false
	private openingKey?: string
	private shownOptions?: ReadonlyArray<T>
	private observedListbox?: HTMLElement
	private readonly resizeObserver = new ResizeObserver(() => this.land())

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
			this.listboxController.goTo(undefined)
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
			this.listboxController.goFirst()
		} else if (key === 'End') {
			this.listboxController.goLast()
		} else if (!this.listboxController.goToSelection()) {
			if (key !== undefined && ComboboxController.lastKeys.includes(key)) {
				this.listboxController.goLast()
			} else if ((key !== undefined && ComboboxController.firstKeys.includes(key)) || this.options.activateFirst) {
				this.listboxController.goFirst()
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
		this.listboxController.goFirst()
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
		if (this.options.expanded && item && !item.options.disabled && !path.slice(0, path.indexOf(item.element)).some(isControl)) {
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