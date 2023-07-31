import { ComponentTestFixture } from '@a11d/lit/dist/test'
import { FieldSelect } from './index.js'
import { html } from '@a11d/lit'
import '@3mo/date-time'

type Person = { id: number, name: string, birthDate: DateTime }

const people = new Array<Person>(
	{ id: 0, name: 'Pseudo-default Option', birthDate: new DateTime(1900, 0, 0) },
	{ id: 1, name: 'John', birthDate: new DateTime(2000, 0, 0) },
	{ id: 2, name: 'Jane', birthDate: new DateTime(2000, 0, 0) },
	{ id: 3, name: 'Joe', birthDate: new DateTime(2000, 0, 0) },
)

describe('FieldSelect', () => {
	const fixture = new ComponentTestFixture<FieldSelect<Person>>(html`
		<mo-field-select label='Select'>
			${people.map(p => html`<mo-option value=${p.id} .data=${p}>${p.name}</mo-option>`)}
		</mo-field-select>
	`)

	const getDefaultOption = () => fixture.component.listItems.find(i => i.getAttribute('value') === '')

	function spyOnChangeEvents() {
		const changeSpy = jasmine.createSpy('change')
		const dataChangeSpy = jasmine.createSpy('dataChange')
		const indexChangeSpy = jasmine.createSpy('indexChange')
		fixture.component.change.subscribe(changeSpy)
		fixture.component.dataChange.subscribe(dataChangeSpy)
		fixture.component.indexChange.subscribe(indexChangeSpy)
		return { changeSpy, dataChangeSpy, indexChangeSpy }
	}

	it('should render a default option when default property is set', async () => {
		expect(getDefaultOption()).toBeUndefined()

		fixture.component.default = 'Select...'
		await fixture.updateComplete

		const defaultOption = getDefaultOption()
		expect(defaultOption).toBeDefined()
		expect(defaultOption?.textContent?.trim()).toBe('Select...')
	})

	describe('menu', () => {
		it('should open when clicked', async () => {
			fixture.component.dispatchEvent(new MouseEvent('click', { bubbles: true }))

			await fixture.updateComplete

			expect(fixture.component.open).toBe(true)
		})

		it('should not open when disabled', async () => {
			fixture.component.disabled = true
			await fixture.updateComplete

			fixture.component.dispatchEvent(new MouseEvent('click', { bubbles: true }))
			await fixture.updateComplete

			expect(fixture.component.open).toBe(false)
		})
	})

	describe('change event dispatching', () => {
		it('should dispatch change events and select the option on user interaction', async () => {
			const { changeSpy, dataChangeSpy, indexChangeSpy } = spyOnChangeEvents()

			await new Promise(r => setTimeout(r, 0))
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

		it('should update input text value event when changes in options lead to different value', async () => {
			const { changeSpy, dataChangeSpy, indexChangeSpy } = spyOnChangeEvents()
			const waitUpdateAndOneTick = () => Promise.all([fixture.component.updateComplete, new Promise(r => setTimeout(r, 1))])

			fixture.component.value = 4
			await waitUpdateAndOneTick()
			expect(fixture.component.valueInputElement.value).toBe('')

			fixture.component.options[1]!.value = '4'
			await waitUpdateAndOneTick()
			expect(fixture.component.valueInputElement.value).toBe('John')

			fixture.component.options[1]!.value = '5'
			await waitUpdateAndOneTick()
			expect(fixture.component.valueInputElement.value).toBe('')

			expect(changeSpy).not.toHaveBeenCalled()
			expect(indexChangeSpy).not.toHaveBeenCalled()
			expect(dataChangeSpy).not.toHaveBeenCalled()
		})
	})

	describe('single selection', () => {
		async function expectSelected(index: number) {
			await fixture.updateComplete
			await new Promise(r => setTimeout(r, 0))

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
			await new Promise(r => setTimeout(r, 0))

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
	})
})