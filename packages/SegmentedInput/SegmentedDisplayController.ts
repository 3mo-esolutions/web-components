import { Controller, ElementRef, ElementRefs, type ReactiveControllerHost } from '@a11d/lit'
import { type EditableSegment, type LiteralSegment } from './InputSegment.js'
import { setOrRemove } from './setOrRemove.js'

export type SegmentedDisplayControllerOptions = {
	/** The whole value, as one string without the separators. */
	readonly value: string
	/** How many characters the value holds. */
	readonly length: number
	/** The input's accessible name. */
	readonly label?: string
	/** Shown by a cell which holds no character yet. */
	readonly placeholder?: string
	/** Shown by a filled cell in place of its character, for a value which should not be read over a shoulder. */
	readonly mask?: string
	/** The character positions a separator follows, e.g. `[3]` for "123 456". */
	readonly separators?: ReadonlyArray<number>
	/** The separator itself. Defaults to a non-breaking hyphen. */
	readonly separator?: string
	/** Defaults to "one-time-code", which is what lets a phone offer a code it has just received. */
	readonly autocomplete?: string
	/** Defaults to "numeric". */
	readonly inputMode?: string
	readonly name?: string
	readonly disabled?: boolean
	readonly readonly?: boolean
	readonly required?: boolean
	readonly invalid?: boolean

	/** Filters and normalizes one character of a typed or pasted value; `undefined` drops it. */
	accept?(character: string): string | undefined
	/** The value as it is typed. */
	handleInput(value: string): void
	/** The value once the input is left, as the input's own `change` reports it. */
	handleChange?(value: string): void
	/** The value has just become as long as it can be. Fired once per completion. */
	handleComplete?(value: string): void
	handleFocusChange?(focused: boolean): void
}

type OptionsOrFactory<THost> = SegmentedDisplayControllerOptions | ((host: THost) => SegmentedDisplayControllerOptions)

/** A cell knows its position in the value, which is where the caret stands when it is the active one. */
export type SegmentedDisplaySegment = LiteralSegment | EditableSegment & { readonly index: number }

/**
 * Draws one value as a row of cells while a single real input holds it.
 *
 * ```html
 * <div ${this.display.group.ref()}>
 *     <input ${this.display.input.ref()}>
 *     ${this.display.segments.map(segment => html`<span ${this.display.segment.ref(segment)}></span>`)}
 * </div>
 * ```
 *
 * A code is one value, not several: the cells are a drawing of it, and everything which makes a value
 * arrive — a phone offering the code it just received through `autocomplete="one-time-code"`, a
 * password manager filling an authenticator code, a paste into the middle, select-all, undo, the
 * long-press menu — happens on the input, where the platform already implements it. Splitting the
 * value over one input per cell would take all of that away and hand a screen reader six controls
 * where the user has one thing to enter.
 *
 * The cells are hidden from assistive technology for the same reason: the input carries the name, the
 * value and the caret. The host places the input over the cells and paints it transparent — its
 * `::selection` as well, since a selection repaints the text it covers and the value would show
 * through the drawing. The cells mark the selected range themselves, through `data-active`.
 *
 * @ssr false
 */
export class SegmentedDisplayController<THost extends ReactiveControllerHost = ReactiveControllerHost> extends Controller implements EventListenerObject {
	private static readonly inputEventTypes = ['input', 'change', 'focus', 'blur', 'select', 'keyup', 'pointerup']

	protected readonly options: SegmentedDisplayControllerOptions

	/** The element wrapping the input and the cells. */
	readonly group = new ElementRef<HTMLElement>({
		updated: element => this.listen(element, ['click'], 'addEventListener'),
		disconnected: element => this.listen(element, ['click'], 'removeEventListener'),
	})

	/** The one real input holding the value. */
	readonly input = new ElementRef<HTMLInputElement>({
		updated: element => {
			this.listen(element, SegmentedDisplayController.inputEventTypes, 'addEventListener')
			this.stampInput()
		},
		disconnected: element => this.listen(element, SegmentedDisplayController.inputEventTypes, 'removeEventListener'),
	})

	/** The element drawing one cell, declared with the cell. The controller writes the cell's text into it. */
	readonly segment = new ElementRefs<HTMLElement, SegmentedDisplaySegment>({
		updated: (element, segment) => this.stampSegment(element, segment),
	})

	private focused = false
	private completed = false

	constructor(protected override readonly host: THost, options: OptionsOrFactory<THost>) {
		super(host)
		this.options = typeof options === 'function' ? options(host) : options
	}

	/** The cells and the separators between them. */
	get segments(): ReadonlyArray<SegmentedDisplaySegment> {
		const { value, length, placeholder, mask, separators = [], separator = '‑' } = this.options
		const segments = new Array<SegmentedDisplaySegment>()
		for (let index = 0; index < length; index++) {
			const character = value[index]
			segments.push({
				key: `cell-${index}`,
				editable: true,
				index,
				filled: character !== undefined,
				text: character === undefined ? placeholder ?? '' : mask ?? character,
			})
			if (separators.includes(index) && index < length - 1) {
				segments.push({ key: `separator-${index}`, editable: false, text: separator })
			}
		}
		return segments
	}

	/** Whether the caret stands on the cell, or a selection spans it. */
	private isActive(index: number) {
		const element = this.input.value
		const start = element?.selectionStart ?? this.options.value.length
		const end = element?.selectionEnd ?? start
		return start === end
			? index === Math.min(start, this.options.length - 1)
			: index >= start && index < end
	}

	get isComplete() {
		return this.options.value.length >= this.options.length
	}

	private get editable() {
		return !this.options.disabled && !this.options.readonly
	}

	override hostUpdated() {
		this.refresh()
	}

	private listen(element: Element, types: ReadonlyArray<string>, method: 'addEventListener' | 'removeEventListener') {
		for (const type of types) {
			element[method](type, this)
		}
	}

	handleEvent(event: Event) {
		switch (event.type) {
			case 'click': return this.handleClick(event as MouseEvent)
			case 'input': return this.handleInput()
			case 'change': return this.options.handleChange?.(this.input.value!.value)
			case 'focus': return this.handleFocusChange(true)
			case 'blur': return this.handleFocusChange(false)
			// The caret moved: select, keyup, pointerup.
			default: return this.refresh()
		}
	}

	// #region Stamping

	private stampInput() {
		const element = this.input.value
		if (!element) {
			return
		}
		const { options } = this
		element.type = 'text'
		element.maxLength = options.length
		element.inputMode = options.inputMode ?? 'numeric'
		element.setAttribute('autocomplete', options.autocomplete ?? 'one-time-code')
		element.setAttribute('autocapitalize', 'off')
		element.spellcheck = false
		element.disabled = options.disabled ?? false
		element.readOnly = options.readonly ?? false
		element.required = options.required ?? false
		setOrRemove(element, 'autocorrect', 'off')
		setOrRemove(element, 'aria-label', options.label)
		setOrRemove(element, 'aria-invalid', options.invalid ? 'true' : undefined)
		setOrRemove(element, 'name', options.name)
		if (element.value !== options.value) {
			element.value = options.value
		}
	}

	private stampSegment(element: HTMLElement, segment: SegmentedDisplaySegment) {
		if (element.textContent !== segment.text) {
			element.textContent = segment.text
		}
		element.setAttribute('data-segment', segment.key)
		// The input carries the name, the value and the caret; the cells are the drawing of it.
		element.setAttribute('aria-hidden', 'true')
		element.toggleAttribute('data-placeholder', segment.editable && !segment.filled)
		element.toggleAttribute('data-active', segment.editable && this.focused && this.isActive(segment.index))
	}

	/** Re-reads the value and writes it onto the input and the cells, without waiting for the host to render. */
	refresh() {
		this.stampInput()
		const segmentsByKey = new Map(this.segments.map(segment => [segment.key, segment]))
		for (const element of this.segment) {
			const segment = segmentsByKey.get(this.segment.get(element)!.key)
			if (segment) {
				this.segment.set(element, segment)
			}
		}
	}

	// #endregion

	// #region Editing

	focus() {
		this.input.value?.focus()
	}

	/** Puts the caret on a cell. */
	select(index: number) {
		const position = Math.max(0, Math.min(index, this.options.value.length))
		this.input.value?.setSelectionRange(position, position)
		this.refresh()
	}

	private handleInput() {
		const element = this.input.value
		if (!element) {
			return
		}
		const value = this.filter(element.value)
		if (element.value !== value) {
			element.value = value
		}
		this.options.handleInput(value)
		const complete = value.length >= this.options.length
		if (complete && !this.completed) {
			this.options.handleComplete?.(value)
		}
		this.completed = complete
		this.refresh()
		this.host.requestUpdate()
	}

	private filter(value: string) {
		const accept = this.options.accept
		const characters = [...value]
			.map(character => accept ? accept(character) : character)
			.filter((character): character is string => character !== undefined)
		return characters.join('').slice(0, this.options.length)
	}

	private handleFocusChange(focused: boolean) {
		this.focused = focused
		this.options.handleFocusChange?.(focused)
		this.refresh()
	}

	/**
	 * The input covers the cells, so the browser places the caret by the position of a text which is
	 * painted transparent. The cell actually pressed is the one under the pointer.
	 */
	private handleClick(event: MouseEvent) {
		if (!this.editable) {
			return
		}
		const cells = [...this.segment].filter(element => this.segment.get(element)?.editable)
		const index = cells.findIndex(element => {
			const rect = element.getBoundingClientRect()
			return event.clientX >= rect.left && event.clientX <= rect.right
		})
		this.focus()
		this.select(index < 0 ? this.options.value.length : index)
	}

	// #endregion
}