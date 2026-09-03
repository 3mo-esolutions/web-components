import { ComponentTestFixture } from '@a11d/lit-testing'
import { Option, type FieldSelect } from './index.js'
import { html } from '@a11d/lit'
import { PopoverAlignment, PopoverPlacement } from '@3mo/popover'
import { computePosition } from '@floating-ui/dom'
import { closeWhenOutOfViewport } from './closeWhenOutOfViewport.js'
import { sameInlineSize } from './sameInlineSize.js'
import '@3mo/date-time'
import '.'

type Person = { id: number, name: string, birthDate: DateTime }

const people = new Array<Person>(
	{ id: 0, name: 'Pseudo-default Option', birthDate: new DateTime(1900, 0, 0) },
	{ id: 1, name: 'John', birthDate: new DateTime(2000, 0, 0) },
	{ id: 2, name: 'Jane', birthDate: new DateTime(2000, 0, 0) },
	{ id: 3, name: 'Joe', birthDate: new DateTime(2000, 0, 0) },
)

const tick = (duration = 0) => new Promise(resolve => setTimeout(resolve, duration))

const getPopover = (component: FieldSelect<unknown>) => component.menu?.renderRoot.querySelector('mo-popover') ?? undefined

const getNoResultsHint = (component: FieldSelect<unknown>) => component.renderRoot.querySelector('#no-options-hint') as HTMLElement

const isNoResultsHintVisible = (component: FieldSelect<unknown>) => getComputedStyle(getNoResultsHint(component)).display !== 'none'

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
	const menu = component.menu
	if (menu) {
		menu.open = false
		await menu.updateComplete
		if (menu.list) {
			menu.list.focusController.focusOut()
		}
	}
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
		const changeSpy = jasmine.createSpy('change')
		const dataChangeSpy = jasmine.createSpy('dataChange')
		const indexChangeSpy = jasmine.createSpy('indexChange')
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

		it('should open when the field is clicked', async () => {
			const popover = getPopover(fixture.component)!
			const opened = new Promise<void>(resolve => popover.addEventListener('toggle', () => resolve(), { once: true }))

			fixture.component.renderRoot.querySelector('mo-field')!.dispatchEvent(new MouseEvent('click', { bubbles: true, composed: true }))
			await Promise.race([opened, tick(300)])
			await settle(fixture.component)

			expect(fixture.component.open).toBeTrue()
		})

		it('should close after selecting an option in single mode', async () => {
			await openMenu(fixture.component)
			expect(fixture.component.open).toBeTrue()

			fixture.component.options[1]!.click()
			await settle(fixture.component)

			expect(fixture.component.open).toBeFalse()
		})

		// BUG: multi-select menu closes on item click
		xit('should stay open after selecting an option in multiple mode', async () => {
			fixture.component.multiple = true
			await openMenu(fixture.component)
			expect(fixture.component.open).toBeTrue()

			fixture.component.options[1]!.click()
			await settle(fixture.component)

			expect(fixture.component.index).toEqual([1])
			expect(fixture.component.open).toBeTrue()
		})

		for (const [property, attribute, value] of [
			['menuAlignment', 'alignment', PopoverAlignment.End],
			['menuPlacement', 'placement', PopoverPlacement.BlockStart],
		] as const) {
			it(`should tunnel ${property} to the menu`, async () => {
				(fixture.component as any)[property] = value
				await settle(fixture.component)
				await fixture.component.menu!.updateComplete

				expect(fixture.component.menu!.getAttribute(attribute)).toBe(value)
				expect(getPopover(fixture.component)!.getAttribute(attribute)).toBe(value)
			})
		}

		describe('keyboard interaction', () => {
			beforeEach(() => settle(fixture.component))

			for (const key of ['ArrowDown', 'ArrowUp', 'Home', 'End']) {
				it(`should open when a navigation key is pressed on the field (${key})`, async () => {
					expect(fixture.component.open).toBeFalse()

					fixture.component.dispatchEvent(new KeyboardEvent('keydown', { key, bubbles: true, cancelable: true }))
					await settle(fixture.component)

					expect(fixture.component.open).toBeTrue()
				})
			}

			it('should close when Tab is pressed while open', async () => {
				await openMenu(fixture.component)
				expect(fixture.component.open).toBeTrue()

				fixture.component.dispatchEvent(new KeyboardEvent('keydown', { key: 'Tab', bubbles: true, cancelable: true }))
				await settle(fixture.component)

				expect(fixture.component.open).toBeFalse()
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
				expect(option.selected).toBeTrue()
				expect(popover.scrollTop).toBeGreaterThan(0)
				expect(option.getBoundingClientRect().top).toBeGreaterThanOrEqual(popover.getBoundingClientRect().top)
				expect(option.getBoundingClientRect().bottom).toBeLessThanOrEqual(popover.getBoundingClientRect().bottom)
			})

			it('should move the keyboard focus on from the selected option', async () => {
				await openMenu(fixture.component)

				document.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowDown', bubbles: true }))

				expect(fixture.component.menu!.list.focusController.focusedItemIndex).toBe(selectedIndex + 1)
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
				expect(fixture.component.open).toBeTrue()
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

					expect(fixture.component.open).toBeFalse()
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
			expect(fixture.component.options.filter(o => !o.disabled).map(o => o.text)).toEqual(['John', 'Joe'])
		})

		it('should keep the menu open while typing', async () => {
			await focusIn(fixture.component)
			expect(fixture.component.open).toBeFalse()

			await type(fixture.component, 'j')
			expect(fixture.component.open).toBeTrue()

			await type(fixture.component, 'jo')
			expect(fixture.component.open).toBeTrue()
		})

		it('should show the no-results hint when no option matches the keyword', async () => {
			await focusIn(fixture.component)
			expect(isNoResultsHintVisible(fixture.component)).toBeFalse()

			await type(fixture.component, 'zzz')

			expect(visibleOptionTexts(fixture.component)).toEqual([])
			expect(isNoResultsHintVisible(fixture.component)).toBeTrue()
		})

		it('should not show the no-results hint when a default option exists', async () => {
			fixture.component.default = 'Select...'
			await focusIn(fixture.component)

			await type(fixture.component, 'zzz')

			expect(isNoResultsHintVisible(fixture.component)).toBeFalse()
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
			const inputSpy = jasmine.createSpy('input')
			fixture.component.input.subscribe(inputSpy)

			await type(fixture.component, 'Custom text')

			expect(inputSpy).toHaveBeenCalledOnceWith('Custom text')
		})

		it('should keep the typed text on blur instead of resetting to the selected value', async () => {
			fixture.component.value = 1
			await settle(fixture.component)
			await type(fixture.component, 'Custom text')

			focusOut(fixture.component)
			await settle(fixture.component)

			expect(fixture.component.searchInputElement!.value).toBe('Custom text')
		})

		// BUG: resetSearch does not clear keyword in freeInput mode
		xit('should clear the search text and refocus the input via the clear icon button', async () => {
			await type(fixture.component, 'Custom text')
			const clearIconButton = fixture.component.renderRoot.querySelector('mo-icon-button')

			clearIconButton!.click()
			await settle(fixture.component)

			expect(fixture.component.searchInputElement!.value).toBe('')
			expect(document.activeElement).toBe(fixture.component)
		})

		it('should not show the no-results hint even when nothing matches', async () => {
			await waitUntil(() => fixture.component.options.length === people.length)

			await type(fixture.component, 'zzz')

			expect(visibleOptionTexts(fixture.component)).toEqual([])
			expect(isNoResultsHintVisible(fixture.component)).toBeFalse()
		})
	})

	describe('change event dispatching', () => {
		it('should dispatch change events and select the option on user interaction', async () => {
			const { changeSpy, dataChangeSpy, indexChangeSpy } = spyOnChangeEvents()

			await tick()
			fixture.component.renderRoot.querySelector('mo-menu')?.change.dispatch([1])

			expect(fixture.component.options[1]!.selected).toBe(true)
			expect(indexChangeSpy).toHaveBeenCalledWith(1)
			expect(changeSpy).toHaveBeenCalledOnceWith(1)
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

	describe('options changing late', () => {
		const addOption = (value: string, text: string) => {
			const option = new Option<Person>()
			option.setAttribute('value', value)
			option.textContent = text
			fixture.component.appendChild(option)
			return option
		}

		it('should re-resolve the value against options as their values change without dispatching events', async () => {
			const { changeSpy, dataChangeSpy, indexChangeSpy } = spyOnChangeEvents()

			fixture.component.value = 4
			await settle(fixture.component)
			expect(fixture.component.valueInputElement.value).toBe('')

			fixture.component.options[1]!.value = '4'
			await settle(fixture.component)
			expect(fixture.component.valueInputElement.value).toBe('John')

			fixture.component.options[1]!.value = '5'
			await settle(fixture.component)
			expect(fixture.component.valueInputElement.value).toBe('')

			expect(changeSpy).not.toHaveBeenCalled()
			expect(indexChangeSpy).not.toHaveBeenCalled()
			expect(dataChangeSpy).not.toHaveBeenCalled()
		})

		it('should select the matching option once it is added after the value was set', async () => {
			const { changeSpy } = spyOnChangeEvents()
			fixture.component.value = 42
			await settle(fixture.component)
			expect(fixture.component.valueInputElement.value).toBe('')

			const option = addOption('42', 'Late option')
			await waitUntil(() => option.selected)
			await settle(fixture.component)

			expect(option.selected).toBeTrue()
			expect(fixture.component.valueInputElement.value).toBe('Late option')
			expect(changeSpy).not.toHaveBeenCalled()
		})

		it('should resolve index and data once the option matching a preset value arrives', async () => {
			const data = { id: 42, name: 'Late option', birthDate: new DateTime(2000, 0, 0) }
			fixture.component.value = 42
			await settle(fixture.component)
			expect(fixture.component.index).toBeUndefined()

			const option = addOption('42', 'Late option')
			option.data = data
			await waitUntil(() => fixture.component.index !== undefined)
			await settle(fixture.component)

			expect(fixture.component.index).toBe(people.length)
			expect(fixture.component.data).toBe(data)
		})

		it('should clear value, index and data when the selected option is removed', async () => {
			fixture.component.value = 1
			await settle(fixture.component)
			const { changeSpy } = spyOnChangeEvents()
			expect(fixture.component.index).toBe(1)

			fixture.component.options[1]!.remove()
			await waitUntil(() => fixture.component.value === undefined)
			await settle(fixture.component)

			expect(fixture.component.value).toBeUndefined()
			expect(fixture.component.index).toBeUndefined()
			expect(fixture.component.data).toBeUndefined()
			expect(fixture.component.valueInputElement.value).toBe('')
			expect(changeSpy).not.toHaveBeenCalled()
		})
	})

	describe('single selection', () => {
		async function expectSelected(index: number) {
			await fixture.updateComplete
			await tick()

			expect(fixture.component.index).toBe(index)
			expect(fixture.component.value).toBe(people[index]!.id)
			expect(fixture.component.data).toBe(people[index]!)
			expect(fixture.component.valueInputElement.value).toBe(people[index]!.name)
		}

		it('should select the option by value', async () => {
			fixture.component.value = 2
			await expectSelected(2)
		})

		it('should select the option by index', async () => {
			fixture.component.index = 1
			await expectSelected(1)
		})

		it('should select the option by data', async () => {
			fixture.component.data = people[1]!
			await expectSelected(1)
		})

		it('should stay populated when an option selected', async () => {
			expect(fixture.component.renderRoot.querySelector('mo-field')?.populated).toBe(false)

			fixture.component.value = 1
			await fixture.updateComplete
			expect(fixture.component.renderRoot.querySelector('mo-field')?.populated).toBe(true)

			fixture.component.value = 0
			await fixture.updateComplete
			expect(fixture.component.renderRoot.querySelector('mo-field')?.populated).toBe(true)

			fixture.component.value = undefined
			await fixture.updateComplete
			expect(fixture.component.renderRoot.querySelector('mo-field')?.populated).toBe(false)
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

			/** The press carries the modifiers; the option then reports itself with a plain event. */
			const click = async (index: number, { shift = false } = {}) => {
				const option = fixture.component.options[index]!
				option.dispatchEvent(new PointerEvent('pointerdown', { bubbles: true, composed: true, shiftKey: shift }))
				option.click()
				window.dispatchEvent(new KeyboardEvent('keyup', { key: 'Shift' }))
				await settleClick()
			}

			beforeEach(settleClick)

			it('should add each option clicked', async () => {
				await click(1)
				await click(3)
				expect(fixture.component.index).toEqual([1, 3])
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
})