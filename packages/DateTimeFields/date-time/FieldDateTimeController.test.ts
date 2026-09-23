import { Component, component, html, property } from '@a11d/lit'
import { ComponentTestFixture } from '@a11d/lit-testing'
import { FieldDateTimeController } from './FieldDateTimeController.js'
import { FieldDateTimePrecision } from '../FieldDateTimePrecision.js'
import '@3mo/date-time'

const utc = (isoDateTime: string) => DateTime.from(Date.parse(`${isoDateTime}.000Z`), 'gregory', 'UTC')

@component('test-field-date-time-controller')
class TestFieldDateTimeController extends Component {
	@property({ type: Object }) value?: Date
	@property({ type: Object }) precision = FieldDateTimePrecision.Day
	@property({ type: Object }) max?: DateTime
	@property({ type: Boolean }) required = false
	@property({ type: Boolean }) hasPicker = false
	opened = 0
	readonly changes = new Array<Date | undefined>()

	readonly controller = new FieldDateTimeController(this, host => ({
		referenceDate: utc('2026-09-05T08:00:00'),
		get value() { return host.value },
		get precision() { return host.precision },
		get max() { return host.max },
		get required() { return host.required },
		get handlePickerOpen() { return host.hasPicker ? () => host.opened++ : undefined },
		handleChange: value => {
			host.changes.push(value)
			host.value = value
		},
	}))

	protected override get template() {
		return html`
			<div ${this.controller.group.ref()}>
				${this.controller.segments.segments.map(segment => html`<span ${this.controller.segment.ref(segment)}></span>`)}
			</div>
		`
	}
}

describe('FieldDateTimeController', () => {
	const fixture = new ComponentTestFixture<TestFieldDateTimeController>(html`<test-field-date-time-controller></test-field-date-time-controller>`)

	const segment = (type: string) => fixture.component.renderRoot.querySelector<HTMLElement>(`[data-segment=${type}]`)
	const press = (element: HTMLElement, key: string, init: KeyboardEventInit = {}) => {
		const event = new KeyboardEvent('keydown', { key, bubbles: true, cancelable: true, ...init })
		element.dispatchEvent(event)
		return event
	}

	it('should stamp a spinbutton per unit of the precision on a host of its own', async () => {
		expect(segment('day')!.getAttribute('role')).toBe('spinbutton')
		expect(segment('month')).not.toBeNull()
		expect(segment('hour')).toBeNull()

		fixture.component.precision = FieldDateTimePrecision.Minute
		await fixture.updateComplete

		expect(segment('hour')).not.toBeNull()
		expect(segment('minute')).not.toBeNull()
	})

	it('should keep the time the picker stands at when a day is picked', async () => {
		fixture.component.precision = FieldDateTimePrecision.Minute
		await fixture.updateComplete
		fixture.component.controller.navigationDate = utc('2025-05-19T14:37:52')

		fixture.component.controller.pick(utc('2025-06-02T00:00:00'))

		expect(fixture.component.changes.map(date => date?.valueOf())).toEqual([utc('2025-06-02T14:37:00').valueOf()])
	})

	it('should start the value at the unit of the precision', () => {
		fixture.component.controller.navigationDate = utc('2025-05-19T14:37:52')

		fixture.component.controller.pick(utc('2025-05-21T00:00:00'))

		expect(fixture.component.value?.valueOf()).toBe(utc('2025-05-21T00:00:00').valueOf())
	})

	it('should move the picker to the value whenever the value changes', async () => {
		fixture.component.controller.navigationDate = utc('2020-01-01T00:00:00')
		fixture.component.value = utc('2025-05-19T00:00:00')
		await fixture.updateComplete

		expect(fixture.component.controller.navigationDate.valueOf()).toBe(utc('2025-05-19T00:00:00').valueOf())
	})

	it('should mark the value as a one-day range for a calendar', async () => {
		fixture.component.value = utc('2025-05-19T00:00:00')
		await fixture.updateComplete

		expect(fixture.component.controller.calendarValue?.start?.valueOf()).toBe(utc('2025-05-19T00:00:00').valueOf())
		expect(fixture.component.controller.calendarValue?.end?.valueOf()).toBe(utc('2025-05-19T00:00:00').valueOf())
	})

	describe('presets', () => {
		it('should offer four groups of days at day precision', () => {
			expect(fixture.component.controller.presets.map(group => group.length)).toEqual([3, 2, 2, 2])
		})

		it('should offer none coarser than a day', async () => {
			fixture.component.precision = FieldDateTimePrecision.Month
			await fixture.updateComplete

			expect(fixture.component.controller.presets).toEqual([])
		})

		it('should leave out the presets after the maximum', async () => {
			fixture.component.max = new DateTime().dayStart
			await fixture.updateComplete

			const labels = fixture.component.controller.presets.flat().map(preset => String(preset.label))

			expect(labels).toContain(String(t('Today')))
			expect(labels).not.toContain(String(t('Tomorrow')))
		})
	})

	describe('validity', () => {
		it('should be invalid while required and empty', async () => {
			fixture.component.required = true
			await fixture.updateComplete

			expect(fixture.component.controller.checkValidity()).toBe(false)

			fixture.component.value = utc('2025-05-19T00:00:00')
			await fixture.updateComplete

			expect(fixture.component.controller.checkValidity()).toBe(true)
		})

		it('should be invalid with a value after the maximum', async () => {
			fixture.component.max = utc('2025-05-18T00:00:00')
			fixture.component.value = utc('2025-05-19T00:00:00')
			await fixture.updateComplete

			expect(fixture.component.controller.isDisabled(utc('2025-05-19T00:00:00'))).toBe(true)
			expect(fixture.component.controller.checkValidity()).toBe(false)
		})

		it('should be invalid with a custom message', () => {
			fixture.component.controller.setCustomValidity('Taken')

			expect(fixture.component.controller.checkValidity()).toBe(false)
		})
	})

	it('should open the picker on Alt+ArrowDown only when the host has one', async () => {
		expect(press(segment('day')!, 'ArrowDown', { altKey: true }).defaultPrevented).toBe(false)

		fixture.component.hasPicker = true
		await fixture.updateComplete

		expect(press(segment('day')!, 'ArrowDown', { altKey: true }).defaultPrevented).toBe(true)
		expect(fixture.component.opened).toBe(1)
	})
})