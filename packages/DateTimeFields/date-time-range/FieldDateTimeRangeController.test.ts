import { Component, component, html, property } from '@a11d/lit'
import { ComponentTestFixture } from '@a11d/lit-testing'
import { FieldDateTimeRangeController } from './FieldDateTimeRangeController.js'
import { FieldDateTimePrecision } from '../FieldDateTimePrecision.js'
import type { DateTimeSegmentsController } from '../segments/index.js'
import '@3mo/date-time'

const utc = (isoDateTime: string) => DateTime.from(Date.parse(`${isoDateTime}.000Z`), 'gregory', 'UTC')

@component('test-field-date-time-range-controller')
class TestFieldDateTimeRangeController extends Component {
	@property({ type: Object }) value?: DateTimeRange
	@property({ type: Object }) precision = FieldDateTimePrecision.Day
	readonly changes = new Array<DateTimeRange | undefined>()

	readonly controller = new FieldDateTimeRangeController(this, host => ({
		referenceDate: utc('2020-06-15T00:00:00'),
		get value() { return host.value },
		get precision() { return host.precision },
		handleChange: value => {
			host.changes.push(value)
			host.value = value
		},
	}))

	protected override get template() {
		const group = (segments: DateTimeSegmentsController, range: string) => html`
			<div data-range=${range} ${segments.group.ref()}>
				${segments.segments.map(segment => html`<span ${segments.segment.ref(segment)}></span>`)}
			</div>
		`
		return html`
			${group(this.controller.startSegments, 'start')}
			${group(this.controller.endSegments, 'end')}
		`
	}
}

describe('FieldDateTimeRangeController', () => {
	const fixture = new ComponentTestFixture<TestFieldDateTimeRangeController>(html`<test-field-date-time-range-controller></test-field-date-time-range-controller>`)

	const segment = (range: 'start' | 'end', type: string) => fixture.component.renderRoot.querySelector<HTMLElement>(`[data-range=${range}] [data-segment=${type}]`)!
	const focus = (element: HTMLElement) => {
		element.focus({ preventScroll: true })
		element.dispatchEvent(new FocusEvent('focus'))
		element.dispatchEvent(new FocusEvent('focusin', { bubbles: true }))
	}
	const press = (element: HTMLElement, key: string) => element.dispatchEvent(new KeyboardEvent('keydown', { key, bubbles: true, cancelable: true }))
	const type = (element: HTMLElement, characters: string) => [...characters].forEach(key => press(element, key))
	const valueOf = (range?: DateTimeRange) => [range?.start?.valueOf(), range?.end?.valueOf()]

	it('should stamp a group of segments for each end on a host of its own', () => {
		expect(segment('start', 'day').getAttribute('role')).toBe('spinbutton')
		expect(segment('end', 'day').getAttribute('role')).toBe('spinbutton')
	})

	it('should select the end whose segments are entered', () => {
		expect(fixture.component.controller.selection).toBe('start')

		focus(segment('end', 'day'))

		expect(fixture.component.controller.selection).toBe('end')
	})

	it('should cross from the last start segment to the first end segment', () => {
		const starts = [...fixture.component.renderRoot.querySelectorAll<HTMLElement>('[data-range=start] [role=spinbutton]')]
		focus(starts.at(-1)!)

		press(starts.at(-1)!, 'ArrowRight')

		expect(fixture.component.shadowRoot!.activeElement).toBe(fixture.component.renderRoot.querySelector('[data-range=end] [role=spinbutton]'))
	})

	describe('picking', () => {
		it('should set the start, then move the selection on to the end', () => {
			fixture.component.controller.pick(utc('2025-05-10T00:00:00'), FieldDateTimePrecision.Day)

			expect(valueOf(fixture.component.value)).toEqual([utc('2025-05-10T00:00:00').valueOf(), undefined])
			expect(fixture.component.controller.selection).toBe('end')
		})

		it('should end the end at the end of the picked unit and keep the start', async () => {
			fixture.component.value = new DateTimeRange(utc('2025-05-10T00:00:00'), undefined)
			await fixture.updateComplete
			fixture.component.controller.selection = 'end'

			fixture.component.controller.pick(utc('2025-05-19T00:00:00'), FieldDateTimePrecision.Day)

			expect(valueOf(fixture.component.value)).toEqual([utc('2025-05-10T00:00:00').valueOf(), utc('2025-05-19T23:59:59').valueOf()])
			expect(fixture.component.controller.selection).toBe('start')
		})

		it('should keep the selection when a finer unit is picked', async () => {
			fixture.component.precision = FieldDateTimePrecision.Minute
			await fixture.updateComplete

			fixture.component.controller.pick(fixture.component.controller.navigationDate.with({ hour: 9 }), FieldDateTimePrecision.Hour)

			expect(fixture.component.controller.selection).toBe('start')
		})
	})

	it('should move the picker to the selected end', async () => {
		const start = utc('2025-05-10T00:00:00')
		const end = utc('2025-05-20T00:00:00')
		fixture.component.value = new DateTimeRange(start, end)
		await fixture.updateComplete

		expect(fixture.component.controller.navigationDate.valueOf()).toBe(start.valueOf())

		fixture.component.controller.selection = 'end'

		expect(fixture.component.controller.navigationDate.valueOf()).toBe(end.valueOf())
	})

	it('should set both ends from a range keyword typed into either end', async () => {
		focus(segment('end', 'day'))
		type(segment('end', 'day'), 'lw')
		press(segment('end', 'day'), 'Enter')
		await fixture.updateComplete

		expect(fixture.component.value?.start?.day).toBe(8)
		expect(fixture.component.value?.end?.day).toBe(14)
	})

	it('should offer the presets the precision allows', async () => {
		expect(fixture.component.controller.presets.map(group => group.length)).toEqual([6, 3, 3])

		fixture.component.precision = FieldDateTimePrecision.Year
		await fixture.updateComplete

		expect(fixture.component.controller.presets.map(group => group.length)).toEqual([3])
	})

	it('should be populated by either end', async () => {
		expect(fixture.component.controller.isPopulated).toBe(false)

		fixture.component.value = new DateTimeRange(undefined, utc('2025-05-20T00:00:00'))
		await fixture.updateComplete

		expect(fixture.component.controller.isPopulated).toBe(true)
	})
})