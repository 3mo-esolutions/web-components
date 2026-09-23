import { component, Component, html, state } from '@a11d/lit'
import { ComponentTestFixture } from '@a11d/lit-testing'
import { type LanguageCode } from '@3mo/localization'
import '@3mo/date-time'
import { FieldDateTimePrecision } from '../FieldDateTimePrecision.js'
import { DateTimeSegmentsController, type DateTimeSegmentsControllerOptions } from './DateTimeSegmentsController.js'
import { type EditableDateTimeSegmentType } from './DateTimeSegment.js'

const utc = (isoDateTime: string) => DateTime.from(Date.parse(`${isoDateTime}.000Z`), 'gregory', 'UTC')
const reference = utc('2026-09-05T00:00:00')

@component('date-time-segments-test')
class DateTimeSegmentsTest extends Component {
	@state() value?: DateTime
	@state() precision = FieldDateTimePrecision.Day
	language: LanguageCode = 'de'
	calendar = 'gregory'
	referenceDate = reference
	disabled = false
	handleMoveBeyond?: DateTimeSegmentsControllerOptions['handleMoveBeyond']
	parseShortcut?: DateTimeSegmentsControllerOptions['parseShortcut']

	readonly changes = new Array<DateTime | undefined>()
	readonly inputs = new Array<DateTime | undefined>()

	readonly controller = new DateTimeSegmentsController(this, host => ({
		get value() { return host.value },
		get precision() { return host.precision },
		get referenceDate() { return host.referenceDate },
		get language() { return host.language },
		get calendar() { return host.calendar },
		get disabled() { return host.disabled },
		get handleMoveBeyond() { return host.handleMoveBeyond },
		get parseShortcut() { return host.parseShortcut },
		timeZone: 'UTC',
		label: 'Lieferdatum',
		handleInput: value => host.inputs.push(value),
		handleChange: value => { host.value = value; host.changes.push(value) },
	}))

	get group() { return this.shadowRoot!.querySelector('div')! }
	segment(key: EditableDateTimeSegmentType | `literal-${number}`) { return this.shadowRoot!.querySelector<HTMLElement>(`[data-segment=${key}]`)! }
	get texts() { return [...this.shadowRoot!.querySelectorAll<HTMLElement>('[data-segment]')].map(element => element.textContent) }
	get activeElement() { return this.shadowRoot!.activeElement }

	protected override get template() {
		return html`
			<div ${this.controller.group.ref()}>
				${this.controller.segments.map(segment => html`<span ${this.controller.segment.ref(segment)}></span>`)}
			</div>
		`
	}
}

describe('DateTimeSegmentsController', () => {
	const fixture = new ComponentTestFixture<DateTimeSegmentsTest>(html`<date-time-segments-test></date-time-segments-test>`)

	const host = () => fixture.component
	const controller = () => host().controller
	const group = () => host().group
	const segment = (key: EditableDateTimeSegmentType | `literal-${number}`) => host().segment(key)
	const texts = () => host().texts
	const activeElement = () => host().activeElement

	const setUp = async (changes: Partial<DateTimeSegmentsTest>) => {
		Object.assign(host(), changes)
		await fixture.update()
	}
	const setValue = (value: DateTime | undefined) => setUp({ value })

	// Headless Firefox raises no focus events for a programmatic focus, so the events a real focus raises are dispatched by hand.
	const focus = (element: HTMLElement) => {
		element.focus({ preventScroll: true })
		element.dispatchEvent(new FocusEvent('focus'))
		element.dispatchEvent(new FocusEvent('focusin', { bubbles: true }))
	}
	const leave = () => group().dispatchEvent(new FocusEvent('focusout', { bubbles: true, relatedTarget: null }))
	/** Enters the field, then lands on the wanted segment — an empty field always opens on its first one. */
	const enter = (element: HTMLElement) => {
		focus(element)
		focus(element)
	}
	const press = (element: HTMLElement, key: string, init: KeyboardEventInit = {}) => {
		const event = new KeyboardEvent('keydown', { key, bubbles: true, cancelable: true, ...init })
		element.dispatchEvent(event)
		return event
	}
	const type = (element: HTMLElement, characters: string) => [...characters].forEach(character => press(element, character))

	describe('stamping', () => {
		it('should stamp the group', () => {
			expect(group().getAttribute('role')).toBe('group')
			expect(group().getAttribute('aria-label')).toBe('Lieferdatum')
			expect(group().getAttribute('dir')).toBe('ltr')
			expect(group().hasAttribute('aria-description')).toBe(false)
		})

		it('should stamp every unit as a spinbutton named after the unit and the field', () => {
			const day = segment('day')
			expect(day.getAttribute('role')).toBe('spinbutton')
			expect(day.getAttribute('aria-label')).toBe('Tag, Lieferdatum')
			expect(day.getAttribute('aria-valuemin')).toBe('1')
			expect(day.getAttribute('aria-valuemax')).toBe('30')
			expect(day.hasAttribute('aria-valuenow')).toBe(false)
			expect(day.getAttribute('aria-valuetext')).toBe(String(t('Empty')))
			expect(day.hasAttribute('data-placeholder')).toBe(true)
			expect(day.getAttribute('inputmode')).toBe('numeric')
			expect(day.getAttribute('enterkeyhint')).toBe('next')
			expect(segment('month').getAttribute('aria-label')).toBe('Monat, Lieferdatum')
		})

		it('should hide the literals from assistive technology', () => {
			const literal = segment('literal-0')
			expect(literal.textContent).toBe('.')
			expect(literal.getAttribute('aria-hidden')).toBe('true')
			expect(literal.hasAttribute('role')).toBe(false)
		})

		it('should render placeholders while empty and keep a single tab stop', () => {
			expect(texts()).toEqual(['tt', '.', 'mm', '.', 'jjjj'])
			expect(segment('day').tabIndex).toBe(0)
			expect(segment('month').tabIndex).toBe(-1)
			expect(segment('year').tabIndex).toBe(-1)
		})

		it('should reflect the host value', async () => {
			await setValue(utc('2026-09-05T00:00:00'))

			expect(texts()).toEqual(['05', '.', '09', '.', '2026'])
			expect(segment('day').getAttribute('aria-valuenow')).toBe('5')
			expect(segment('day').getAttribute('aria-valuetext')).toBe('05')
			expect(segment('month').getAttribute('aria-valuetext')).toBe('September')
			expect(segment('day').hasAttribute('data-placeholder')).toBe(false)
			expect(group().getAttribute('aria-description')).toBe('05.09.2026')
			expect(controller().isComplete).toBe(true)
		})

		it('should regenerate the segments when the precision changes', async () => {
			await setUp({ precision: FieldDateTimePrecision.Minute })

			expect(texts()).toEqual(['tt', '.', 'mm', '.', 'jjjj', ', ', '--', ':', '--'])
		})

		it('should not be editable when disabled', async () => {
			await setUp({ disabled: true })

			expect(segment('day').hasAttribute('contenteditable')).toBe(false)
			expect(segment('day').tabIndex).toBe(-1)
			expect(group().getAttribute('aria-disabled')).toBe('true')

			focus(segment('day'))
			type(segment('day'), '12')
			leave()

			expect(host().changes).toEqual([])
		})

		it('should lay Persian numeric segments out left to right within a right-to-left group', async () => {
			await setUp({ language: 'fa', calendar: 'persian' })

			expect(group().getAttribute('dir')).toBe('rtl')
			expect(segment('year').style.direction).toBe('ltr')
			expect(segment('year').style.unicodeBidi).toBe('isolate')
		})
	})

	describe('entering the field', () => {
		// A press as the browser would deliver it: pointerdown first, then the focus it causes unless prevented.
		const pressOn = (element: HTMLElement) => {
			const event = new PointerEvent('pointerdown', { bubbles: true, cancelable: true, composed: true })
			element.dispatchEvent(event)
			if (!event.defaultPrevented) {
				focus(element)
			}
			return event
		}

		it('should start at the first segment when an empty field is pressed, whichever unit was hit', () => {
			const event = pressOn(segment('year'))

			expect(event.defaultPrevented).toBe(true)
			expect(activeElement()).toBe(segment('day'))
			expect(segment('day').tabIndex).toBe(0)
		})

		it('should stay on the pressed segment once the field shows a value', async () => {
			await setValue(utc('2026-09-05T00:00:00'))

			const event = pressOn(segment('year'))

			expect(event.defaultPrevented).toBe(false)
			expect(activeElement()).toBe(segment('year'))
		})

		it('should not redirect a press while the field is already focused', () => {
			pressOn(segment('day'))
			const event = pressOn(segment('year'))

			expect(event.defaultPrevented).toBe(false)
			expect(activeElement()).toBe(segment('year'))
		})

		it('should forget its place when left empty, so that the next entry starts at the first segment', () => {
			enter(segment('year'))
			leave()

			expect(segment('day').tabIndex).toBe(0)
			expect(segment('year').tabIndex).toBe(-1)
		})

		it('should remember its place when left with a value', () => {
			enter(segment('year'))
			type(segment('year'), '2026')
			leave()

			expect(segment('year').tabIndex).toBe(0)
		})
	})

	describe('typing', () => {
		it('should fill a unit from typed digits and advance once no further digit could fit', () => {
			const day = segment('day')
			focus(day)
			type(day, '05')

			expect(day.textContent).toBe('05')
			expect(day.hasAttribute('data-placeholder')).toBe(false)
			expect(activeElement()).toBe(segment('month'))
			expect(segment('month').tabIndex).toBe(0)
			expect(segment('day').tabIndex).toBe(-1)
		})

		it('should wait for a second digit only while one could still follow', () => {
			focus(segment('day'))
			type(segment('day'), '3')
			expect(segment('day').textContent).toBe('03')
			expect(activeElement()).toBe(segment('day'))

			type(segment('day'), '0')
			expect(segment('day').textContent).toBe('30')
			expect(activeElement()).toBe(segment('month'))

			type(segment('month'), '9')
			expect(segment('month').textContent).toBe('09')
			expect(activeElement()).toBe(segment('year'))
		})

		it('should report the value while typing once every unit is filled, and stay silent before', () => {
			focus(segment('day'))
			type(segment('day'), '05')
			type(segment('month'), '09')
			expect(host().inputs).toEqual([])

			type(segment('year'), '2026')

			expect(host().inputs.length).toBe(1)
			expect(host().inputs[0]!.valueOf()).toBe(utc('2026-09-05T00:00:00').valueOf())
			expect(host().changes).toEqual([])
		})

		it('should restart a unit with a digit which overflows it', () => {
			enter(segment('month'))
			type(segment('month'), '1')
			type(segment('month'), '3')

			expect(segment('month').textContent).toBe('03')
			expect(activeElement()).toBe(segment('year'))
		})

		it('should accept the language\'s own digits', async () => {
			await setUp({ language: 'fa', calendar: 'persian' })
			focus(segment('day'))
			type(segment('day'), '۱۲')

			expect(segment('day').textContent).toBe('۱۲')
			expect(segment('day').getAttribute('aria-valuenow')).toBe('12')
		})

		it('should advance on a typed separator', () => {
			focus(segment('day'))
			type(segment('day'), '3.')

			expect(activeElement()).toBe(segment('month'))
			expect(segment('day').textContent).toBe('03')
		})

		it('should ignore digits typed into the day period', async () => {
			await setUp({ language: 'en', precision: FieldDateTimePrecision.Minute, referenceDate: utc('2026-09-05T09:30:00') })
			enter(segment('dayPeriod'))
			type(segment('dayPeriod'), '09')

			expect(segment('dayPeriod').hasAttribute('data-placeholder')).toBe(true)
			expect(activeElement()).toBe(segment('dayPeriod'))
		})

		it('should flow characters entered at once into the segments they complete', () => {
			focus(segment('day'))
			segment('day').dispatchEvent(new InputEvent('beforeinput', { inputType: 'insertText', data: '05092026', bubbles: true, cancelable: true }))

			expect(texts()).toEqual(['05', '.', '09', '.', '2026'])
			expect(activeElement()).toBe(segment('year'))
		})

		it('should select the day period from its first letter', async () => {
			await setUp({ language: 'en', precision: FieldDateTimePrecision.Minute, referenceDate: utc('2026-09-05T09:30:00') })
			enter(segment('dayPeriod'))
			type(segment('dayPeriod'), 'p')
			leave()

			expect(host().changes[0]!.hour).toBe(21)
		})
	})

	describe('committing', () => {
		it('should complete the units left out from the reference date when the group is left', () => {
			focus(segment('day'))
			type(segment('day'), '12')
			leave()

			expect(host().changes.length).toBe(1)
			expect(host().changes[0]!.valueOf()).toBe(utc('2026-09-12T00:00:00').valueOf())
			expect(texts()).toEqual(['12', '.', '09', '.', '2026'])
		})

		it('should complete and commit on Enter', () => {
			focus(segment('day'))
			type(segment('day'), '12')
			press(segment('day'), 'Enter')

			expect(host().changes[0]!.valueOf()).toBe(utc('2026-09-12T00:00:00').valueOf())
		})

		it('should not commit anything when nothing was entered', () => {
			focus(segment('day'))
			leave()

			expect(host().changes).toEqual([])
		})

		it('should normalize the value to the precision', async () => {
			await setUp({ precision: FieldDateTimePrecision.Month, referenceDate: utc('2026-09-05T14:07:00') })
			focus(segment('month'))
			type(segment('month'), '03')
			leave()

			expect(host().changes[0]!.valueOf()).toBe(utc('2026-03-01T00:00:00').valueOf())
		})

		it('should clear the value when every unit was emptied', async () => {
			await setValue(utc('2026-09-05T00:00:00'))
			for (const type of ['day', 'month', 'year'] as const) {
				focus(segment(type))
				press(segment(type), 'Backspace')
			}
			expect(texts()).toEqual(['tt', '.', 'mm', '.', 'jjjj'])
			leave()

			expect(host().changes).toEqual([undefined])
			expect(host().value).toBeUndefined()
		})

		it('should clear through the API', async () => {
			await setValue(utc('2026-09-05T00:00:00'))
			controller().clear()

			expect(host().changes).toEqual([undefined])
			expect(controller().isEmpty).toBe(true)
		})
	})

	describe('keys', () => {
		beforeEach(() => setValue(utc('2026-01-31T00:00:00')))

		it('should step a unit with the arrow keys, constraining the day', () => {
			focus(segment('month'))
			press(segment('month'), 'ArrowUp')

			expect(texts()).toEqual(['28', '.', '02', '.', '2026'])
			expect(host().inputs[0]!.valueOf()).toBe(utc('2026-02-28T00:00:00').valueOf())
		})

		it('should wrap at the limits', () => {
			focus(segment('day'))
			press(segment('day'), 'ArrowUp')
			expect(segment('day').textContent).toBe('01')

			press(segment('day'), 'ArrowDown')
			expect(segment('day').textContent).toBe('31')
		})

		it('should page with PageUp and PageDown and jump with Home and End', () => {
			focus(segment('year'))
			press(segment('year'), 'PageUp')
			expect(segment('year').textContent).toBe('2031')

			press(segment('day'), 'Home')
			expect(segment('day').textContent).toBe('01')

			press(segment('day'), 'End')
			expect(segment('day').textContent).toBe('31')
		})

		it('should fill an empty unit with its placeholder value on the first arrow press', async () => {
			await setValue(undefined)
			focus(segment('month'))
			press(segment('month'), 'ArrowUp')

			expect(segment('month').textContent).toBe('09')
			expect(segment('month').hasAttribute('data-placeholder')).toBe(false)
		})

		it('should move between units with the arrow keys', () => {
			focus(segment('day'))
			press(segment('day'), 'ArrowRight')
			expect(activeElement()).toBe(segment('month'))

			press(segment('month'), 'ArrowLeft')
			expect(activeElement()).toBe(segment('day'))
		})

		it('should empty a unit with Backspace and move back from an empty one', () => {
			focus(segment('month'))
			press(segment('month'), 'Backspace')
			expect(segment('month').textContent).toBe('mm')
			expect(host().changes).toEqual([])

			press(segment('month'), 'Backspace')
			expect(activeElement()).toBe(segment('day'))
		})

		it('should remove the last typed digit with Backspace', () => {
			focus(segment('year'))
			type(segment('year'), '202')
			press(segment('year'), 'Backspace')

			expect(segment('year').textContent).toBe('20')
		})

		it('should leave a modified key to the host', () => {
			focus(segment('day'))
			const event = press(segment('day'), 'ArrowDown', { altKey: true })

			expect(event.defaultPrevented).toBe(false)
			expect(segment('day').textContent).toBe('31')
		})

		it('should report a move past the outermost segments to the host', async () => {
			const moves: Array<number> = []
			await setUp({ handleMoveBeyond: direction => moves.push(direction) })
			enter(segment('year'))
			press(segment('year'), 'ArrowRight')
			focus(segment('day'))
			press(segment('day'), 'ArrowLeft')

			expect(moves).toEqual([1, -1])
		})

		it('should leave Tab to the browser', () => {
			focus(segment('day'))
			const event = press(segment('day'), 'Tab')

			expect(event.defaultPrevented).toBe(false)
		})
	})

	describe('shortcuts', () => {
		it('should replace the whole value with a keyword on Enter', () => {
			focus(segment('month'))
			type(segment('month'), '+1')
			press(segment('month'), 'Enter')

			expect(host().changes[0]!.valueOf()).toBe(utc('2026-09-06T00:00:00').valueOf())
			expect(texts()).toEqual(['06', '.', '09', '.', '2026'])
		})

		it('should show the pending shortcut on the group and apply it once typing pauses', () => {
			vi.useFakeTimers()
			try {
				focus(segment('day'))
				type(segment('day'), '+2')
				expect(group().getAttribute('data-shortcut')).toBe('+2')
				expect(host().changes).toEqual([])

				vi.advanceTimersByTime(700)

				expect(host().changes[0]!.valueOf()).toBe(utc('2026-09-07T00:00:00').valueOf())
				expect(group().hasAttribute('data-shortcut')).toBe(false)
			} finally {
				vi.useRealTimers()
			}
		})

		it('should cancel a shortcut with Escape', () => {
			focus(segment('day'))
			type(segment('day'), 'h')
			press(segment('day'), 'Escape')
			press(segment('day'), 'Enter')

			expect(host().changes).toEqual([])
		})

		it('should ignore a shortcut nothing can parse', () => {
			focus(segment('day'))
			type(segment('day'), 'xyz')
			press(segment('day'), 'Enter')

			expect(host().changes).toEqual([])
			expect(texts()).toEqual(['tt', '.', 'mm', '.', 'jjjj'])
		})

		it('should parse pasted text', context => {
			const clipboardData = new DataTransfer()
			clipboardData.setData('text/plain', '2026-12-24')
			const event = new ClipboardEvent('paste', { clipboardData, bubbles: true, cancelable: true })
			if (event.clipboardData?.getData('text/plain') !== '2026-12-24') {
				// Firefox hands out no data from a synthetic ClipboardEvent.
				context.skip('Synthetic clipboard data is unsupported in this engine')
				return
			}
			group().dispatchEvent(event)

			expect(host().changes[0]!.valueOf()).toBe(utc('2026-12-24T00:00:00').valueOf())
		})

		it('should let the host resolve shortcuts itself', async () => {
			await setUp({ parseShortcut: text => text === 'x' ? utc('2030-01-01T00:00:00') : undefined })
			focus(segment('day'))
			type(segment('day'), 'x')
			press(segment('day'), 'Enter')

			expect(host().changes[0]!.valueOf()).toBe(utc('2030-01-01T00:00:00').valueOf())
		})
	})
})