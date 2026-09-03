import { html } from '@a11d/lit'
import { ComponentTestFixture } from '@a11d/lit-testing'
import type { FieldDateTimeRange } from './FieldDateTimeRange.js'
import { FieldDateTimePrecision } from './FieldDateTimePrecision.js'
import '@3mo/date-time'
import './index.js'

describe('FieldDateTimeRange', () => {
	const fixture = new ComponentTestFixture<FieldDateTimeRange>(html`<mo-field-date-time-range open precision='day'></mo-field-date-time-range>`)

	const getCalendar = () => fixture.component.renderRoot.querySelector('mo-calendar')!
	const input = () => fixture.component.inputElement
	const selection = () => String(fixture.component.selection)
	const select = (value: 'start' | 'end') => fixture.component.selection = value as typeof fixture.component.selection
	const utc = (isoDateTime: string) => DateTime.from(Date.parse(`${isoDateTime}.000Z`), 'gregory', 'UTC')

	describe('start/end selection', () => {
		it('should dispatch change event when a given date is selected in the calendar', () => {
			spyOn(fixture.component.change, 'dispatch')
			const date = new DateTime('2025-01-01')
			// @ts-expect-error Using UTC to avoid timezone issues in tests
			date.timeZone = 'UTC'
			getCalendar().dispatchEvent(new CustomEvent('dateClick', { detail: date }))
			expect(fixture.component.value).toEqual(new DateTimeRange(date, undefined))
			expect(fixture.component.change.dispatch).toHaveBeenCalled()
		})

		it('should switch the selection to end after the start is picked at the field\'s precision', () => {
			expect(selection()).toBe('start')

			getCalendar().dispatchEvent(new CustomEvent('dateClick', { detail: utc('2025-05-19T00:00:00') }))

			expect(selection()).toBe('end')
		})

		it('should set the range end to the end of the picked unit when selection is "end"', async () => {
			select('end')
			fixture.component.navigationDate = utc('2025-05-19T00:00:00')
			await fixture.updateComplete

			getCalendar().dispatchEvent(new CustomEvent('dateClick', { detail: utc('2025-05-19T00:00:00') }))

			expect(fixture.component.value!.end!.valueOf()).toBe(utc('2025-05-19T23:59:59').valueOf())
		})

		it('should keep the other endpoint when one endpoint is re-picked', async () => {
			const end = utc('2025-05-20T23:59:59')
			fixture.component.value = new DateTimeRange(utc('2025-05-10T00:00:00'), end)
			select('start')
			await fixture.updateComplete

			getCalendar().dispatchEvent(new CustomEvent('dateClick', { detail: utc('2025-05-12T00:00:00') }))

			expect(fixture.component.value!.start!.valueOf()).toBe(utc('2025-05-12T00:00:00').valueOf())
			expect(fixture.component.value!.end!.valueOf()).toBe(end.valueOf())
		})

		it('should not switch the selection when an intermediate unit is picked at finer precision', async () => {
			fixture.component.precision = FieldDateTimePrecision.Minute
			await fixture.updateComplete
			const hourList = fixture.component.renderRoot.querySelector('mo-hour-list')!

			hourList.dispatchEvent(new CustomEvent('change', { detail: fixture.component.navigationDate.with({ hour: 9 }) }))

			expect(fixture.component.value!.start).toBeDefined()
			expect(selection()).toBe('start')
		})

		it('should navigate the calendar to the corresponding endpoint when the selection tab changes', async () => {
			const start = utc('2025-05-10T00:00:00')
			const end = utc('2025-05-20T00:00:00')
			fixture.component.value = new DateTimeRange(start, end)
			await fixture.updateComplete
			expect(fixture.component.navigationDate.valueOf()).toBe(start.valueOf())

			fixture.component.renderRoot.querySelector('mo-tab-bar')!.dispatchEvent(new CustomEvent('change', { detail: 'end' }))
			await fixture.updateComplete

			expect(selection()).toBe('end')
			expect(fixture.component.navigationDate.valueOf()).toBe(end.valueOf())
		})
	})

	describe('typed input', () => {
		it('should parse "start – end" text into a range on change and format it back', async () => {
			input().value = '2020-06-10 – 2020-06-20'
			input().dispatchEvent(new Event('change'))
			await fixture.updateComplete

			const expected = new DateTimeRange(new DateTime(Date.parse('2020-06-10')), new DateTime(Date.parse('2020-06-20')))
			expect(fixture.component.value!.start!.valueOf()).toBe(Date.parse('2020-06-10'))
			expect(fixture.component.value!.end!.valueOf()).toBe(Date.parse('2020-06-20'))
			expect(input().value).toBe(expected.format(FieldDateTimePrecision.Day.formatOptions))
		})

		it('should parse a range keyword shortcut into the corresponding range', async () => {
			fixture.component.shortcutReferenceDate = utc('2020-06-15T00:00:00')
			await fixture.updateComplete

			input().value = 'm'
			input().dispatchEvent(new Event('change'))
			await fixture.updateComplete

			expect(fixture.component.value!.start!.valueOf()).toBe(utc('2020-06-01T00:00:00').valueOf())
			expect(fixture.component.value!.end!.valueOf()).toBe(utc('2020-06-30T00:00:00').valueOf())
		})
	})

	describe('presets', () => {
		const presets = () => [...fixture.component.renderRoot.querySelectorAll<HTMLElement>('#presets mo-list-item')]
		const presetLabels = () => presets().map(item => item.textContent!.trim())
		const preset = (label: string) => presets().find(item => item.textContent!.trim() === label)

		it('should apply the preset range and dispatch change when a preset is clicked', () => {
			spyOn(fixture.component.change, 'dispatch')

			preset(String(t('This week')))!.click()

			expect(fixture.component.value!.start!.valueOf()).toBe(new DateTime().weekStart.dayStart.valueOf())
			expect(fixture.component.value!.end!.valueOf()).toBe(new DateTime().weekEnd.dayEnd.valueOf())
			expect(fixture.component.change.dispatch).toHaveBeenCalled()
		})

		it('should only render presets fitting the precision', async () => {
			fixture.component.precision = FieldDateTimePrecision.Year
			await fixture.updateComplete

			expect(presetLabels()).toContain(String(t('This year')))
			expect(presetLabels()).not.toContain(String(t('This week')))
			expect(presetLabels()).not.toContain(String(t('This month')))
		})
	})

	describe('dateDisabled', () => {
		it('should pass dateDisabled to the calendar', async () => {
			const dateDisabled = (date: DateTime) => date.getDate() === 15
			fixture.component.dateDisabled = dateDisabled
			await fixture.updateComplete
			expect(getCalendar().dateDisabled).toBe(dateDisabled)
		})
	})

	describe('min', () => {
		it('should pass min to the calendar', async () => {
			fixture.component.min = new DateTime('2025-06-15')
			await fixture.updateComplete
			expect(getCalendar().min).toEqual(fixture.component.min)
		})
	})

	describe('max', () => {
		it('should pass max to the calendar', async () => {
			fixture.component.max = new DateTime('2025-06-15')
			await fixture.updateComplete
			expect(getCalendar().max).toEqual(fixture.component.max)
		})
	})
})