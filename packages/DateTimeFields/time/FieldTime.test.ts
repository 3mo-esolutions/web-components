import { html } from '@a11d/lit'
import { ComponentTestFixture } from '@a11d/lit-testing'
import { type FieldTime } from './FieldTime.js'
import { FieldDateTimePrecision } from '../FieldDateTimePrecision.js'
import '@3mo/date-time'
import '../index.js'

describe('FieldTime', () => {
	const fixture = new ComponentTestFixture<FieldTime>(html`<mo-field-time .pickerHidden=${true}></mo-field-time>`)

	const segment = (type: string) => fixture.component.renderRoot.querySelector<HTMLElement>(`[data-segment=${type}]`)!
	const focus = (element: HTMLElement) => {
		element.focus({ preventScroll: true })
		element.dispatchEvent(new FocusEvent('focus'))
		element.dispatchEvent(new FocusEvent('focusin', { bubbles: true }))
	}
	const type = (element: HTMLElement, characters: string) => [...characters].forEach(key => element.dispatchEvent(new KeyboardEvent('keydown', { key, bubbles: true, cancelable: true })))
	const leave = () => segment('hour').parentElement!.dispatchEvent(new FocusEvent('focusout', { bubbles: true, relatedTarget: null }))

	it('should render hour and minute segments only', () => {
		expect(segment('hour')).not.toBeNull()
		expect(segment('minute')).not.toBeNull()
		expect(segment('day')).toBeNull()
		expect(segment('second')).toBeNull()
	})

	it('should read the value as a 24-hour time', async () => {
		fixture.component.value = '14:07'
		await fixture.updateComplete

		expect(fixture.component.controller.segments.value?.hour).toBe(14)
		expect(fixture.component.controller.segments.value?.minute).toBe(7)
		expect(segment('minute').textContent).toBe('07')
	})

	it('should write typed segments back as HH:mm and dispatch change', async () => {
		// Pinned to a morning: on a 12-hour clock the unfilled day period completes from the reference.
		fixture.component.shortcutReferenceDate = DateTime.from(Date.parse('2026-09-05T08:00:00.000Z'), 'gregory', 'UTC')
		await fixture.updateComplete
		vi.spyOn(fixture.component.change, 'dispatch').mockReturnValue(undefined)
		focus(segment('hour'))
		type(segment('hour'), '09')
		type(segment('minute'), '30')
		leave()
		await fixture.updateComplete

		expect(fixture.component.value).toBe('09:30')
		expect(fixture.component.change.dispatch).toHaveBeenCalledWith('09:30')
	})

	it('should include seconds at second precision', async () => {
		fixture.component.precision = FieldDateTimePrecision.Second
		fixture.component.value = '14:07:09'
		await fixture.updateComplete

		expect(segment('second').textContent).toBe('09')

		focus(segment('second'))
		type(segment('second'), '45')
		leave()
		await fixture.updateComplete

		expect(fixture.component.value).toBe('14:07:45')
	})

	it('should keep the default label', () => {
		expect(fixture.component.renderRoot.querySelector('mo-field')!.label).toBe(String(t('Time')))
	})

	it('should take no letter shortcuts, as every one of them resolves to a day', async () => {
		fixture.component.shortcutReferenceDate = DateTime.from(Date.parse('2026-09-05T08:00:00.000Z'), 'gregory', 'UTC')
		fixture.component.value = '04:45'
		await fixture.updateComplete
		focus(segment('hour'))
		type(segment('hour'), 'm')

		expect(segment('hour').parentElement!.hasAttribute('data-shortcut')).toBe(false)

		segment('hour').dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter', bubbles: true, cancelable: true }))
		await fixture.updateComplete

		expect(fixture.component.value).toBe('04:45')
	})

	describe('the picker', () => {
		const press = (element: HTMLElement, key: string, init: KeyboardEventInit = {}) => {
			const event = new KeyboardEvent('keydown', { key, bubbles: true, cancelable: true, ...init })
			element.dispatchEvent(event)
			return event
		}

		it('should open on Alt+ArrowDown without stepping the unit', async () => {
			fixture.component.pickerHidden = false
			fixture.component.value = '14:07'
			await fixture.updateComplete

			focus(segment('hour'))
			const hour = segment('hour').textContent
			press(segment('hour'), 'ArrowDown', { altKey: true })
			await fixture.updateComplete

			expect(fixture.component.open).toBe(true)
			expect(segment('hour').textContent).toBe(hour)
			expect(fixture.component.value).toBe('14:07')
		})

		it('should stay closed when the picker is hidden', async () => {
			focus(segment('hour'))
			press(segment('hour'), 'ArrowDown', { altKey: true })
			await fixture.updateComplete

			expect(fixture.component.open).toBe(false)
		})
	})
})