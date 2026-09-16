/**
 * One unit of a value as an input renders it — a year, a digit of a code, a group of a card number —
 * or a literal separator between two of them.
 *
 * A segment is a *description*, not state: a host derives the whole array from its own value on every
 * render, and a controller stamps it onto the elements. A host with more to say about its units
 * extends the type and gets its own segments back from every callback.
 */
export type InputSegment = LiteralSegment | EditableSegment

/** A separator between two units: shown, never focused, hidden from assistive technology. */
export interface LiteralSegment {
	readonly key: string
	readonly editable: false
	readonly text: string
}

export interface EditableSegment {
	/** Identifies the segment within its group, e.g. "day" or "cell-3". */
	readonly key: string
	readonly editable: true
	/** What the element shows: the entered text, or the placeholder while unfilled. */
	readonly text: string
	/** Whether the unit has been entered. */
	readonly filled: boolean
	/** The most characters the segment holds. Decides when typing moves on. Defaults to one. */
	readonly capacity?: number
	/** The unit's own accessible name, e.g. "Monat" or "Digit 3 of 6". */
	readonly label?: string
	/** The `inputmode` of the segment's element, e.g. "numeric". Left off for units which take letters. */
	readonly inputMode?: string
}

export function isEditableSegment<TSegment extends InputSegment>(segment: TSegment): segment is TSegment & EditableSegment {
	return segment.editable
}

/** What a step key asks of a segment. */
export type SegmentedInputStep =
	| 'increment'
	| 'decrement'
	| 'incrementPage'
	| 'decrementPage'
	| 'min'
	| 'max'