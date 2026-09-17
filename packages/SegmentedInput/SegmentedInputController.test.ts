import { component, Component, html } from '@a11d/lit'
import { ComponentTestFixture } from '@a11d/lit-testing'
import { SegmentedInputController, type SegmentedInputControllerOptions } from './SegmentedInputController.js'
import { type EditableSegment, type InputSegment } from './InputSegment.js'

/** `#` takes a digit, `A` a letter, anything else separates; a run of one token is one unit. */
const segmentsOf = (pattern: string, texts: ReadonlyMap<string, string>) => {
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

@component('segmented-input-test')
class SegmentedInputTest extends Component {
	pattern = '##/####'
	direction: 'ltr' | 'rtl' = 'ltr'
	disabled = false
	readonly = false
	description?: string
	isComplete?: SegmentedInputControllerOptions['isComplete']
	stamp?: SegmentedInputControllerOptions['stamp']
	/** `undefined` leaves the option out. */
	shortcuts?: Array<string> = []
	steps?: Array<string> = []
	pasted?: Array<string>

	readonly texts = new Map<string, string>()
	readonly moves = new Array<number>()
	readonly focusChanges = new Array<boolean>()
	commits = 0

	readonly controller = new SegmentedInputController(this, host => ({
		label: 'Expiry',
		get segments() { return segmentsOf(host.pattern, host.texts) },
		get direction() { return host.direction },
		get disabled() { return host.disabled },
		get readonly() { return host.readonly },
		get description() { return host.description },
		get isComplete() { return host.isComplete },
		get stamp() { return host.stamp },
		accept: (segment, typed, character) => (segment.inputMode === 'numeric' ? /\d/ : /\p{L}/u).test(character) ? typed + character : undefined,
		handleSegmentInput: (segment, text) => { text ? host.texts.set(segment.key, text) : host.texts.delete(segment.key) },
		handleCommit: () => host.commits++,
		handleMoveBeyond: direction => host.moves.push(direction),
		handleFocusChange: focused => host.focusChanges.push(focused),
		get handleShortcut() { return host.shortcuts && ((text: string) => { host.shortcuts!.push(text); return true }) },
		get handleStep() { return host.steps && ((segment: EditableSegment, step: string) => { host.steps!.push(`${segment.key}:${step}`) }) },
		get handlePaste() { return host.pasted && ((text: string) => { host.pasted!.push(text); return true }) },
	}))

	get group() { return this.renderRoot.querySelector('div')! }
	segment(key: string) { return this.renderRoot.querySelector<HTMLElement>(`[data-segment=${key}]`)! }
	get segmentTexts() { return [...this.renderRoot.querySelectorAll<HTMLElement>('[data-segment]')].map(element => element.textContent) }
	get activeElement() { return this.shadowRoot!.activeElement }

	protected override get template() {
		return html`
			<div ${this.controller.group.ref()}>
				${this.controller.segments.map(segment => html`<span ${this.controller.segment.ref(segment)}></span>`)}
			</div>
		`
	}
}

describe('SegmentedInputController', () => {
	const fixture = new ComponentTestFixture<SegmentedInputTest>(html`<segmented-input-test></segmented-input-test>`)

	const host = () => fixture.component
	const controller = () => host().controller
	const group = () => host().group
	const segment = (key: string) => host().segment(key)
	const texts = () => host().segmentTexts
	const activeElement = () => host().activeElement

	const setUp = async (changes: Partial<SegmentedInputTest>) => {
		Object.assign(host(), changes)
		await fixture.update()
	}

	// Headless Firefox raises no focus events for a programmatic focus, so a real focus's events are dispatched by hand.
	const focus = (element: HTMLElement) => {
		element.focus({ preventScroll: true })
		element.dispatchEvent(new FocusEvent('focus'))
		element.dispatchEvent(new FocusEvent('focusin', { bubbles: true }))
	}
	const press = (element: HTMLElement, key: string, init: KeyboardEventInit = {}) => {
		const event = new KeyboardEvent('keydown', { key, bubbles: true, cancelable: true, ...init })
		element.dispatchEvent(event)
		return event
	}
	const type = (element: HTMLElement, characters: string) => [...characters].forEach(character => press(element, character))
	const leave = () => group().dispatchEvent(new FocusEvent('focusout', { bubbles: true, relatedTarget: null }))

	describe('stamping', () => {
		it('should stamp the group', () => {
			expect(group().getAttribute('role')).toBe('group')
			expect(group().getAttribute('aria-label')).toBe('Expiry')
			expect(group().getAttribute('dir')).toBe('ltr')
		})

		it('should describe the group', async () => {
			await setUp({ description: 'December 2026' })

			expect(group().getAttribute('aria-description')).toBe('December 2026')
		})

		it('should stamp every editable segment', () => {
			const first = segment('segment-0')
			expect(first.getAttribute('aria-label')).toBe('Expiry')
			expect(first.getAttribute('contenteditable')).toBe('plaintext-only')
			expect(first.getAttribute('inputmode')).toBe('numeric')
			expect(first.getAttribute('enterkeyhint')).toBe('next')
			expect(first.hasAttribute('data-placeholder')).toBe(true)
			expect(first.tabIndex).toBe(0)
			expect(segment('segment-1').tabIndex).toBe(-1)
		})

		it('should make a segment a spinbutton when the host steps and a textbox otherwise', async () => {
			expect(segment('segment-0').getAttribute('role')).toBe('spinbutton')

			await setUp({ steps: undefined })

			expect(segment('segment-0').getAttribute('role')).toBe('textbox')
		})

		it('should hide the literals from assistive technology', () => {
			expect(segment('literal-0').textContent).toBe('/')
			expect(segment('literal-0').getAttribute('aria-hidden')).toBe('true')
			expect(segment('literal-0').hasAttribute('role')).toBe(false)
		})

		it('should render the placeholders while empty', () => {
			expect(texts()).toEqual(['##', '/', '####'])
		})

		it('should let the host stamp its own attributes', async () => {
			await setUp({ stamp: (element, segment) => element.setAttribute('data-capacity', String(segment.capacity)) })

			expect(segment('segment-0').getAttribute('data-capacity')).toBe('2')
		})

		it('should mark a right-to-left group and isolate its numeric segments', async () => {
			await setUp({ direction: 'rtl' })

			expect(group().getAttribute('dir')).toBe('rtl')
			expect(segment('segment-0').style.direction).toBe('ltr')
			expect(segment('segment-0').style.unicodeBidi).toBe('isolate')
		})

		it('should not be editable when disabled', async () => {
			await setUp({ disabled: true })
			focus(segment('segment-0'))
			type(segment('segment-0'), '12')

			expect(host().texts.size).toBe(0)
			expect(segment('segment-0').hasAttribute('contenteditable')).toBe(false)
			expect(segment('segment-0').tabIndex).toBe(-1)
			expect(group().getAttribute('aria-disabled')).toBe('true')
		})

		it('should stay focusable but not editable when readonly', async () => {
			await setUp({ readonly: true })
			focus(segment('segment-0'))
			type(segment('segment-0'), '12')

			expect(host().texts.size).toBe(0)
			expect(segment('segment-0').getAttribute('aria-readonly')).toBe('true')
			expect(segment('segment-0').hasAttribute('contenteditable')).toBe(false)
			expect(segment('segment-0').tabIndex).toBe(0)
		})
	})

	describe('typing', () => {
		it('should fill a segment and advance once it is full', () => {
			focus(segment('segment-0'))
			type(segment('segment-0'), '12')

			expect(segment('segment-0').textContent).toBe('12')
			expect(segment('segment-0').hasAttribute('data-placeholder')).toBe(false)
			expect(activeElement()).toBe(segment('segment-1'))
			expect(segment('segment-1').tabIndex).toBe(0)
		})

		it('should stay while the segment could still take another character', () => {
			focus(segment('segment-0'))
			type(segment('segment-0'), '1')

			expect(segment('segment-0').textContent).toBe('1')
			expect(activeElement()).toBe(segment('segment-0'))
		})

		it('should refuse a character the host does not accept', async () => {
			await setUp({ shortcuts: undefined })
			focus(segment('segment-0'))
			type(segment('segment-0'), 'x1')

			expect(segment('segment-0').textContent).toBe('1')
		})

		it('should restart a segment with a character beyond its capacity', async () => {
			await setUp({ isComplete: () => false })
			focus(segment('segment-0'))
			type(segment('segment-0'), '123')

			expect(segment('segment-0').textContent).toBe('3')
			expect(activeElement()).toBe(segment('segment-0'))
		})

		it('should flow characters entered at once through the segments they fill', () => {
			focus(segment('segment-0'))
			segment('segment-0').dispatchEvent(new InputEvent('beforeinput', { inputType: 'insertText', data: '122026', bubbles: true, cancelable: true }))

			expect(texts()).toEqual(['12', '/', '2026'])
			expect(activeElement()).toBe(segment('segment-1'))
		})

		it('should advance on a typed separator', () => {
			focus(segment('segment-0'))
			type(segment('segment-0'), '1/')

			expect(activeElement()).toBe(segment('segment-1'))
		})

		it('should take the separators from the literals of the group', async () => {
			await setUp({ pattern: '##.##.####' })
			focus(segment('segment-0'))
			type(segment('segment-0'), '1.')
			expect(activeElement()).toBe(segment('segment-1'))

			type(segment('segment-1'), '1/')
			expect(activeElement()).toBe(segment('segment-1'))
		})

		it('should fill a letter segment and advance from it', async () => {
			await setUp({ pattern: 'A#' })
			focus(segment('segment-0'))
			type(segment('segment-0'), 'a')

			expect(segment('segment-0').textContent).toBe('a')
			expect(activeElement()).toBe(segment('segment-1'))
		})

		it('should put its text back after a composition', () => {
			focus(segment('segment-0'))
			segment('segment-0').textContent = 'ab'
			segment('segment-0').dispatchEvent(new InputEvent('input', { inputType: 'insertCompositionText', bubbles: true }))

			expect(segment('segment-0').textContent).toBe('##')
		})
	})

	describe('keys', () => {
		it('should move between segments with the arrow keys', () => {
			focus(segment('segment-0'))
			press(segment('segment-0'), 'ArrowRight')
			expect(activeElement()).toBe(segment('segment-1'))

			press(segment('segment-1'), 'ArrowLeft')
			expect(activeElement()).toBe(segment('segment-0'))
		})

		it('should reverse the arrow keys in a right-to-left group', async () => {
			await setUp({ direction: 'rtl' })
			focus(segment('segment-0'))
			press(segment('segment-0'), 'ArrowLeft')

			expect(activeElement()).toBe(segment('segment-1'))
		})

		it('should report a step to the host', () => {
			focus(segment('segment-0'))
			press(segment('segment-0'), 'ArrowUp')
			press(segment('segment-0'), 'PageDown')
			press(segment('segment-0'), 'Home')
			press(segment('segment-0'), 'End')

			expect(host().steps).toEqual(['segment-0:increment', 'segment-0:decrementPage', 'segment-0:min', 'segment-0:max'])
		})

		it('should leave the step keys alone when the host does not step', async () => {
			await setUp({ steps: undefined })
			focus(segment('segment-0'))
			const event = press(segment('segment-0'), 'ArrowUp')

			expect(event.defaultPrevented).toBe(false)
		})

		it('should leave modified keys to the host', () => {
			focus(segment('segment-0'))
			const event = press(segment('segment-0'), 'ArrowDown', { altKey: true })

			expect(event.defaultPrevented).toBe(false)
			expect(host().steps).toEqual([])
		})

		it('should empty a segment with Backspace and move back from an empty one', () => {
			focus(segment('segment-0'))
			type(segment('segment-0'), '12')
			focus(segment('segment-0'))

			press(segment('segment-0'), 'Backspace')
			expect(segment('segment-0').textContent).toBe('##')
			expect(host().texts.has('segment-0')).toBe(false)

			press(segment('segment-0'), 'Backspace')
			expect(host().moves).toEqual([-1])
		})

		it('should remove the last typed character with Backspace', () => {
			focus(segment('segment-1'))
			type(segment('segment-1'), '202')
			press(segment('segment-1'), 'Backspace')

			expect(segment('segment-1').textContent).toBe('20')
		})

		it('should report a move past the outermost segments', () => {
			focus(segment('segment-1'))
			press(segment('segment-1'), 'ArrowRight')
			focus(segment('segment-0'))
			press(segment('segment-0'), 'ArrowLeft')

			expect(host().moves).toEqual([1, -1])
		})

		it('should leave Tab to the browser', () => {
			focus(segment('segment-0'))

			expect(press(segment('segment-0'), 'Tab').defaultPrevented).toBe(false)
		})

		it('should commit on Enter and on leaving', () => {
			focus(segment('segment-0'))
			press(segment('segment-0'), 'Enter')
			expect(host().commits).toBe(1)

			leave()
			expect(host().commits).toBe(2)
		})
	})

	describe('entering and leaving the field', () => {
		const pressOn = (element: HTMLElement) => {
			const event = new PointerEvent('pointerdown', { bubbles: true, cancelable: true, composed: true })
			element.dispatchEvent(event)
			if (!event.defaultPrevented) {
				focus(element)
			}
			return event
		}

		it('should start at the first segment when an empty field is pressed', () => {
			const event = pressOn(segment('segment-1'))

			expect(event.defaultPrevented).toBe(true)
			expect(activeElement()).toBe(segment('segment-0'))
		})

		it('should stay on the pressed segment once the field shows a value', () => {
			focus(segment('segment-0'))
			type(segment('segment-0'), '12')
			leave()

			const event = pressOn(segment('segment-1'))

			expect(event.defaultPrevented).toBe(false)
			expect(activeElement()).toBe(segment('segment-1'))
		})

		it('should report the focus entering and leaving the group once each', () => {
			focus(segment('segment-0'))
			focus(segment('segment-1'))
			leave()

			expect(host().focusChanges).toEqual([true, false])
		})
	})

	describe('shortcuts', () => {
		it('should buffer letters and hand them over on Enter', () => {
			focus(segment('segment-0'))
			type(segment('segment-0'), 'now')
			expect(group().getAttribute('data-shortcut')).toBe('now')
			expect(host().shortcuts).toEqual([])

			press(segment('segment-0'), 'Enter')

			expect(host().shortcuts).toEqual(['now'])
			expect(group().hasAttribute('data-shortcut')).toBe(false)
		})

		it('should hand a shortcut over after typing pauses', () => {
			vi.useFakeTimers()
			try {
				focus(segment('segment-0'))
				type(segment('segment-0'), '+2')
				vi.advanceTimersByTime(SegmentedInputController.shortcutTimeout)

				expect(host().shortcuts).toEqual(['+2'])
			} finally {
				vi.useRealTimers()
			}
		})

		it('should cancel a shortcut with Escape', () => {
			focus(segment('segment-0'))
			type(segment('segment-0'), 'now')
			press(segment('segment-0'), 'Escape')
			press(segment('segment-0'), 'Enter')

			expect(host().shortcuts).toEqual([])
		})

		it('should ignore letters when the host takes no shortcuts', async () => {
			await setUp({ shortcuts: undefined })
			focus(segment('segment-0'))
			type(segment('segment-0'), 'now')

			expect(group().hasAttribute('data-shortcut')).toBe(false)
		})
	})

	describe('paste', () => {
		const paste = (text: string) => {
			const clipboardData = new DataTransfer()
			clipboardData.setData('text/plain', text)
			const event = new ClipboardEvent('paste', { clipboardData, bubbles: true, cancelable: true })
			if (event.clipboardData?.getData('text/plain') !== text) {
				return undefined
			}
			group().dispatchEvent(event)
			return event
		}

		it('should hand the whole clipboard text to the host', async context => {
			await setUp({ pasted: [] })

			if (!paste('12/2026')) {
				context.skip('Synthetic clipboard data is unsupported in this engine')
				return
			}

			expect(host().pasted).toEqual(['12/2026'])
		})

		it('should fall back to the shortcut when the host takes no paste', context => {
			if (!paste('tomorrow')) {
				context.skip('Synthetic clipboard data is unsupported in this engine')
				return
			}

			expect(host().shortcuts).toEqual(['tomorrow'])
		})
	})

	describe('api', () => {
		it('should report what is empty and complete', () => {
			expect(controller().isEmpty).toBe(true)
			expect(controller().isComplete).toBe(false)

			focus(segment('segment-0'))
			type(segment('segment-0'), '12')
			type(segment('segment-1'), '2026')

			expect(controller().isEmpty).toBe(false)
			expect(controller().isComplete).toBe(true)
		})

		it('should report what is typed but does not yet fill the segment', () => {
			focus(segment('segment-1'))
			type(segment('segment-1'), '20')

			expect(controller().typedText).toBe('20')
		})

		it('should focus the first and the last segment', () => {
			controller().focusLast()
			expect(activeElement()).toBe(segment('segment-1'))

			controller().focusFirst()
			expect(activeElement()).toBe(segment('segment-0'))
		})

		it('should type into a segment through the API', () => {
			controller().focusFirst()
			controller().type(controller().editableSegments[0]!, '07')

			expect(segment('segment-0').textContent).toBe('07')
		})
	})
})