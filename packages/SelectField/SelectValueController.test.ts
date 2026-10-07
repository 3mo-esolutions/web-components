import { ComponentTestFixture } from '@a11d/lit-testing'
import { html } from '@a11d/lit'
import { Option, type FieldSelect } from './index.js'
import type { Value } from './SelectValueController.js'
import '@3mo/date-time'

type Person = { id: number, name: string, birthDate: DateTime }

const people = new Array<Person>(
	{ id: 0, name: 'Pseudo-default Option', birthDate: new DateTime(1900, 0, 0) },
	{ id: 1, name: 'John', birthDate: new DateTime(2000, 0, 0) },
	{ id: 2, name: 'Jane', birthDate: new DateTime(2000, 0, 0) },
	{ id: 3, name: 'Joe', birthDate: new DateTime(2000, 0, 0) },
)

const tick = (duration = 0) => new Promise(resolve => setTimeout(resolve, duration))

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

describe('FieldSelectValueController', () => {
	const fixture = new ComponentTestFixture<FieldSelect<Person>>(html`
		<mo-field-select label='Select'>
			${people.map(p => html`<mo-option value=${p.id} .data=${p}>${p.name}</mo-option>`)}
		</mo-field-select>
	`)

	function spyOnChangeEvents(component: FieldSelect<unknown> = fixture.component) {
		const changeSpy = vi.fn()
		const dataChangeSpy = vi.fn()
		const indexChangeSpy = vi.fn()
		component.change.subscribe(changeSpy)
		component.dataChange.subscribe(dataChangeSpy)
		component.indexChange.subscribe(indexChangeSpy)
		return { changeSpy, dataChangeSpy, indexChangeSpy }
	}

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

			expect(option.selected).toBe(true)
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

	describe('value, index and data', () => {
		it('should derive index and data from a value set as an attribute', async () => {
			fixture.component.setAttribute('value', '2')
			await settle(fixture.component)

			expect(fixture.component.value).toBe(2)
			expect(fixture.component.index).toBe(2)
			expect(fixture.component.data).toBe(people[2]!)
		})

		it('should normalize a numeric string value to the option\'s number value', async () => {
			fixture.component.value = '3'
			await settle(fixture.component)

			expect(fixture.component.value as Value).toBe(3)
			expect(fixture.component.index).toBe(3)
		})

		it('should let the last written of value, index and data win', async () => {
			fixture.component.value = 1
			await settle(fixture.component)
			expect(fixture.component.index).toBe(1)

			fixture.component.index = 2
			await settle(fixture.component)
			expect(fixture.component.value).toBe(2)

			fixture.component.data = people[3]!
			await settle(fixture.component)
			expect(fixture.component.value).toBe(3)
			expect(fixture.component.index).toBe(3)
		})

		it('should clear index and data when the value is set to undefined', async () => {
			fixture.component.value = 1
			await settle(fixture.component)

			fixture.component.value = undefined
			await settle(fixture.component)

			expect(fixture.component.index).toBeUndefined()
			expect(fixture.component.data).toBeUndefined()
			expect(fixture.component.selectedOptions.length).toBe(0)
			expect(fixture.component.valueInputElement.value).toBe('')
		})

		it('should stay settled when the same value is written again', async () => {
			fixture.component.value = 1
			await settle(fixture.component)
			const { changeSpy, dataChangeSpy, indexChangeSpy } = spyOnChangeEvents()

			fixture.component.value = 1
			await settle(fixture.component)

			expect(fixture.component.index).toBe(1)
			expect(fixture.component.data).toBe(people[1]!)
			expect(changeSpy).not.toHaveBeenCalled()
			expect(dataChangeSpy).not.toHaveBeenCalled()
			expect(indexChangeSpy).not.toHaveBeenCalled()
		})

		it('should keep the value and re-derive the index when the options are reordered', async () => {
			fixture.component.value = 1
			await settle(fixture.component)
			expect(fixture.component.index).toBe(1)

			const option = fixture.component.options[1]!
			fixture.component.insertBefore(option, fixture.component.firstElementChild)
			await settle(fixture.component)

			expect(fixture.component.value).toBe(1)
			expect(fixture.component.data).toBe(people[1]!)
			expect(fixture.component.index).toBe(0)
		})

		it('should keep the index and re-derive the value when the options are reordered after an index was set', async () => {
			fixture.component.index = 1
			await settle(fixture.component)
			expect(fixture.component.value).toBe(1)

			const option = fixture.component.options[1]!
			fixture.component.insertBefore(option, fixture.component.firstElementChild)
			await settle(fixture.component)

			expect(fixture.component.index).toBe(1)
			expect(fixture.component.value).toBe(0)
		})

		it('should shift the indices by the default option', async () => {
			fixture.component.default = 'Select...'
			await settle(fixture.component)

			fixture.component.value = 1
			await settle(fixture.component)

			expect(fixture.component.index).toBe(2)
			expect(fixture.component.data).toBe(people[1]!)
		})

		it('should select an option carrying neither value nor data by index', async () => {
			const option = new Option<Person>()
			option.textContent = 'Bare'
			fixture.component.appendChild(option)
			await settle(fixture.component)

			fixture.component.index = people.length
			await settle(fixture.component)

			expect(option.selected).toBe(true)
			expect(fixture.component.valueInputElement.value).toBe('Bare')
		})

		it('should resolve a value against an option whose value arrives later', async () => {
			const option = new Option<Person>()
			option.textContent = 'Late'
			fixture.component.appendChild(option)
			fixture.component.value = 99
			await settle(fixture.component)
			expect(option.selected).toBe(false)

			option.value = '99'
			await settle(fixture.component)

			expect(option.selected).toBe(true)
			expect(fixture.component.data).toBeUndefined()
		})
	})

	describe('switching between single and multiple', () => {
		it('should pluralize value, index and data when multiple is turned on', async () => {
			fixture.component.value = 1
			await settle(fixture.component)

			fixture.component.multiple = true
			await settle(fixture.component)

			expect(fixture.component.value as Value).toEqual([1])
			expect(fixture.component.index).toEqual([1])
			expect(fixture.component.data).toEqual([people[1]!])
		})

		it('should keep only the first selection when multiple is turned off', async () => {
			fixture.component.multiple = true
			fixture.component.value = [1, 3]
			await settle(fixture.component)

			fixture.component.multiple = false
			await settle(fixture.component)

			expect(fixture.component.value as Value).toBe(1)
			expect(fixture.component.index).toBe(1)
			expect(fixture.component.data).toBe(people[1]!)
			expect(fixture.component.selectedOptions.length).toBe(1)
		})
	})
})
