import { ComponentTestFixture } from '@a11d/lit-testing'
import { type LanguageCode, Localizer } from '@3mo/localization'
import type { SelectableListItem } from '@3mo/list'
import type { DateList } from './DateList.js'
import { HourList } from './HourList.js'
import { MinuteList } from './MinuteList.js'
import { SecondList } from './SecondList.js'
import '@3mo/date-time'
import '../index.js'

const navigationInstant = Date.parse('2025-06-15T10:37:52.000Z')

const variants = [
	{ name: 'HourList', unit: 'hour', count: 24, create: () => new HourList },
	{ name: 'MinuteList', unit: 'minute', count: 60, create: () => new MinuteList },
	{ name: 'SecondList', unit: 'second', count: 60, create: () => new SecondList },
] as const

for (const variant of variants) {
	describe(`DateList (${variant.name})`, () => {
		const navigationDate = DateTime.from(navigationInstant, 'gregory', 'UTC')
		const withUnit = (date: DateTime, value: number) => date.with({ [variant.unit]: value } as any)

		const fixture = new ComponentTestFixture<DateList>(() => {
			const element = variant.create()
			element.style.height = '200px'
			element.navigationDate = navigationDate
			return element
		})

		const items = () => [...fixture.component.renderRoot.querySelectorAll<SelectableListItem>('mo-selectable-list-item')]
		const settle = async () => {
			await fixture.updateComplete
			await new Promise(resolve => setTimeout(resolve, 50))
			await fixture.updateComplete
		}
		const dispatched = (dispatcher: 'change' | 'navigate') =>
			(fixture.component[dispatcher].dispatch as jasmine.Spy).calls.mostRecent().args[0] as DateTime

		it('should render one item per unit', () => {
			expect(items().length).toBe(variant.count)
		})

		it('should mark the item matching the value as selected', async () => {
			fixture.component.value = withUnit(navigationDate, 5)
			await settle()

			const selected = items().filter(item => item.hasAttribute('selected'))

			expect(selected.length).toBe(1)
			expect(items().indexOf(selected[0]!)).toBe(5)
		})

		it('should dispatch change with the value carrying the picked unit when an item is selected', async () => {
			fixture.component.value = navigationDate
			await settle()
			spyOn(fixture.component.change, 'dispatch')

			items()[7]!.click()

			expect(dispatched('change').valueOf()).toBe(withUnit(navigationDate, 7).valueOf())
		})

		it('should base the change on the current instant when no value is set', () => {
			spyOn(fixture.component.change, 'dispatch')

			items()[7]!.click()

			const expected = withUnit(new DateTime, 7)
			expect(dispatched('change')[variant.unit]).toBe(7)
			expect(Math.abs(dispatched('change').valueOf() - expected.valueOf())).toBeLessThan(1000)
		})

		describe('localized digits', () => {
			let initialLanguage: LanguageCode

			beforeEach(() => initialLanguage = Localizer.languages.current)

			afterEach(async () => {
				Localizer.languages.current = initialLanguage
				await fixture.updateComplete
			})

			const switchTo = async (language: LanguageCode) => {
				Localizer.languages.current = language
				await fixture.updateComplete
			}

			it('should render localized digits after a language change', async () => {
				await switchTo('en')
				expect(items()[5]!.textContent!.trim()).toBe('05')

				await switchTo('fa')
				expect(items()[5]!.textContent!.trim()).toBe((5).format('fa').padStart(2, (0).format('fa')))
			})
		})

		describe('scroll driven navigation', () => {
			const scroller = () => fixture.component.renderRoot.querySelector('mo-scroller')!

			it('should dispatch navigate with the item nearest the selector when the user scrolls', async () => {
				await settle()
				items()[9]!.scrollIntoView({ block: 'center', behavior: 'instant' })
				await new Promise(resolve => setTimeout(resolve, 150))
				spyOn(fixture.component.navigate, 'dispatch')

				scroller().dispatchEvent(new MouseEvent('mouseenter'))
				scroller().dispatchEvent(new Event('scrollend'))

				expect(dispatched('navigate').valueOf()).toBe(withUnit(navigationDate, 9).valueOf())
			})

			it('should not dispatch navigate on programmatic scrolling', async () => {
				await settle()
				spyOn(fixture.component.navigate, 'dispatch')

				items()[20]!.scrollIntoView({ block: 'center', behavior: 'instant' })
				await new Promise(resolve => setTimeout(resolve, 250))

				expect(fixture.component.navigate.dispatch).not.toHaveBeenCalled()
			})
		})
	})
}