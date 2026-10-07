import { ComponentTestFixture } from '@a11d/lit-testing'
import type { Option } from './Option.js'
import type { FieldSelect } from './FieldSelect.js'
import './index.js'
import { html } from '@a11d/lit'
import { PopoverAlignment, PopoverPlacement } from '@3mo/popover'
import { computePosition } from '@floating-ui/dom'
import { userEvent } from 'vitest/browser'
import { closeWhenOutOfViewport } from './closeWhenOutOfViewport.js'
import { sameInlineSize } from './sameInlineSize.js'
import '@3mo/date-time'

type Person = { id: number, name: string, birthDate: DateTime }

const people = new Array<Person>(
	{ id: 0, name: 'Pseudo-default Option', birthDate: new DateTime(1900, 0, 0) },
	{ id: 1, name: 'John', birthDate: new DateTime(2000, 0, 0) },
	{ id: 2, name: 'Jane', birthDate: new DateTime(2000, 0, 0) },
	{ id: 3, name: 'Joe', birthDate: new DateTime(2000, 0, 0) },
)

const tick = (duration = 0) => new Promise(resolve => setTimeout(resolve, duration))
const frames = async (count: number) => { for (let i = 0; i < count; i++) { await new Promise(resolve => requestAnimationFrame(resolve)) } }

const getPopover = (component: FieldSelect<unknown>) => component.popoverElement

const getHint = (component: FieldSelect<unknown>) => component.renderRoot.querySelector('#hint') as HTMLElement

const hintText = (component: FieldSelect<unknown>) => getComputedStyle(getHint(component)).display === 'none' ? undefined : getHint(component).textContent?.trim()

const isNoResultsHintVisible = (component: FieldSelect<unknown>) => hintText(component) === 'No results'

const isShown = (element: Element | undefined) => !!element && getComputedStyle(element).display !== 'none'

const pressKey = (target: Element, key: string) => {
	const event = new KeyboardEvent('keydown', { key, bubbles: true, composed: true, cancelable: true })
	target.dispatchEvent(event)
	return event
}

async function settle(component: FieldSelect<unknown>) {
	await component.updateComplete
	await tick(20)
	await component.updateComplete
}

async function waitUntil(predicate: () => boolean, timeout = 1000) {
	const start = Date.now()
	while (!predicate() && Date.now() - start < timeout) {
		await tick(10)
	}
}

async function openMenu(component: FieldSelect<unknown>) {
	const popover = getPopover(component)!
	const opened = new Promise<void>(resolve => popover.addEventListener('toggle', () => resolve(), { once: true }))
	component.open = true
	await component.updateComplete
	await Promise.race([opened, tick(300)])
	await tick(50)
}

async function closeMenu(component?: FieldSelect<unknown>) {
	if (!component) {
		return
	}
	component.open = false
	await component.updateComplete
	const popover = getPopover(component)
	if (popover) {
		popover.open = false
		if (popover.matches(':popover-open')) {
			popover.hidePopover()
		}
		await popover.updateComplete
	}
}

async function focusIn(component: FieldSelect<unknown>) {
	component['focusController'].focusIn()
	await settle(component)
}

function focusOut(component: FieldSelect<unknown>) {
	component['focusController'].focusOut()
}

async function type(component: FieldSelect<unknown>, keyword: string) {
	const input = component.searchInputElement!
	input.value = keyword
	input.dispatchEvent(new Event('input', { bubbles: true }))
	await settle(component)
}

const visibleOptionTexts = (component: FieldSelect<unknown>) => component.options
	.filter(option => !option.hasAttribute('data-search-no-match'))
	.map(option => option.text)

describe('FieldSelect', () => {
	const fixture = new ComponentTestFixture<FieldSelect<Person>>(html`
		<mo-field-select label='Select'>
			${people.map(p => html`<mo-option value=${p.id} .data=${p}>${p.name}</mo-option>`)}
		</mo-field-select>
	`)

	afterEach(() => closeMenu(fixture.component))

	const getDefaultOption = () => fixture.component.listItems.find(i => i.getAttribute('value') === '')

	function spyOnChangeEvents(component: FieldSelect<unknown> = fixture.component) {
		const changeSpy = vi.fn()
		const dataChangeSpy = vi.fn()
		const indexChangeSpy = vi.fn()
		component.change.subscribe(changeSpy)
		component.dataChange.subscribe(dataChangeSpy)
		component.indexChange.subscribe(indexChangeSpy)
		return { changeSpy, dataChangeSpy, indexChangeSpy }
	}

	describe('default option', () => {
		it('should not render by default', () => expect(getDefaultOption()).toBeUndefined())

		it('should render when "default" property is set', async () => {
			fixture.component.default = 'Select...'
			await fixture.updateComplete

			const defaultOption = getDefaultOption()
			expect(defaultOption).toBeDefined()
			expect(defaultOption?.textContent?.trim()).toBe('Select...')
		})

		it('should not get populated when no default option is available even if "reflectDefault" is set', async () => {
			fixture.component.default = ''
			fixture.component.reflectDefault = true

			await fixture.updateComplete

			expect(fixture.component.renderRoot.querySelector('mo-field')?.populated).toBe(false)
		})

		it('should stay populated when selected if "reflectDefault" is set', async () => {
			fixture.component.default = 'Select...'

			await fixture.updateComplete
			expect(fixture.component.renderRoot.querySelector('mo-field')?.populated).toBe(false)

			fixture.component.reflectDefault = true
			await fixture.updateComplete
			expect(fixture.component.renderRoot.querySelector('mo-field')?.populated).toBe(true)
		})

		it('should clear the selection and dispatch change when the default option is clicked', async () => {
			fixture.component.default = 'Select...'
			fixture.component.value = 1
			await settle(fixture.component)
			expect(fixture.component.valueInputElement.value).toBe('John')

			const { changeSpy } = spyOnChangeEvents()
			const defaultOption = getDefaultOption() as HTMLElement
			defaultOption.click()
			await settle(fixture.component)

			expect(changeSpy).toHaveBeenCalledTimes(1)
			expect(fixture.component.value).toBeUndefined()
			expect(fixture.component.selectedOptions.length).toBe(0)
			expect(fixture.component.valueInputElement.value).toBe('')
		})
	})

	describe('menu', () => {
		it('should not open when disabled', async () => {
			fixture.component.disabled = true
			await fixture.updateComplete

			fixture.component.dispatchEvent(new MouseEvent('click', { bubbles: true }))
			await fixture.updateComplete

			expect(fixture.component.open).toBe(false)
		})

		it('should neither open nor change when readonly', async () => {
			fixture.component.value = 1
			fixture.component.readonly = true
			await settle(fixture.component)

			fixture.component.renderRoot.querySelector('mo-field')!.dispatchEvent(new MouseEvent('click', { bubbles: true, composed: true }))
			await settle(fixture.component)
			expect(fixture.component.open).toBe(false)

			for (const key of ['ArrowDown', 'Enter']) {
				pressKey(fixture.component.valueInputElement, key)
				await settle(fixture.component)
			}
			expect(fixture.component.open).toBe(false)
			expect(fixture.component.value).toBe(1)
		})

		it('should open when the field is clicked', async () => {
			const popover = getPopover(fixture.component)!
			const opened = new Promise<void>(resolve => popover.addEventListener('toggle', () => resolve(), { once: true }))

			fixture.component.renderRoot.querySelector('mo-field')!.dispatchEvent(new MouseEvent('click', { bubbles: true, composed: true }))
			await Promise.race([opened, tick(300)])
			await settle(fixture.component)

			expect(fixture.component.open).toBe(true)
		})

		it('should close after selecting an option in single mode', async () => {
			await openMenu(fixture.component)
			expect(fixture.component.open).toBe(true)

			fixture.component.options[1]!.click()
			await settle(fixture.component)

			expect(fixture.component.open).toBe(false)
		})

		it('should close after selecting an option by its row in multiple mode', async () => {
			fixture.component.multiple = true
			await openMenu(fixture.component)
			expect(fixture.component.open).toBe(true)

			fixture.component.options[1]!.click()
			await settle(fixture.component)

			expect(fixture.component.index).toEqual([1])
			expect(fixture.component.open).toBe(false)
		})

		it('should stay open when the checkbox of an option is clicked in multiple mode', async () => {
			fixture.component.multiple = true
			await openMenu(fixture.component)
			await settle(fixture.component)

			fixture.component.options[1]!.renderRoot.querySelector('mo-checkbox')!.click()
			await settle(fixture.component)

			expect(fixture.component.open).toBe(true)
		})

		for (const [property, attribute, value] of [
			['menuAlignment', 'alignment', PopoverAlignment.End],
			['menuPlacement', 'placement', PopoverPlacement.BlockStart],
		] as const) {
			it(`should tunnel ${property} to the popover`, async () => {
				(fixture.component as any)[property] = value
				await settle(fixture.component)
				await getPopover(fixture.component)!.updateComplete

				expect(getPopover(fixture.component)!.getAttribute(attribute)).toBe(value)
			})
		}

		describe('keyboard interaction', () => {
			beforeEach(() => settle(fixture.component))

			for (const key of ['ArrowDown', 'ArrowUp', 'Home', 'End']) {
				it(`should open when a navigation key is pressed on the field (${key})`, async () => {
					expect(fixture.component.open).toBe(false)

					fixture.component.valueInputElement.dispatchEvent(new KeyboardEvent('keydown', { key, bubbles: true, composed: true, cancelable: true }))
					await settle(fixture.component)

					expect(fixture.component.open).toBe(true)
				})
			}

			it('should close when Tab is pressed while open', async () => {
				await openMenu(fixture.component)
				expect(fixture.component.open).toBe(true)

				fixture.component.valueInputElement.dispatchEvent(new KeyboardEvent('keydown', { key: 'Tab', bubbles: true, composed: true, cancelable: true }))
				await settle(fixture.component)

				expect(fixture.component.open).toBe(false)
			})
		})

		describe('with more options than fit', () => {
			const numbers = [...new Array(60).keys()]
			const selectedIndex = 50

			const fixture = new ComponentTestFixture<FieldSelect<number>>(html`
				<mo-field-select label='Select'>
					${numbers.map(n => html`<mo-option value=${n} .data=${n}>Option ${n}</mo-option>`)}
				</mo-field-select>
			`)

			afterEach(() => closeMenu(fixture.component))

			beforeEach(async () => {
				fixture.component.value = selectedIndex
				await fixture.updateComplete
				await tick()
			})

			it('should scroll the selected option into view when opened', async () => {
				await openMenu(fixture.component)

				const popover = getPopover(fixture.component)!
				const option = fixture.component.options[selectedIndex]!
				expect(option.selected).toBe(true)
				expect(popover.scrollTop).toBeGreaterThan(0)
				expect(option.getBoundingClientRect().top).toBeGreaterThanOrEqual(popover.getBoundingClientRect().top)
				expect(option.getBoundingClientRect().bottom).toBeLessThanOrEqual(popover.getBoundingClientRect().bottom)
			})

			it('should move the active option on from the selected option', async () => {
				await openMenu(fixture.component)
				const input = fixture.component.valueInputElement
				expect(input.ariaActiveDescendantElement).toBe(fixture.component.options[selectedIndex]!)

				input.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowDown', bubbles: true, composed: true, cancelable: true }))

				expect(input.ariaActiveDescendantElement).toBe(fixture.component.options[selectedIndex + 1]!)
			})

			it('should open onto an option chosen by a real click far down the list', async () => {
				await openMenu(fixture.component)
				const option = fixture.component.options[numbers.length - 2]!
				option.scrollIntoView({ block: 'nearest' })

				await userEvent.click(option)
				await settle(fixture.component)
				expect(fixture.component.open).toBe(false)
				expect(fixture.component.value).toBe(numbers.length - 2)

				await openMenu(fixture.component)
				await frames(2)
				const popover = getPopover(fixture.component)!
				expect(fixture.component.valueInputElement.ariaActiveDescendantElement).toBe(option)
				expect(option.getBoundingClientRect().top).toBeGreaterThanOrEqual(popover.getBoundingClientRect().top)
				expect(option.getBoundingClientRect().bottom).toBeLessThanOrEqual(popover.getBoundingClientRect().bottom)
			})
		})

		describe('with more options than fit, choosing several', () => {
			const numbers = [...new Array(60).keys()]

			const fixture = new ComponentTestFixture<FieldSelect<number>>(html`
				<mo-field-select label='Select' multiple>
					${numbers.map(n => html`<mo-option value=${n} .data=${n}>Option ${n}</mo-option>`)}
				</mo-field-select>
			`)

			afterEach(() => closeMenu(fixture.component))

			const checkboxOf = (option: Option<number>) => option.renderRoot.querySelector('mo-checkbox')!

			it('should keep the list where it is, and the clicked option active, when options far down are chosen through their checkboxes', async () => {
				await openMenu(fixture.component)
				const popover = getPopover(fixture.component)!
				const [first, second] = [fixture.component.options[numbers.length - 2]!, fixture.component.options[numbers.length - 5]!]
				first.scrollIntoView({ block: 'nearest' })
				const scrollTop = popover.scrollTop
				expect(scrollTop).toBeGreaterThan(0)

				for (const option of [first, second]) {
					await userEvent.click(checkboxOf(option))
					await settle(fixture.component)
					await frames(2)

					expect(fixture.component.open).toBe(true)
					expect(popover.scrollTop).toBe(scrollTop)
					expect(fixture.component.valueInputElement.ariaActiveDescendantElement).toBe(option)
				}
				expect(fixture.component.value).toEqual([numbers.length - 5, numbers.length - 2])
			})
		})

		describe('popover middlewares', () => {
			it('should size the menu popover to the field\'s inline size', async () => {
				fixture.component.style.width = '240px'
				await openMenu(fixture.component)
				const popover = getPopover(fixture.component)!
				const applyReferenceWidth = async (width: number) => {
					await sameInlineSize().fn({ elements: { floating: popover }, rects: { reference: { width } } } as any)
					await tick(50)
				}

				await applyReferenceWidth(400)
				expect(popover.clientWidth).toBe(400)

				await applyReferenceWidth(fixture.component.getBoundingClientRect().width)
				expect(popover.clientWidth).toBe(240)
			})

			it('should close the menu when the field is scrolled out of the viewport', async () => {
				await openMenu(fixture.component)
				expect(fixture.component.open).toBe(true)
				const outOfViewportAnchor = document.createElement('div')
				outOfViewportAnchor.style.cssText = 'position: fixed; left: 0px; top: -2000px; width: 100px; height: 20px;'
				document.body.appendChild(outOfViewportAnchor)

				try {
					await computePosition(outOfViewportAnchor, getPopover(fixture.component)!, {
						strategy: 'fixed',
						middleware: [closeWhenOutOfViewport()],
					})
					await tick(100)
					await settle(fixture.component)

					expect(fixture.component.open).toBe(false)
				} finally {
					outOfViewportAnchor.remove()
				}
			})
		})
	})

	describe('searchable', () => {
		const fixture = new ComponentTestFixture<FieldSelect<Person>>(html`
			<mo-field-select label='Select' searchable>
				${people.map(p => html`<mo-option value=${p.id} .data=${p}>${p.name}</mo-option>`)}
			</mo-field-select>
		`)

		afterEach(() => closeMenu(fixture.component))

		const pressInput = (component: FieldSelect<Person>) => {
			const event = new MouseEvent('mousedown', { bubbles: true, composed: true, cancelable: true })
			const input = component.searchInputElement ?? component.valueInputElement
			input.dispatchEvent(event)
			return event
		}

		// The press only has to reach the field; where it lands must not become a caret, because focusing
		// turns the same input into the search one and selects the whole of it.
		it('should take the whole text rather than a caret when pressed unfocused', async () => {
			await settle(fixture.component)

			expect(pressInput(fixture.component).defaultPrevented).toBe(true)
		})

		it('should place the caret normally when pressed while already focused', async () => {
			await focusIn(fixture.component)

			expect(pressInput(fixture.component).defaultPrevented).toBe(false)
		})

		it('should render the search input only when focused', async () => {
			expect(fixture.component.searchInputElement).toBeUndefined()

			fixture.component['focusController'].focusIn()
			await fixture.updateComplete

			expect(fixture.component.searchInputElement).toBeDefined()
		})

		it('should hide options not matching the keyword and keep matching ones selectable', async () => {
			await focusIn(fixture.component)

			await type(fixture.component, 'jo')

			expect(visibleOptionTexts(fixture.component)).toEqual(['John', 'Joe'])
			expect(fixture.component.options.filter(o => o.getAttribute('aria-disabled') !== 'true').map(o => o.text)).toEqual(['John', 'Joe'])
		})

		it('should keep an option the consumer disabled disabled after searching', async () => {
			fixture.component.options[2]!.disabled = true
			await focusIn(fixture.component)
			await type(fixture.component, 'j')

			focusOut(fixture.component)
			await settle(fixture.component)

			expect(fixture.component.options.map(o => o.disabled)).toEqual([false, false, true, false])
		})

		it('should make the first match the active option, which Enter chooses', async () => {
			const input = () => fixture.component.searchInputElement!
			await focusIn(fixture.component)

			await type(fixture.component, 'jo')
			await waitUntil(() => input().ariaActiveDescendantElement === fixture.component.options[1])
			expect(input().ariaActiveDescendantElement).toBe(fixture.component.options[1])

			pressKey(input(), 'Enter')
			await settle(fixture.component)

			expect(fixture.component.value).toBe(1)
		})

		it('should move the active option to the first match of what is typed next', async () => {
			const input = () => fixture.component.searchInputElement!
			await focusIn(fixture.component)
			await type(fixture.component, 'j')
			await waitUntil(() => input().ariaActiveDescendantElement === fixture.component.options[1])

			await type(fixture.component, 'ja')

			expect(input().ariaActiveDescendantElement).toBe(fixture.component.options[2])
		})

		it('should restore the selection\'s text and every option once the menu closes', async () => {
			fixture.component.value = 1
			await settle(fixture.component)
			await focusIn(fixture.component)
			await type(fixture.component, 'zzz')
			expect(fixture.component.open).toBe(true)

			pressKey(fixture.component.searchInputElement!, 'Escape')
			await settle(fixture.component)

			expect(fixture.component.open).toBe(false)
			expect(fixture.component.searchInputElement!.value).toBe('John')
			expect(visibleOptionTexts(fixture.component)).toEqual(people.map(p => p.name))
		})

		it('should reach every option again after choosing a searched one by keyboard and reopening', async () => {
			const input = () => fixture.component.searchInputElement ?? fixture.component.valueInputElement
			const press = (key: string) => input().dispatchEvent(new KeyboardEvent('keydown', { key, bubbles: true, composed: true, cancelable: true }))
			const active = () => input().ariaActiveDescendantElement?.textContent?.trim()
			await focusIn(fixture.component)
			await type(fixture.component, 'jane')
			press('ArrowDown')
			press('Enter')
			await settle(fixture.component)
			expect(fixture.component.value).toBe(2)
			expect(fixture.component.open).toBe(false)

			press('ArrowDown')
			const start = performance.now()
			while (active() !== 'Jane' && performance.now() - start < 1000) {
				await tick(10)
			}
			expect(active()).toBe('Jane')

			press('ArrowDown')
			expect(active()).toBe('Joe')
			press('ArrowUp')
			press('ArrowUp')
			expect(active()).toBe('John')
		})

		it('should keep the menu open while typing', async () => {
			await focusIn(fixture.component)
			expect(fixture.component.open).toBe(false)

			await type(fixture.component, 'j')
			expect(fixture.component.open).toBe(true)

			await type(fixture.component, 'jo')
			expect(fixture.component.open).toBe(true)
		})

		it('should show the no-results hint when no option matches the keyword', async () => {
			await focusIn(fixture.component)
			expect(isNoResultsHintVisible(fixture.component)).toBe(false)

			await type(fixture.component, 'zzz')

			expect(visibleOptionTexts(fixture.component)).toEqual([])
			expect(isNoResultsHintVisible(fixture.component)).toBe(true)
		})

		it('should show the no-results hint in place of the default option', async () => {
			fixture.component.default = 'Anyone'
			await focusIn(fixture.component)

			await type(fixture.component, 'zzz')

			expect(isNoResultsHintVisible(fixture.component)).toBe(true)
			expect(isShown(fixture.component.listItems.find(item => item.getAttribute('value') === ''))).toBe(false)
		})

		it('should keep the default option while its text matches what is typed', async () => {
			fixture.component.default = 'Anyone'
			await focusIn(fixture.component)

			await type(fixture.component, 'any')

			expect(isShown(fixture.component.listItems.find(item => item.getAttribute('value') === ''))).toBe(true)
		})

		describe('with text to match', () => {
			const fixture = new ComponentTestFixture<FieldSelect<string>>(html`
				<mo-field-select label='Country' searchable>
					<mo-option value='AE'>United Arab Emirates</mo-option>
					<mo-option value='CI'>Côte d'Ivoire</mo-option>
					<mo-option value='DE'>Germany</mo-option>
				</mo-field-select>
			`)

			afterEach(() => closeMenu(fixture.component))

			for (const [keyword, expected] of [
				['arab united', ['United Arab Emirates']],
				['  united   arab ', ['United Arab Emirates']],
				['unitedarab', ['United Arab Emirates']],
				['COTE', ['Côte d\'Ivoire']],
				['côte', ['Côte d\'Ivoire']],
			] as const) {
				it(`should match every word typed, whatever its order, case, accents and spacing ("${keyword}")`, async () => {
					await focusIn(fixture.component)

					await type(fixture.component, keyword)

					expect(visibleOptionTexts(fixture.component)).toEqual(expected)
				})
			}
		})

		it('should restore the full option list and the selected value\'s text on blur', async () => {
			fixture.component.value = 1
			await settle(fixture.component)
			await focusIn(fixture.component)
			await type(fixture.component, 'zzz')
			expect(visibleOptionTexts(fixture.component)).toEqual([])

			focusOut(fixture.component)
			await settle(fixture.component)

			expect(visibleOptionTexts(fixture.component)).toEqual(people.map(p => p.name))
			expect(fixture.component.valueInputElement.value).toBe('John')
		})

		it('should reset the search text to the selected option\'s text after selecting', async () => {
			await focusIn(fixture.component)
			await type(fixture.component, 'jo')

			fixture.component.options[1]!.click()
			await settle(fixture.component)

			expect(fixture.component.value).toBe(1)
			expect(fixture.component.searchInputElement!.value).toBe('John')
		})

		it('should clear the search text and refocus the input via the clear icon button', async () => {
			await focusIn(fixture.component)
			await type(fixture.component, 'jo')
			const clearIconButton = fixture.component.renderRoot.querySelector('mo-icon-button')

			clearIconButton!.click()
			await settle(fixture.component)

			expect(fixture.component.searchInputElement!.value).toBe('')
			expect(document.activeElement).toBe(fixture.component)
		})
	})

	describe('freeInput', () => {
		const fixture = new ComponentTestFixture<FieldSelect<Person>>(html`
			<mo-field-select label='Select' freeInput>
				${people.map(p => html`<mo-option value=${p.id} .data=${p}>${p.name}</mo-option>`)}
			</mo-field-select>
		`)

		afterEach(() => closeMenu(fixture.component))

		it('should initialize the search keyword to the currently selected value', async () => {
			fixture.component.value = 1

			await Promise.all([fixture.updateComplete, tick()])

			expect(fixture.component.searchInputElement!.value).toBe('John')
		})

		it('should not update the initialized search keyword only because options changed', async () => {
			fixture.component.value = 1

			await Promise.all([fixture.updateComplete, tick()])
			fixture.component.searchInputElement!.value = 'User keyword'
			fixture.component.searchInputElement!.dispatchEvent(new Event('input', { bubbles: true }))

			// This can happen in many scenarios, e.g. when the options are fetched from a server
			fixture.component.options[1]!.requestSelectValueUpdate.dispatch()
			await Promise.all([fixture.updateComplete, tick()])

			expect(fixture.component.searchInputElement!.value).toBe('User keyword')
		})

		it('should populate the field when the input is not empty even if no option is selected', async () => {
			const input = fixture.component.searchInputElement!

			input.value = 'John'
			input.dispatchEvent(new Event('input', { bubbles: true }))
			await fixture.updateComplete

			expect(fixture.component.renderRoot.querySelector('mo-field')?.populated).toBe(true)
		})

		it('should dispatch input with the typed text', async () => {
			const inputSpy = vi.fn()
			fixture.component.input.subscribe(inputSpy)

			await type(fixture.component, 'Custom text')

			expect(inputSpy).toHaveBeenCalledExactlyOnceWith('Custom text')
		})

		it('should keep the typed text as the value on blur, with neither data nor index', async () => {
			await focusIn(fixture.component)
			fixture.component.value = 1
			await settle(fixture.component)
			const { changeSpy, dataChangeSpy, indexChangeSpy } = spyOnChangeEvents(fixture.component)
			await type(fixture.component, 'Custom text')

			focusOut(fixture.component)
			await settle(fixture.component)

			expect(fixture.component.searchInputElement!.value).toBe('Custom text')
			expect(fixture.component.value).toBe('Custom text')
			expect(fixture.component.data).toBeUndefined()
			expect(fixture.component.index).toBeUndefined()
			expect(changeSpy).toHaveBeenCalledExactlyOnceWith('Custom text')
			expect(dataChangeSpy).toHaveBeenCalledOnce()
			expect(indexChangeSpy).toHaveBeenCalledOnce()
		})

		it('should keep the typed text as the value on Enter and close', async () => {
			await type(fixture.component, 'Custom text')
			expect(fixture.component.open).toBe(true)

			expect(pressKey(fixture.component.searchInputElement!, 'Enter').defaultPrevented).toBe(true)
			await settle(fixture.component)

			expect(fixture.component.value).toBe('Custom text')
			expect(fixture.component.open).toBe(false)
		})

		it('should select the option whose text was typed', async () => {
			await focusIn(fixture.component)
			await type(fixture.component, 'jane ')

			focusOut(fixture.component)
			await settle(fixture.component)

			expect(fixture.component.value).toBe(2)
			expect(fixture.component.data).toBe(people[2])
			expect(fixture.component.searchInputElement!.value).toBe('Jane')
		})

		it('should keep text that reads like an option\'s value as text', async () => {
			await focusIn(fixture.component)
			await type(fixture.component, '1')

			focusOut(fixture.component)
			await settle(fixture.component)

			expect(fixture.component.value).toBe('1')
			expect(fixture.component.data).toBeUndefined()
		})

		it('should clear the value when the text is cleared', async () => {
			await focusIn(fixture.component)
			fixture.component.value = 1
			await settle(fixture.component)
			const { changeSpy } = spyOnChangeEvents(fixture.component)
			await type(fixture.component, '')

			focusOut(fixture.component)
			await settle(fixture.component)

			expect(fixture.component.value).toBeUndefined()
			expect(changeSpy).toHaveBeenCalledOnce()
		})

		it('should not dispatch change when focus leaves without an edit', async () => {
			fixture.component.value = 1
			await settle(fixture.component)
			const { changeSpy } = spyOnChangeEvents(fixture.component)
			await focusIn(fixture.component)

			focusOut(fixture.component)
			await settle(fixture.component)

			expect(changeSpy).not.toHaveBeenCalled()
			expect(fixture.component.value).toBe(1)
		})

		it('should take back what was typed on Escape once the menu is closed', async () => {
			fixture.component.value = 1
			await settle(fixture.component)
			await type(fixture.component, 'Custom text')
			const input = fixture.component.searchInputElement!

			pressKey(input, 'Escape')
			await settle(fixture.component)
			expect(fixture.component.open).toBe(false)
			expect(input.value).toBe('Custom text')

			expect(pressKey(input, 'Escape').defaultPrevented).toBe(true)
			await settle(fixture.component)

			expect(input.value).toBe('John')
			expect(fixture.component.value).toBe(1)
		})

		it('should show a text value set from outside', async () => {
			fixture.component.value = 'Custom text'
			await settle(fixture.component)

			expect(fixture.component.searchInputElement!.value).toBe('Custom text')
			expect(fixture.component.value).toBe('Custom text')
			expect(fixture.component.data).toBeUndefined()
		})

		it('should clear the search text, the value and refocus the input via the clear icon button', async () => {
			fixture.component.value = 1
			await settle(fixture.component)
			await type(fixture.component, 'Custom text')
			const clearIconButton = fixture.component.renderRoot.querySelector('mo-icon-button')

			clearIconButton!.click()
			await settle(fixture.component)

			expect(fixture.component.searchInputElement!.value).toBe('')
			expect(fixture.component.value).toBeUndefined()
			expect(document.activeElement).toBe(fixture.component)
		})

		it('should not show the no-results hint even when nothing matches', async () => {
			await waitUntil(() => fixture.component.options.length === people.length)

			await type(fixture.component, 'zzz')

			expect(visibleOptionTexts(fixture.component)).toEqual([])
			expect(isNoResultsHintVisible(fixture.component)).toBe(false)
		})
	})

	describe('as a combobox over a listbox', () => {
		const input = () => fixture.component.valueInputElement
		const listbox = () => fixture.component.renderRoot.querySelector<HTMLElement>('#listbox')!
		const press = (key: string) => {
			const event = new KeyboardEvent('keydown', { key, bubbles: true, composed: true, cancelable: true })
			input().dispatchEvent(event)
			return event
		}

		beforeEach(() => settle(fixture.component))

		it('should make its input a combobox that controls a listbox of options', async () => {
			await openMenu(fixture.component)

			expect(input().getAttribute('role')).toBe('combobox')
			expect(input().getAttribute('aria-label')).toBe('Select')
			expect(input().ariaControlsElements).toEqual([listbox()])
			expect(listbox().getAttribute('role')).toBe('listbox')
			expect(fixture.component.options.map(option => option.getAttribute('role'))).toEqual(Array(people.length).fill('option'))
		})

		it('should say whether the listbox is expanded', async () => {
			expect(input().getAttribute('aria-expanded')).toBe('false')

			await openMenu(fixture.component)

			expect(input().getAttribute('aria-expanded')).toBe('true')
		})

		it('should say which option is selected', async () => {
			fixture.component.value = 2
			await settle(fixture.component)

			expect(fixture.component.options.map(option => option.getAttribute('aria-selected'))).toEqual(['false', 'false', 'true', 'false'])
		})

		it('should say it takes several options in multiple mode', async () => {
			expect(listbox().hasAttribute('aria-multiselectable')).toBe(false)

			fixture.component.multiple = true
			await settle(fixture.component)

			expect(listbox().getAttribute('aria-multiselectable')).toBe('true')
		})

		it('should announce the active option on the input while open, and none once closed', async () => {
			await openMenu(fixture.component)
			press('ArrowDown')
			press('ArrowDown')
			expect(input().ariaActiveDescendantElement).toBe(fixture.component.options[1]!)

			await closeMenu(fixture.component)
			await settle(fixture.component)

			expect(input().ariaActiveDescendantElement).toBeNull()
		})

		it('should choose the active option on Enter and close', async () => {
			await openMenu(fixture.component)
			press('ArrowDown')
			press('ArrowDown')
			press('ArrowDown')

			expect(press('Enter').defaultPrevented).toBe(true)
			await settle(fixture.component)

			expect(fixture.component.value).toBe(2)
			expect(fixture.component.open).toBe(false)
		})

		it('should move to the option whose text starts with the letters typed', async () => {
			await openMenu(fixture.component)

			press('j')
			expect(input().ariaActiveDescendantElement).toBe(fixture.component.options[1]!)

			press('o')
			press('e')
			expect(input().ariaActiveDescendantElement).toBe(fixture.component.options[3]!)
		})

		it('should choose the active option on Space, since the input takes no typing', async () => {
			await openMenu(fixture.component)
			press('ArrowDown')
			press('ArrowDown')

			expect(press(' ').defaultPrevented).toBe(true)
			await settle(fixture.component)

			expect(fixture.component.value).toBe(1)
		})

		it('should keep focus in the input when an option is pressed', async () => {
			await openMenu(fixture.component)
			const pressed = new MouseEvent('mousedown', { bubbles: true, composed: true, cancelable: true })

			fixture.component.options[1]!.dispatchEvent(pressed)

			expect(pressed.defaultPrevented).toBe(true)
		})

		it('should run an option\'s own click handler after choosing it, so the handler has the last word', async () => {
			const option = fixture.component.options[3]!
			const { changeSpy } = spyOnChangeEvents()
			option.addEventListener('click', () => fixture.component.value = undefined)

			option.click()
			await settle(fixture.component)

			expect(changeSpy).toHaveBeenCalledExactlyOnceWith(3)
			expect(fixture.component.value).toBeUndefined()
		})

		it('should run that handler for Enter as well', async () => {
			const option = fixture.component.options[1]!
			const handler = vi.fn()
			option.addEventListener('click', handler)
			await openMenu(fixture.component)
			press('ArrowDown')
			press('ArrowDown')

			press('Enter')

			expect(handler).toHaveBeenCalledOnce()
		})
	})

	describe('with list items that are not options', () => {
		const fixture = new ComponentTestFixture<FieldSelect<Person>>(html`
			<mo-field-select label='Select'>
				<mo-list-item id='action'>Add a person</mo-list-item>
				${people.map(p => html`<mo-option value=${p.id} .data=${p}>${p.name}</mo-option>`)}
			</mo-field-select>
		`)

		afterEach(() => closeMenu(fixture.component))

		it('should reach them with the arrows but never select them', async () => {
			await settle(fixture.component)
			fixture.component.value = 2
			await settle(fixture.component)
			const action = fixture.component.querySelector('#action')!
			await openMenu(fixture.component)

			for (let step = 0; step < 3; step++) {
				fixture.component.valueInputElement.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowUp', bubbles: true, composed: true, cancelable: true }))
			}
			expect(fixture.component.valueInputElement.ariaActiveDescendantElement).toBe(action)
			action.dispatchEvent(new MouseEvent('click', { bubbles: true, composed: true }))
			await settle(fixture.component)

			expect(fixture.component.listItems[0]).toBe(action)
			expect(fixture.component.value).toBe(2)
			expect(fixture.component.open).toBe(false)
		})
	})

	describe('without options', () => {
		const fixture = new ComponentTestFixture<FieldSelect<string>>(html`<mo-field-select label='Empty'></mo-field-select>`)

		afterEach(() => closeMenu(fixture.component))

		it('should say there are none', async () => {
			await openMenu(fixture.component)

			expect(hintText(fixture.component)).toBe('No options')
		})
	})

	describe('validation', () => {
		const fixture = new ComponentTestFixture<FieldSelect<Person>>(html`
			<mo-field-select label='Select' required default='Nobody' reflectDefault>
				${people.map(p => html`<mo-option value=${p.id} .data=${p}>${p.name}</mo-option>`)}
			</mo-field-select>
		`)

		const isInvalid = () => fixture.component.renderRoot.querySelector('mo-field')!.invalid

		it('should be invalid while required and nothing but the default is selected', async () => {
			expect(await fixture.component.checkValidity()).toBe(false)
		})

		it('should be valid once an option is selected, and turn invalid when the selection is cleared', async () => {
			fixture.component.value = 1
			await settle(fixture.component)
			expect(await fixture.component.checkValidity()).toBe(true)
			expect(isInvalid()).toBe(false)

			fixture.component.value = undefined
			await settle(fixture.component)

			expect(await fixture.component.checkValidity()).toBe(false)
			expect(isInvalid()).toBe(true)
		})

		it('should be invalid while a custom validity message is set', async () => {
			fixture.component.value = 1
			await settle(fixture.component)

			fixture.component.setCustomValidity('Taken')
			expect(await fixture.component.checkValidity()).toBe(false)

			fixture.component.setCustomValidity('')
			expect(await fixture.component.checkValidity()).toBe(true)
		})
	})

	describe('with options carrying neither value nor data', () => {
		const fixture = new ComponentTestFixture<FieldSelect<unknown>>(html`
			<mo-field-select label='Select' required index='1'>
				<mo-option>Germany</mo-option>
				<mo-option>France</mo-option>
			</mo-field-select>
		`)

		it('should lift the label over the text of the selected option', async () => {
			await settle(fixture.component)

			expect(fixture.component.valueInputElement.value).toBe('France')
			expect(fixture.component.renderRoot.querySelector('mo-field')!.populated).toBe(true)
		})

		it('should count the option as a selection when required', async () => {
			await settle(fixture.component)

			expect(await fixture.component.checkValidity()).toBe(true)
		})
	})

	describe('change event dispatching', () => {
		it('should dispatch change events and select the option on user interaction', async () => {
			const { changeSpy, dataChangeSpy, indexChangeSpy } = spyOnChangeEvents()

			await tick()
			fixture.component.options[1]!.click()

			expect(fixture.component.options[1]!.selected).toBe(true)
			expect(indexChangeSpy).toHaveBeenCalledWith(1)
			expect(changeSpy).toHaveBeenCalledExactlyOnceWith(1)
			expect(dataChangeSpy).toHaveBeenCalledWith(people[1])
		})

		it('should not dispatch change events when values changed programmatically', async () => {
			const { changeSpy, dataChangeSpy, indexChangeSpy } = spyOnChangeEvents()

			fixture.component.value = 1
			await fixture.updateComplete

			expect(indexChangeSpy).not.toHaveBeenCalled()
			expect(changeSpy).not.toHaveBeenCalled()
			expect(dataChangeSpy).not.toHaveBeenCalled()
		})
	})

	describe('multiple selection', () => {
		beforeEach(() => fixture.component.multiple = true)

		async function expectSelected(index: Array<number>) {
			await fixture.updateComplete
			await tick()

			expect(fixture.component.index).toEqual(index)
			expect(fixture.component.value).toEqual(index.map(i => people[i]!.id))
			expect(fixture.component.data).toEqual(index.map(i => people[i]!))
			expect(fixture.component.valueInputElement.value).toBe(index.map(i => people[i]!.name).join(', '))
		}

		it('should select the option by value', async () => {
			fixture.component.value = [1, 3]
			await expectSelected([1, 3])
		})

		it('should select the option by index', async () => {
			fixture.component.index = [1, 3]
			await expectSelected([1, 3])
		})

		it('should select the option by data', async () => {
			fixture.component.data = [people[1]!, people[3]!]
			await expectSelected([1, 3])
		})

		it('should stay populated when an option selected', async () => {
			expect(fixture.component.renderRoot.querySelector('mo-field')?.populated).toBe(false)

			fixture.component.value = [1, 3]
			await fixture.updateComplete
			expect(fixture.component.renderRoot.querySelector('mo-field')?.populated).toBe(true)

			fixture.component.value = [0, 1]
			await fixture.updateComplete
			expect(fixture.component.renderRoot.querySelector('mo-field')?.populated).toBe(true)

			fixture.component.value = []
			await fixture.updateComplete
			expect(fixture.component.renderRoot.querySelector('mo-field')?.populated).toBe(false)
		})

		it('should format the value input as a comma-separated list of option texts', async () => {
			fixture.component.value = [3, 1]
			await settle(fixture.component)

			expect(fixture.component.valueInputElement.value).toBe('John, Joe')
		})

		it('should show the whole selection as a tooltip, as the input cuts it short', async () => {
			fixture.component.value = [1, 2]
			await settle(fixture.component)

			expect(fixture.component.valueInputElement.title).toBe('John, Jane')
			expect(getComputedStyle(fixture.component.valueInputElement).textOverflow).toBe('ellipsis')
		})

		it('should keep what was typed while its menu stays open, and restore the selection\'s text once it closes', async () => {
			fixture.component.searchable = true
			await focusIn(fixture.component)
			await type(fixture.component, 'jo')
			await waitUntil(() => !!getPopover(fixture.component)?.matches(':popover-open'))

			await userEvent.click(fixture.component.options[1]!.renderRoot.querySelector('mo-checkbox')!)
			await settle(fixture.component)

			expect(fixture.component.value).toEqual([1])
			expect(fixture.component.open).toBe(true)
			expect(fixture.component.searchInputElement!.value).toBe('jo')
			expect(visibleOptionTexts(fixture.component)).toEqual(['John', 'Joe'])

			await closeMenu(fixture.component)
			await settle(fixture.component)

			expect(fixture.component.searchInputElement!.value).toBe('John')
			expect(visibleOptionTexts(fixture.component)).toEqual(people.map(p => p.name))
		})

		it('should render a checkbox in each option', async () => {
			await settle(fixture.component)
			await Promise.all(fixture.component.options.map(option => option.updateComplete))

			expect(fixture.component.options.length).toBe(people.length)
			expect(fixture.component.options.filter(option => !!option.renderRoot.querySelector('mo-checkbox')).length).toBe(people.length)
		})

		describe('by clicking', () => {
			const settleClick = async () => {
				await fixture.updateComplete
				await tick()
			}

			const click = async (index: number, { shift = false } = {}) => {
				const option = fixture.component.options[index]!
				option.dispatchEvent(new PointerEvent('pointerdown', { bubbles: true, composed: true, shiftKey: shift }))
				option.dispatchEvent(new MouseEvent('click', { bubbles: true, composed: true, cancelable: true, shiftKey: shift }))
				window.dispatchEvent(new KeyboardEvent('keyup', { key: 'Shift' }))
				await settleClick()
			}

			beforeEach(settleClick)

			it('should add each option clicked', async () => {
				await click(1)
				await click(3)
				expect(fixture.component.index).toEqual([1, 3])
			})

			it('should dispatch each event with the whole selection', async () => {
				await click(1)
				const { changeSpy, dataChangeSpy, indexChangeSpy } = spyOnChangeEvents()

				await click(3)

				expect(changeSpy).toHaveBeenCalledExactlyOnceWith([people[1]!.id, people[3]!.id])
				expect(dataChangeSpy).toHaveBeenCalledExactlyOnceWith([people[1]!, people[3]!])
				expect(indexChangeSpy).toHaveBeenCalledExactlyOnceWith([1, 3])
			})

			it('should dispatch each event with the whole selection after a range', async () => {
				await click(1)
				const { changeSpy, dataChangeSpy, indexChangeSpy } = spyOnChangeEvents()

				await click(3, { shift: true })

				expect(changeSpy).toHaveBeenCalledExactlyOnceWith([1, 2, 3].map(i => people[i]!.id))
				expect(dataChangeSpy).toHaveBeenCalledExactlyOnceWith([1, 2, 3].map(i => people[i]!))
				expect(indexChangeSpy).toHaveBeenCalledExactlyOnceWith([1, 2, 3])
			})

			it('should remove an option clicked again', async () => {
				await click(1)
				await click(3)
				await click(1)
				expect(fixture.component.index).toEqual([3])
			})

			it('should extend over the run when shift is held', async () => {
				await click(1)
				await click(3, { shift: true })
				expect(fixture.component.index).toEqual([1, 2, 3])
			})

			it('should remove the run where the anchor was left deselected', async () => {
				await click(0)
				await click(3, { shift: true })
				expect(fixture.component.index).toEqual([0, 1, 2, 3])

				await click(1)
				await click(3, { shift: true })
				expect(fixture.component.index).toEqual([0])
			})
		})
	})

	describe('selecting through the menu', () => {
		const click = async (index: number) => {
			fixture.component.options[index]!.click()
			await settle(fixture.component)
		}

		beforeEach(() => settle(fixture.component))

		it('should replace the selection when another option is clicked in single mode', async () => {
			await click(1)
			expect(fixture.component.index).toBe(1)

			const { changeSpy, dataChangeSpy, indexChangeSpy } = spyOnChangeEvents()
			await click(3)

			expect(fixture.component.index).toBe(3)
			expect(fixture.component.selectedOptions.length).toBe(1)
			expect(changeSpy).toHaveBeenCalledExactlyOnceWith(3)
			expect(dataChangeSpy).toHaveBeenCalledExactlyOnceWith(people[3]!)
			expect(indexChangeSpy).toHaveBeenCalledExactlyOnceWith(3)
		})

		it('should not dispatch anything when the selected option is clicked again in single mode', async () => {
			await click(1)
			const { changeSpy, dataChangeSpy, indexChangeSpy } = spyOnChangeEvents()

			await click(1)

			expect(fixture.component.index).toBe(1)
			expect(changeSpy).not.toHaveBeenCalled()
			expect(dataChangeSpy).not.toHaveBeenCalled()
			expect(indexChangeSpy).not.toHaveBeenCalled()
		})

		it('should keep the selection resolved after the option list has been re-indexed', async () => {
			await click(2)
			expect(fixture.component.index).toBe(2)

			fixture.component['handleItemsChange']()
			await settle(fixture.component)

			expect(fixture.component.index).toBe(2)
			expect(fixture.component.value).toBe(2)
			expect(fixture.component.data).toBe(people[2]!)
		})
	})
})
