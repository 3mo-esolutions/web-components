import { html } from '@a11d/lit'
import { ComponentTestFixture } from '@a11d/lit-testing'
import { type LanguageCode, Localizer } from '@3mo/localization'
import type { FieldDateTime } from './FieldDateTime.js'
import { FieldDateTimePrecision } from './FieldDateTimePrecision.js'
import '@3mo/date-time'
import './index.js'

describe('FieldDateTime', () => {
	const fixture = new ComponentTestFixture<FieldDateTime>(html`<mo-field-date-time open precision='day'></mo-field-date-time>`)
	const plainFixture = new ComponentTestFixture<FieldDateTime>(html`<mo-field-date-time precision='day' .pickerHidden=${true}></mo-field-date-time>`)

	const getCalendar = () => fixture.component.renderRoot.querySelector('mo-calendar')!
	const input = () => plainFixture.component.inputElement
	const utc = (isoDateTime: string) => DateTime.from(Date.parse(`${isoDateTime}.000Z`), 'gregory', 'UTC')

	it('should parse the precision attribute into a FieldDateTimePrecision', () => {
		expect(fixture.component.precision).toEqual(FieldDateTimePrecision.Day)
	})

	describe('default label', () => {
		const labelOf = () => plainFixture.component.renderRoot.querySelector('mo-field')!.label

		const keyByPrecision = [
			[FieldDateTimePrecision.Year, 'Year'],
			[FieldDateTimePrecision.Month, 'Month'],
			[FieldDateTimePrecision.Week, 'Week'],
			[FieldDateTimePrecision.Day, 'Date'],
			[FieldDateTimePrecision.Minute, 'Date & Time'],
		] as const

		for (const [precision, key] of keyByPrecision) {
			it(`should default the label to the localized "${key}" at ${precision.key} precision`, async () => {
				plainFixture.component.precision = precision
				await plainFixture.updateComplete

				expect(labelOf()).toBe(String(t(key)))
			})
		}

		it('should keep an explicitly provided label', async () => {
			plainFixture.component.label = 'Delivery'
			await plainFixture.updateComplete

			expect(labelOf()).toBe('Delivery')
		})
	})

	describe('calendar selection', () => {
		it('should dispatch change event when a given date is selected in the calendar', () => {
			spyOn(fixture.component.change, 'dispatch')
			const date = new DateTime('2025-01-01')
			// @ts-expect-error Using UTC to avoid timezone issues in tests
			date.timeZone = 'UTC'
			getCalendar().dispatchEvent(new CustomEvent('dateClick', { detail: date }))
			expect(fixture.component.value).toEqual(date)
			expect(fixture.component.change.dispatch).toHaveBeenCalled()
		})

		const valueByPrecision = [
			[FieldDateTimePrecision.Month, '2025-05-01T00:00:00'],
			[FieldDateTimePrecision.Day, '2025-05-19T00:00:00'],
			[FieldDateTimePrecision.Minute, '2025-05-19T14:37:00'],
		] as const

		for (const [precision, expected] of valueByPrecision) {
			it(`should zero out units below the ${precision.key} precision in the value`, async () => {
				fixture.component.precision = precision
				fixture.component.navigationDate = utc('2025-05-19T14:37:52')
				await fixture.updateComplete

				getCalendar().dispatchEvent(new CustomEvent('dateClick', { detail: utc('2025-05-19T00:00:00') }))

				expect(fixture.component.value!.valueOf()).toBe(utc(expected).valueOf())
			})
		}

		it('should set the value to the week start when a week is picked at week precision', async () => {
			fixture.component.precision = FieldDateTimePrecision.Week
			fixture.component.navigationDate = utc('2025-05-21T00:00:00')
			await fixture.updateComplete

			getCalendar().dispatchEvent(new CustomEvent('dateClick', { detail: utc('2025-05-21T00:00:00') }))

			expect(fixture.component.value!.valueOf()).toBe(utc('2025-05-19T00:00:00').valueOf())
		})

		it('should preserve the navigated time of day when a day is picked at minute precision', async () => {
			fixture.component.precision = FieldDateTimePrecision.Minute
			fixture.component.navigationDate = utc('2025-05-19T14:37:52')
			await fixture.updateComplete

			getCalendar().dispatchEvent(new CustomEvent('dateClick', { detail: utc('2025-06-02T00:00:00') }))

			expect(fixture.component.value!.valueOf()).toBe(utc('2025-06-02T14:37:00').valueOf())
		})
	})

	describe('time selection', () => {
		const list = (tagName: string) => fixture.component.renderRoot.querySelector(tagName)

		it('should not render time lists at day precision', () => {
			expect(list('mo-hour-list')).toBeNull()
			expect(list('mo-minute-list')).toBeNull()
			expect(list('mo-second-list')).toBeNull()
		})

		it('should render hour and minute lists at minute precision and a second list only at second precision', async () => {
			fixture.component.precision = FieldDateTimePrecision.Minute
			await fixture.updateComplete
			expect(list('mo-hour-list')).not.toBeNull()
			expect(list('mo-minute-list')).not.toBeNull()
			expect(list('mo-second-list')).toBeNull()

			fixture.component.precision = FieldDateTimePrecision.Second
			await fixture.updateComplete

			expect(list('mo-second-list')).not.toBeNull()
		})

		it('should update the value\'s hour and dispatch change when an hour is picked in the hour list', async () => {
			fixture.component.precision = FieldDateTimePrecision.Minute
			fixture.component.value = utc('2025-05-19T14:37:00')
			await fixture.updateComplete
			const hourList = list('mo-hour-list')!
			const picked = fixture.component.navigationDate.with({ hour: 9 })
			spyOn(fixture.component.change, 'dispatch')

			hourList.dispatchEvent(new CustomEvent('navigate', { detail: picked }))
			await fixture.updateComplete
			hourList.dispatchEvent(new CustomEvent('change', { detail: picked }))

			expect((fixture.component.value as DateTime).hour).toBe(9)
			expect(fixture.component.change.dispatch).toHaveBeenCalled()
		})
	})

	describe('typed input', () => {
		it('should parse the typed date on the change event and format it back into the input', async () => {
			input().value = '2025-05-19'
			input().dispatchEvent(new Event('change'))
			await plainFixture.updateComplete

			const instant = Date.parse('2025-05-19')
			expect(plainFixture.component.value!.valueOf()).toBe(instant)
			expect(input().value).toBe(new DateTime(instant).format(FieldDateTimePrecision.Day.formatOptions))
		})

		it('should set the value to undefined for unparseable input', async () => {
			plainFixture.component.value = new DateTime(Date.parse('2025-05-19T12:00:00.000Z'))
			await plainFixture.updateComplete

			input().value = 'not a date'
			input().dispatchEvent(new Event('change'))
			await plainFixture.updateComplete

			expect(plainFixture.component.value).toBeUndefined()
		})

		it('should resolve relative shortcuts against shortcutReferenceDate', async () => {
			plainFixture.component.shortcutReferenceDate = utc('2020-06-10T00:00:00')
			await plainFixture.updateComplete

			input().value = '+1'
			input().dispatchEvent(new Event('change'))
			await plainFixture.updateComplete

			expect(plainFixture.component.value!.valueOf()).toBe(utc('2020-06-11T00:00:00').valueOf())
		})

		it('should dispatch input with the parsed value while typing', async () => {
			plainFixture.component.shortcutReferenceDate = utc('2020-06-10T00:00:00')
			await plainFixture.updateComplete
			spyOn(plainFixture.component.input, 'dispatch')

			input().value = '+1'
			input().dispatchEvent(new Event('input'))

			const dispatched = (plainFixture.component.input.dispatch as jasmine.Spy).calls.mostRecent().args[0] as DateTime
			expect(dispatched.valueOf()).toBe(utc('2020-06-11T00:00:00').valueOf())
			expect(plainFixture.component.value).toBeUndefined()
		})
	})

	describe('clearing', () => {
		it('should clear the value and dispatch input and change via the clear icon button', async () => {
			plainFixture.component.value = new DateTime(Date.parse('2025-05-19T12:00:00.000Z'))
			plainFixture.component.dispatchEvent(new FocusEvent('focusin', { bubbles: true }))
			await plainFixture.updateComplete
			const clearButton = plainFixture.component.renderRoot.querySelector<HTMLElement>('mo-icon-button[icon=cancel]')!
			spyOn(plainFixture.component.input, 'dispatch')
			spyOn(plainFixture.component.change, 'dispatch')

			clearButton.click()
			await plainFixture.updateComplete

			expect(plainFixture.component.value).toBeUndefined()
			expect(plainFixture.component.input.dispatch).toHaveBeenCalledWith(undefined)
			expect(plainFixture.component.change.dispatch).toHaveBeenCalledWith(undefined)
		})
	})

	describe('picker', () => {
		it('should not render the popover when pickerHidden', () => {
			expect(fixture.component.renderRoot.querySelector('mo-popover')).not.toBeNull()
			expect(plainFixture.component.renderRoot.querySelector('mo-popover')).toBeNull()
		})
	})

	describe('presets', () => {
		const presets = () => [...fixture.component.renderRoot.querySelectorAll<HTMLElement>('#presets mo-list-item')]
		const presetLabels = () => presets().map(item => item.textContent!.trim())
		const preset = (label: string) => presets().find(item => item.textContent!.trim() === label)

		it('should apply the preset\'s value and dispatch change when a preset is clicked', () => {
			spyOn(fixture.component.change, 'dispatch')

			preset(String(t('Today')))!.click()

			expect(fixture.component.value!.valueOf()).toBe(new DateTime().dayStart.valueOf())
			expect(fixture.component.change.dispatch).toHaveBeenCalled()
		})

		it('should not render day presets below day precision', async () => {
			fixture.component.precision = FieldDateTimePrecision.Year
			await fixture.updateComplete

			expect(presetLabels()).toEqual([])
		})

		it('should omit presets whose date violates min, max or dateDisabled', async () => {
			fixture.component.dateDisabled = date => FieldDateTimePrecision.Day.equals(date, new DateTime())
			await fixture.updateComplete

			expect(presetLabels()).not.toContain(String(t('Today')))
			expect(presetLabels()).toContain(String(t('Yesterday')))
		})
	})

	describe('dateDisabled', () => {
		it('should pass dateDisabled to the calendar', async () => {
			const dateDisabled = (date: DateTime) => FieldDateTimePrecision.Day.equals(date, new DateTime('2025-06-15'))
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

	describe('attribute converters', () => {
		const fixtureWithAttributes = new ComponentTestFixture<FieldDateTime>(
			html`<mo-field-date-time open precision='day' min='2025-06-10' max='2025-06-20'></mo-field-date-time>`
		)

		it('should convert min string attribute to Date', () => {
			expect(fixtureWithAttributes.component.min).toBeInstanceOf(Date)
			expect(fixtureWithAttributes.component.min!.getFullYear()).toBe(2025)
			expect(fixtureWithAttributes.component.min!.getMonth()).toBe(5)
			expect(fixtureWithAttributes.component.min!.getDate()).toBe(10)
		})

		it('should convert max string attribute to Date', () => {
			expect(fixtureWithAttributes.component.max).toBeInstanceOf(Date)
			expect(fixtureWithAttributes.component.max!.getFullYear()).toBe(2025)
			expect(fixtureWithAttributes.component.max!.getMonth()).toBe(5)
			expect(fixtureWithAttributes.component.max!.getDate()).toBe(20)
		})

		it('should pass converted attributes to the calendar', () => {
			const calendar = fixtureWithAttributes.component.renderRoot.querySelector('mo-calendar')!
			expect(calendar.min).toEqual(fixtureWithAttributes.component.min)
			expect(calendar.max).toEqual(fixtureWithAttributes.component.max)
		})
	})

	describe('calendar systems', () => {
		let initialLanguage: LanguageCode

		beforeEach(() => initialLanguage = Localizer.languages.current)

		afterEach(async () => {
			Localizer.languages.current = initialLanguage
			await new Promise<void>(resolve => queueMicrotask(() => resolve()))
			await plainFixture.updateComplete
		})

		const switchTo = async (language: LanguageCode) => {
			Localizer.languages.current = language
			await new Promise<void>(resolve => queueMicrotask(() => resolve()))
		}

		it('should format the input value with the calendar and digits of the current language', async () => {
			const instant = Date.parse('2025-05-19T12:00:00.000Z')

			await switchTo('en')
			plainFixture.component.value = new DateTime(instant)
			await plainFixture.updateComplete
			expect(input().value).toContain((2025).format('en'))

			await switchTo('fa')
			plainFixture.component.value = new DateTime(instant)
			await plainFixture.updateComplete

			expect(input().value).toContain((1404).format('fa'))
			expect(input().value).not.toContain('2025')
		})
	})
})