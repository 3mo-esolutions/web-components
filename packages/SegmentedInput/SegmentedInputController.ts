import { Controller, ElementRef, ElementRefs, type ReactiveControllerHost } from '@a11d/lit'
import { isEditableSegment, type EditableSegment, type InputSegment, type SegmentedInputStep } from './InputSegment.js'
import { setOrRemove } from './setOrRemove.js'

export type SegmentedInputControllerOptions<TSegment extends InputSegment = InputSegment> = {
	/** The segments as the host's value currently reads. Re-read after every interaction. */
	readonly segments: ReadonlyArray<TSegment>
	/** The field's name, appended to every segment's own name for screen readers which do not announce groups. */
	readonly label?: string
	/** The whole value in words, announced when the group is entered. */
	readonly description?: string
	readonly direction?: 'ltr' | 'rtl'
	readonly disabled?: boolean
	readonly readonly?: boolean
	readonly required?: boolean
	readonly invalid?: boolean

	/**
	 * The text the segment should hold once `character` is typed into what is already `typed`, or
	 * `undefined` to refuse the character. Defaults to appending it. A text longer than the segment's
	 * capacity restarts the segment with the character alone.
	 *
	 * Returning a *shorter* text is how a unit restarts before that: a month holding "1" which is typed
	 * "3" answers "3", because "13" is no month.
	 */
	accept?(segment: TSegment & EditableSegment, typed: string, character: string): string | undefined
	/** Whether no further character could follow `text`, so that the focus moves on. Defaults to the capacity being reached. */
	isComplete?(segment: TSegment & EditableSegment, text: string): boolean

	/** Everything typed into the segment so far — nothing, once it is emptied. The host decides what, if anything, that means for its value. */
	handleSegmentInput(segment: TSegment & EditableSegment, text: string): void
	/** Arrow, page, home and end keys. Left out, those keys do nothing and the segments are textboxes rather than spinbuttons. */
	handleStep?(segment: TSegment & EditableSegment, step: SegmentedInputStep): void
	/** Enter, or the group being left: the moment for the host to complete and hand on its value. */
	handleCommit?(): void
	/** The whole clipboard text. Return `true` when it was taken. */
	handlePaste?(text: string): boolean
	/**
	 * Letters, and a leading plus or minus, are buffered instead of typed and handed over on Enter, on
	 * leaving, or after a pause — the "cheat code" a field may resolve to a whole value. Return `true`
	 * when the text was taken. Left out, such characters are ignored.
	 */
	handleShortcut?(text: string): boolean
	/** The focus would move past the first or last segment — into a neighbouring group, if there is one. */
	handleMoveBeyond?(direction: -1 | 1): void
	handleFocusChange?(focused: boolean): void
	/** Stamps whatever the specialization adds to a segment, e.g. the value of a spinbutton. */
	stamp?(element: HTMLElement, segment: TSegment & EditableSegment): void
}

type OptionsOrFactory<TSegment extends InputSegment, THost> = SegmentedInputControllerOptions<TSegment> | ((host: THost) => SegmentedInputControllerOptions<TSegment>)

const stepsByKey = new Map<string, SegmentedInputStep>([
	['ArrowUp', 'increment'],
	['ArrowDown', 'decrement'],
	['PageUp', 'incrementPage'],
	['PageDown', 'decrementPage'],
	['Home', 'min'],
	['End', 'max'],
])

/**
 * Turns a group of elements into one input made of several: each segment is focused and typed into on
 * its own, a filled one hands the focus to the next, and the separators between them stay inert.
 *
 * ```html
 * <div ${this.segments.group.ref()}>
 *     ${this.segments.segments.map(segment => html`<span ${this.segments.segment.ref(segment)}></span>`)}
 * </div>
 * ```
 *
 * The controller owns everything on those elements except their styling: ARIA, `tabindex`,
 * `contenteditable`, `data-*` and the rendered text — the template renders empty elements. What the
 * segments *mean* stays with the host: it hands over the segments, is told what was typed into which,
 * and decides what that makes of its value.
 *
 * Unmodified keys are the controller's; a key pressed with Ctrl, Meta or Alt is left to the host.
 *
 * The segments are `contenteditable` rather than inputs so that they size to their content, so that a
 * right-to-left group keeps the order the language reads them in — inputs are atomic to the
 * bidirectional algorithm and come out reversed — and so that the group is one line of text rather
 * than a row of boxes. A value which must be autofilled needs a real input instead: see
 * {@link SegmentedDisplayController}.
 *
 * @ssr false
 */
export class SegmentedInputController<TSegment extends InputSegment = InputSegment, THost extends ReactiveControllerHost = ReactiveControllerHost> extends Controller implements EventListenerObject {
	/** How long typing may pause before a buffered shortcut is handed over. */
	static readonly shortcutTimeout = 700

	private static readonly groupEventTypes = ['focusin', 'focusout', 'pointerdown', 'paste']
	private static readonly segmentEventTypes = ['focus', 'keydown', 'beforeinput', 'input']

	protected readonly options: SegmentedInputControllerOptions<TSegment>

	/** The element wrapping the segments. */
	readonly group = new ElementRef<HTMLElement>({
		updated: element => {
			this.listen(element, SegmentedInputController.groupEventTypes, 'addEventListener')
			this.stampGroup()
		},
		disconnected: element => this.listen(element, SegmentedInputController.groupEventTypes, 'removeEventListener'),
	})

	/** The element rendering one segment, declared with the segment. The controller writes the segment's text into it. */
	readonly segment = new ElementRefs<HTMLElement, TSegment>({
		updated: (element, segment) => {
			this.listen(element, SegmentedInputController.segmentEventTypes, 'addEventListener')
			this.stampSegment(element, segment)
		},
		disconnected: element => this.listen(element, SegmentedInputController.segmentEventTypes, 'removeEventListener'),
	})

	private typed = ''
	private shortcut = ''
	private shortcutTimer?: ReturnType<typeof setTimeout>
	private focusedKey?: string
	private focusedWithin = false
	/** Chromium focuses the editing host nearest to a press below the field, so the segments are only editable while in use. */
	private engaged = false

	constructor(protected override readonly host: THost, options: OptionsOrFactory<TSegment, THost>) {
		super(host)
		this.options = typeof options === 'function' ? options(host) : options
	}

	get segments() {
		return this.options.segments
	}

	/** The segments which can be focused and typed into, in rendering order. */
	get editableSegments() {
		return this.segments.filter(isEditableSegment)
	}

	get isEmpty() {
		return this.editableSegments.every(segment => !segment.filled)
	}

	get isComplete() {
		return this.editableSegments.every(segment => segment.filled)
	}

	/** What has been typed into the focused segment but does not yet fill it. */
	get typedText() {
		return this.typed
	}

	private get editable() {
		return !this.options.disabled && !this.options.readonly
	}

	private get direction() {
		return this.options.direction ?? 'ltr'
	}

	/** The punctuation of the group's own literals: typing the separator which is shown moves on to the next segment. */
	private get separators() {
		return new Set(this.segments
			.filter(segment => !segment.editable)
			.flatMap(segment => [...segment.text])
			.filter(character => !/[\p{L}\p{N}]/u.test(character)))
	}

	/** The segment the focus rests on when the group is tabbed into: the one it was on, otherwise the first. */
	private get tabStopKey() {
		return this.segmentOf(this.focusedKey)?.key ?? this.editableSegments[0]?.key
	}

	private segmentOf(key: string | undefined) {
		return key === undefined ? undefined : this.editableSegments.find(segment => segment.key === key)
	}

	private elementOf(key: string | undefined) {
		return key === undefined ? undefined : [...this.segment].find(element => this.segment.get(element)?.key === key)
	}

	override hostUpdated() {
		this.refresh()
	}

	override hostDisconnected() {
		this.cancelShortcut()
	}

	private listen(element: Element, types: ReadonlyArray<string>, method: 'addEventListener' | 'removeEventListener') {
		for (const type of types) {
			element[method](type, this)
		}
	}

	handleEvent(event: Event) {
		switch (event.type) {
			case 'focus': return this.handleFocus(event as FocusEvent)
			case 'focusin': return this.handleFocusIn()
			case 'focusout': return this.handleFocusOut(event as FocusEvent)
			case 'pointerdown': return this.handlePointerDown(event as PointerEvent)
			case 'paste': return this.handlePaste(event as ClipboardEvent)
			case 'keydown': return this.handleKeyDown(event as KeyboardEvent)
			case 'beforeinput': return this.handleBeforeInput(event as InputEvent)
			case 'input': return this.handleInput(event)
		}
	}

	private editableSegmentOn(event: Event) {
		const segment = this.segment.get(event.currentTarget as HTMLElement)
		return segment && isEditableSegment(segment) ? segment : undefined
	}

	// #region Stamping

	private stampGroup() {
		const element = this.group.value
		if (!element) {
			return
		}
		const { options } = this
		element.setAttribute('role', 'group')
		element.setAttribute('dir', this.direction)
		setOrRemove(element, 'aria-label', options.label)
		setOrRemove(element, 'aria-description', options.description)
		setOrRemove(element, 'aria-disabled', options.disabled ? 'true' : undefined)
		setOrRemove(element, 'aria-invalid', options.invalid ? 'true' : undefined)
		setOrRemove(element, 'data-shortcut', this.shortcut || undefined)
	}

	private stampSegment(element: HTMLElement, segment: TSegment) {
		const { options } = this
		if (element.textContent !== segment.text) {
			element.textContent = segment.text
		}
		element.setAttribute('data-segment', segment.key)

		if (!isEditableSegment(segment)) {
			element.setAttribute('aria-hidden', 'true')
			return
		}

		const editable = this.editable
		element.setAttribute('role', options.handleStep ? 'spinbutton' : 'textbox')
		element.setAttribute('aria-label', [segment.label, options.label].filter(Boolean).join(', '))
		setOrRemove(element, 'aria-readonly', options.readonly ? 'true' : undefined)
		setOrRemove(element, 'aria-disabled', options.disabled ? 'true' : undefined)
		setOrRemove(element, 'aria-invalid', options.invalid ? 'true' : undefined)
		setOrRemove(element, 'aria-required', options.required ? 'true' : undefined)
		element.toggleAttribute('data-placeholder', !segment.filled)
		setOrRemove(element, 'contenteditable', editable && this.engaged ? 'plaintext-only' : undefined)
		setOrRemove(element, 'inputmode', editable ? segment.inputMode : undefined)
		setOrRemove(element, 'enterkeyhint', editable ? 'next' : undefined)
		setOrRemove(element, 'spellcheck', editable ? 'false' : undefined)
		setOrRemove(element, 'autocorrect', editable ? 'off' : undefined)
		element.tabIndex = options.disabled ? -1 : segment.key === this.tabStopKey ? 0 : -1

		// Digits are a left-to-right run even in right-to-left text, but a placeholder word is not: the
		// isolation keeps every numeric segment from jumping around as it fills — and, unlike an embedding,
		// keeps the separators between them from fusing the whole group into one left-to-right number.
		const isolate = this.direction === 'rtl' && segment.inputMode === 'numeric'
		element.style.direction = isolate ? 'ltr' : ''
		element.style.unicodeBidi = isolate ? 'isolate' : ''

		options.stamp?.(element, segment)
	}

	/**
	 * Re-reads the segments and writes them onto the elements, without waiting for the host to render,
	 * so that a keystroke shows at once.
	 */
	refresh() {
		const segmentsByKey = new Map(this.segments.map(segment => [segment.key, segment]))
		for (const element of this.segment) {
			const segment = segmentsByKey.get(this.segment.get(element)!.key)
			if (segment) {
				this.segment.set(element, segment)
			}
		}
		this.stampGroup()
	}

	/** What follows every edit: the elements show it at once, the host on its next render. */
	private update() {
		this.refresh()
		this.host.requestUpdate()
	}

	// #endregion

	// #region Focus

	focus(key: string | undefined = this.tabStopKey) {
		const element = this.elementOf(key)
		if (!element) {
			return
		}
		// Recorded before focusing: a programmatic focus raises no focus event in every engine.
		this.focusedKey = key
		this.typed = ''
		element.focus()
		this.refresh()
	}

	focusFirst() {
		this.focus(this.editableSegments[0]?.key)
	}

	focusLast() {
		this.focus(this.editableSegments.at(-1)?.key)
	}

	private move(direction: -1 | 1) {
		const segments = this.editableSegments
		const index = segments.findIndex(segment => segment.key === this.focusedKey)
		const next = segments[index + direction]
		if (index >= 0 && !next) {
			this.typed = ''
			this.options.handleMoveBeyond?.(direction)
		} else if (next) {
			this.focus(next.key)
		}
	}

	private handleFocus(event: FocusEvent) {
		const segment = this.editableSegmentOn(event)
		if (!segment) {
			return
		}
		this.focusedKey = segment.key
		this.typed = ''
		this.engaged = true
		// A collapsed selection is what keeps Android from composing across the segment's text.
		window.getSelection()?.collapse(event.currentTarget as Node, 0)
		this.refresh()
	}

	private handleFocusIn() {
		if (!this.focusedWithin) {
			this.focusedWithin = true
			this.options.handleFocusChange?.(true)
		}
	}

	private handleFocusOut(event: FocusEvent) {
		if (event.relatedTarget instanceof Node && this.group.value?.contains(event.relatedTarget)) {
			return
		}
		this.focusedWithin = false
		this.engaged = false
		this.commit()
		// A field left empty forgets where it was, so that the next entry starts at the first unit again.
		if (this.isEmpty) {
			this.focusedKey = undefined
			this.refresh()
		}
		this.options.handleFocusChange?.(false)
	}

	/**
	 * An empty field shows nothing until it is entered, so a press cannot have been aimed at the unit it
	 * happens to land on: entry starts at the first unit instead. A field already showing a value is a
	 * different matter, there the unit under the pointer was chosen. Handled on pointerdown, before the
	 * browser begins its own focus change — Blink ignores a `focus()` issued from inside a focus event.
	 */
	private handlePointerDown(event: PointerEvent) {
		this.engage()
		if (this.focusedWithin || !this.isEmpty || !this.editable) {
			return
		}
		const first = this.editableSegments[0]
		const pressed = event.composedPath().map(target => this.segment.get(target as HTMLElement)).find(Boolean)
		if (!first || pressed?.key === first.key) {
			return
		}
		event.preventDefault()
		this.focusFirst()
	}

	/** Before the browser focuses a segment: a phone raises its keyboard only for an element editable when pressed. */
	private engage() {
		this.engaged = true
		this.refresh()
		requestAnimationFrame(() => {
			if (!this.focusedWithin) {
				this.engaged = false
				this.refresh()
			}
		})
	}

	// #endregion

	// #region Editing

	private handleKeyDown(event: KeyboardEvent) {
		const segment = this.editableSegmentOn(event)
		if (!segment) {
			return
		}

		if (event.ctrlKey || event.metaKey || event.altKey) {
			if (event.key === 'a') {
				event.preventDefault()
			}
			return
		}

		const rtl = this.direction === 'rtl'
		const step = stepsByKey.get(event.key)

		if (event.key === 'ArrowLeft' || event.key === 'ArrowRight') {
			this.move((event.key === 'ArrowLeft') !== rtl ? -1 : 1)
		} else if (step) {
			if (!this.options.handleStep || !this.editable) {
				return
			}
			this.typed = ''
			this.options.handleStep(segment, step)
			this.refresh()
		} else if (event.key === 'Backspace' || event.key === 'Delete') {
			this.backspace(segment)
		} else if (event.key === 'Enter') {
			this.commit()
		} else if (event.key === 'Escape' && this.shortcut) {
			this.cancelShortcut()
			this.refresh()
		} else if (event.key.length === 1) {
			this.type(segment, event.key)
		} else {
			return
		}
		event.preventDefault()
	}

	private handleBeforeInput(event: InputEvent) {
		const segment = this.editableSegmentOn(event)
		if (!segment || event.inputType === 'insertCompositionText') {
			return
		}
		event.preventDefault()
		if (event.inputType === 'deleteContentBackward' || event.inputType === 'deleteContentForward') {
			this.backspace(segment)
		} else if (event.inputType.startsWith('insert') && event.data) {
			this.type(segment, event.data)
		}
	}

	/** Composition cannot be canceled; the segment's own text is put back. */
	private handleInput(event: Event) {
		const element = event.currentTarget as HTMLElement
		const segment = this.segment.get(element)
		if (segment && element.textContent !== segment.text) {
			element.textContent = segment.text
		}
	}

	private handlePaste(event: ClipboardEvent) {
		const text = event.clipboardData?.getData('text')?.trim()
		if (!text || !this.editable) {
			return
		}
		event.preventDefault()
		if (this.options.handlePaste?.(text)) {
			this.typed = ''
			this.update()
		} else if (this.options.handleShortcut) {
			this.shortcut = text
			this.commit()
		}
	}

	/** Types text into a segment, character by character, as though it had been keyed in. */
	type(segment: TSegment & EditableSegment, text: string) {
		if (!this.editable) {
			return
		}
		// Several characters at once (a paste, an IME commit) flow on into the segment a filled one advanced to.
		let key: string | undefined = segment.key
		for (const character of text) {
			const current = this.segmentOf(key)
			if (!current) {
				break
			}
			const focusedBefore = this.focusedKey
			this.typeCharacter(current, character)
			key = this.focusedKey === focusedBefore ? key : this.focusedKey
		}
	}

	private typeCharacter(segment: TSegment & EditableSegment, character: string) {
		if (this.shortcut) {
			this.extendShortcut(character)
			return
		}

		const accepted = this.accept(segment, character)
		if (accepted !== undefined) {
			const complete = this.options.isComplete?.(segment, accepted) ?? accepted.length >= (segment.capacity ?? 1)
			this.typed = complete ? '' : accepted
			this.options.handleSegmentInput(segment, accepted)
			this.update()
			if (complete) {
				this.move(1)
			}
		} else if (this.typed && this.separators.has(character)) {
			this.typed = ''
			this.move(1)
		} else if (character === '+' || character === '-' || /\p{L}/u.test(character)) {
			this.extendShortcut(character)
		}
	}

	private accept(segment: TSegment & EditableSegment, character: string) {
		const text = this.options.accept ? this.options.accept(segment, this.typed, character) : this.typed + character
		return text !== undefined && text.length > (segment.capacity ?? 1) ? character : text
	}

	private backspace(segment: TSegment & EditableSegment) {
		if (!this.editable) {
			return
		}
		if (this.typed.length > 1) {
			this.typed = this.typed.slice(0, -1)
			this.options.handleSegmentInput(segment, this.typed)
			this.update()
		} else if (segment.filled || this.typed) {
			this.typed = ''
			this.options.handleSegmentInput(segment, '')
			this.update()
		} else {
			this.move(-1)
		}
	}

	// #endregion

	// #region Shortcuts

	private extendShortcut(character: string) {
		if (!this.options.handleShortcut) {
			return
		}
		this.shortcut += character
		clearTimeout(this.shortcutTimer)
		this.shortcutTimer = setTimeout(() => this.commit(), SegmentedInputController.shortcutTimeout)
		this.stampGroup()
	}

	private cancelShortcut() {
		clearTimeout(this.shortcutTimer)
		this.shortcutTimer = undefined
		this.shortcut = ''
	}

	// #endregion

	/** Applies a pending shortcut and lets the host complete and hand on its value. */
	commit() {
		const shortcut = this.shortcut
		this.cancelShortcut()
		if (shortcut) {
			this.options.handleShortcut?.(shortcut)
		}
		this.typed = ''
		if (this.editable) {
			this.options.handleCommit?.()
		}
		this.update()
	}
}