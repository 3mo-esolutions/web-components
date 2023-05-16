import { ComponentTestFixture } from '@a11d/lit/dist/test'
import { FieldSelect } from './index.js'
import { html } from '@a11d/lit'

type Person = { id: number, name: string, birthDate: DateTime }

const people = [
	{ id: 1, name: 'John', birthDate: new DateTime(2000, 0, 0) },
	{ id: 2, name: 'Jane', birthDate: new DateTime(2000, 0, 0) },
	{ id: 3, name: 'Joe', birthDate: new DateTime(2000, 0, 0) },
]

describe('FieldSelect', () => {
	const fixture = new ComponentTestFixture<FieldSelect<Person>>(html`
		<mo-field-select label='Select'>
			${people.map(p => html`<mo-option value=${p.id} .data=${p}>${p.name}</mo-option>`)}
		</mo-field-select>
	`)

	it('should open menu when clicked', async () => {
		fixture.component.dispatchEvent(new MouseEvent('click', { bubbles: true }))

		await fixture.updateComplete

		expect(fixture.component.open).toBe(true)
	})

	it('should not open menu when disabled', async () => {
		fixture.component.disabled = true
		await fixture.updateComplete

		fixture.component.dispatchEvent(new MouseEvent('click', { bubbles: true }))
		await fixture.updateComplete

		expect(fixture.component.open).toBe(false)
	})

	describe('single selection', () => {
		async function expectSelected(index: number) {
			await fixture.updateComplete
			await new Promise(r => setTimeout(r, 0))

			expect(fixture.component.index).toBe(index)
			expect(fixture.component.value).toBe(people[index]!.id)
			expect(fixture.component.data).toBe(people[index]!)
			expect(fixture.component.inputElement.value).toBe(people[index]!.name)
		}

		it('should select the option by value', async () => {
			fixture.component.value = 2
			await expectSelected(1)
		})

		it('should select the option by index', async () => {
			fixture.component.index = 1
			await expectSelected(1)
		})

		it('should select the option by data', async () => {
			fixture.component.data = people[1]!
			await expectSelected(1)
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
			expect(fixture.component.inputElement.value).toBe(index.map(i => people[i]!.name).join(', '))
		}

		it('should select the option by value', async () => {
			fixture.component.value = [1, 3]
			await expectSelected([0, 2])
		})

		it('should select the option by index', async () => {
			fixture.component.index = [0, 2]
			await expectSelected([0, 2])
		})

		it('should select the option by data', async () => {
			fixture.component.data = [people[0]!, people[2]!]
			await expectSelected([0, 2])
		})
	})
})