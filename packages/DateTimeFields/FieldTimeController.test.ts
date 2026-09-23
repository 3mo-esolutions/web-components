import { Component, component, html, property } from '@a11d/lit'
import { ComponentTestFixture } from '@a11d/lit-testing'
import { FieldTimeController } from './FieldTimeController.js'
import { FieldDateTimePrecision } from './FieldDateTimePrecision.js'
import '@3mo/date-time'

@component('test-field-time-controller')
class TestFieldTimeController extends Component {
	@property() value?: string
	@property({ type: Boolean }) required = false
	@property({ type: Object }) precision = FieldDateTimePrecision.Minute
	@property({ type: Boolean }) hasPicker = false
	opened = 0
	readonly changes = new Array<string | undefined>()

	readonly controller = new FieldTimeController(this, host => ({
		hourCycle: 'h23',
		referenceDate: DateTime.from(Date.parse('2026-09-05T08:00:00.000Z'), 'gregory', 'UTC'),
		get value() { return host.value },
		get precision() { return host.precision },
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

describe('FieldTimeController', () => {
	const fixture = new ComponentTestFixture<TestFieldTimeController>(html`<test-field-time-controller></test-field-time-controller>`)

	const segment = (type: string) => fixture.component.renderRoot.querySelector<HTMLElement>(`[data-segment=${type}]`)!
	const focus = (element: HTMLElement) => {
		element.focus({ preventScroll: true })
		element.dispatchEvent(new FocusEvent('focus'))
		element.dispatchEvent(new FocusEvent('focusin', { bubbles: true }))
	}
	const press = (element: HTMLElement, key: string, init: KeyboardEventInit = {}) => {
		const event = new KeyboardEvent('keydown', { key, bubbles: true, composed: true, cancelable: true, ...init })
		element.dispatchEvent(event)
		return event
	}
	const type = (element: HTMLElement, characters: string) => [...characters].forEach(key => press(element, key))
	const leave = () => segment('hour').parentElement!.dispatchEvent(new FocusEvent('focusout', { bubbles: true, relatedTarget: null }))

	it('should stamp the segments of a host of its own', () => {
		expect(segment('hour').getAttribute('role')).toBe('spinbutton')
		expect(segment('minute').getAttribute('role')).toBe('spinbutton')
		expect(segment('dayPeriod')).toBeNull()
	})

	it('should read the value onto the reference day', async () => {
		fixture.component.value = '14:07'
		await fixture.updateComplete

		expect(fixture.component.controller.selectedDate?.hour).toBe(14)
		expect(fixture.component.controller.selectedDate?.minute).toBe(7)
		expect(fixture.component.controller.selectedDate?.day).toBe(5)
		expect(segment('hour').textContent).toBe('14')
	})

	it('should hand typed units on as HH:mm', async () => {
		focus(segment('hour'))
		type(segment('hour'), '09')
		type(segment('minute'), '30')
		leave()
		await fixture.updateComplete

		expect(fixture.component.changes).toEqual(['09:30'])
	})

	it('should hand a picked time on at the precision', async () => {
		fixture.component.controller.pick(fixture.component.controller.navigationDate.with({ hour: 7, minute: 5, second: 9 }))
		fixture.component.precision = FieldDateTimePrecision.Second
		await fixture.updateComplete
		fixture.component.controller.pick(fixture.component.controller.navigationDate.with({ hour: 7, minute: 5, second: 9 }))

		expect(fixture.component.changes).toEqual(['07:05', '07:05:09'])
	})

	it('should move the picker back to the value whenever the value changes', async () => {
		fixture.component.value = '10:00'
		await fixture.updateComplete
		fixture.component.controller.navigationDate = fixture.component.controller.navigationDate.with({ hour: 3 })

		expect(fixture.component.controller.navigationDate.hour).toBe(3)

		fixture.component.value = '18:30'
		await fixture.updateComplete

		expect(fixture.component.controller.navigationDate.hour).toBe(18)
	})

	it('should open the picker on Alt+ArrowDown only when the host has one', async () => {
		fixture.component.value = '14:07'
		await fixture.updateComplete
		focus(segment('hour'))

		expect(press(segment('hour'), 'ArrowDown', { altKey: true }).defaultPrevented).toBe(false)
		expect(fixture.component.opened).toBe(0)

		fixture.component.hasPicker = true
		await fixture.updateComplete

		expect(press(segment('hour'), 'ArrowDown', { altKey: true }).defaultPrevented).toBe(true)
		expect(fixture.component.opened).toBe(1)
		expect(fixture.component.value).toBe('14:07')
	})

	it('should report the validity of a required and a custom-invalid field', async () => {
		expect(fixture.component.controller.checkValidity()).toBe(true)

		fixture.component.required = true
		await fixture.updateComplete

		expect(fixture.component.controller.checkValidity()).toBe(false)

		fixture.component.value = '08:00'
		await fixture.updateComplete

		expect(fixture.component.controller.checkValidity()).toBe(true)

		fixture.component.controller.setCustomValidity('Too early')

		expect(fixture.component.controller.checkValidity()).toBe(false)
	})

	it('should be populated by a value or by units typed on the way to one', async () => {
		expect(fixture.component.controller.isPopulated).toBe(false)

		focus(segment('hour'))
		press(segment('hour'), '1')
		await fixture.updateComplete

		expect(fixture.component.controller.isPopulated).toBe(true)
	})
})