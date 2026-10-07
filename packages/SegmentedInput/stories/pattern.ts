import type { EditableSegment, InputSegment } from '@3mo/segmented-input'

/**
 * The segments of a pattern in which `#` takes a digit, `A` a letter and anything else separates; a run of one token is one unit.
 * The entered texts are the host's, under each unit's key.
 */
export function segmentsOf(pattern: string, texts: ReadonlyMap<string, string>) {
	let units = 0
	let literals = 0
	return (pattern.match(/(.)\1*/g) ?? []).map((run): InputSegment => {
		if (run[0] !== '#' && run[0] !== 'A') {
			return { key: `literal-${literals++}`, editable: false, text: run }
		}
		const key = `segment-${units++}`
		const text = texts.get(key) ?? ''
		return { key, editable: true, text: text || run, filled: !!text, capacity: run.length, inputMode: run[0] === '#' ? 'numeric' : undefined }
	})
}

/** Whether the unit takes the character: a digit for a numeric one, a letter otherwise. */
export function takes(segment: EditableSegment, character: string) {
	return (segment.inputMode === 'numeric' ? /\d/ : /\p{L}/u).test(character)
}
