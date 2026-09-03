import { html } from '@a11d/lit'
import { ComponentTestFixture } from '@a11d/lit-testing'
import type { Checkbox } from '@3mo/checkbox'
import type { Flex } from '@3mo/flex'
import { type CheckboxGroup } from './CheckboxGroup.js'
import './index.js'

const tick = () => new Promise(resolve => setTimeout(resolve, 10))

const selectCheckbox = (checkbox: Checkbox, selected: CheckboxSelection) => {
	checkbox.selected = selected
	checkbox.change.dispatch(selected)
}

const selectGroupViaCheckbox = (group: CheckboxGroup, selected: CheckboxSelection) => {
	const checkbox = group.renderRoot.querySelector('md-checkbox')!
	checkbox.checked = selected === true
	checkbox.indeterminate = selected === 'indeterminate'
	checkbox.dispatchEvent(new Event('change'))
}

describe('CheckboxGroup', () => {
	const fixture = new ComponentTestFixture<CheckboxGroup>(html`
		<mo-checkbox-group label='0'>
			<mo-checkbox label='1' selected></mo-checkbox>
			<mo-checkbox label='2'></mo-checkbox>
			<mo-checkbox label='3'></mo-checkbox>
		</mo-checkbox-group>
	`)

	const getCheckbox = (label: string) => fixture.component.querySelector<Checkbox>(`[label="${label}"]`)!

	const selectionStates = () => ['1', '2', '3'].map(label => getCheckbox(label).selected)

	it('tunnels the direction attribute to the flex', async () => {
		const flex = fixture.component.renderRoot.querySelector<Flex>('mo-flex > mo-flex')!
		expect(flex!.direction).toBe('vertical')

		fixture.component.direction = 'horizontal'
		await fixture.updateComplete
		expect(flex!.direction).toBe('horizontal')
	})

	describe('aggregation from children', () => {
		it('should initialize with the correct selection state', () => {
			expect(fixture.component.selected).toBe('indeterminate')
		})

		it('should update the selection state when a child checkbox changes', () => {
			const spy = spyOn(fixture.component.change, 'dispatch')

			selectCheckbox(getCheckbox('1'), false)
			expect(fixture.component.selected).toBe(false)
			expect(fixture.component.change.dispatch).toHaveBeenCalledWith(false)
			spy.calls.reset()

			selectCheckbox(getCheckbox('1'), true)
			selectCheckbox(getCheckbox('2'), true)
			expect(fixture.component.selected).toBe('indeterminate')
			expect(fixture.component.change.dispatch).toHaveBeenCalledWith('indeterminate')
			spy.calls.reset()

			selectCheckbox(getCheckbox('3'), true)
			expect(fixture.component.selected).toBe(true)
			expect(fixture.component.change.dispatch).toHaveBeenCalledWith(true)
		})

		it('should not dispatch change when a child change leaves the aggregate state unchanged', () => {
			const spy = spyOn(fixture.component.change, 'dispatch')

			selectCheckbox(getCheckbox('2'), true)

			expect(fixture.component.selected).toBe('indeterminate')
			expect(spy).not.toHaveBeenCalled()
		})
	})

	describe('propagation to children', () => {
		it('should select all children when the parent is checked', () => {
			selectGroupViaCheckbox(fixture.component, true)

			expect(selectionStates()).toEqual([true, true, true])
			expect(fixture.component.selected).toBe(true)
		})

		it('should deselect all children when the parent is unchecked', () => {
			selectGroupViaCheckbox(fixture.component, false)

			expect(selectionStates()).toEqual([false, false, false])
			expect(fixture.component.selected).toBe(false)
		})

		it('should dispatch change only on children whose state actually changed', () => {
			const selectedChildDispatch = spyOn(getCheckbox('1').change, 'dispatch')
			const unselectedChildDispatch = spyOn(getCheckbox('2').change, 'dispatch')
			const otherUnselectedChildDispatch = spyOn(getCheckbox('3').change, 'dispatch')

			selectGroupViaCheckbox(fixture.component, false)

			expect(selectedChildDispatch).toHaveBeenCalledOnceWith(false)
			expect(unselectedChildDispatch).not.toHaveBeenCalled()
			expect(otherUnselectedChildDispatch).not.toHaveBeenCalled()
		})

		it('should leave children untouched when set to indeterminate programmatically', () => {
			selectGroupViaCheckbox(fixture.component, true)
			expect(selectionStates()).toEqual([true, true, true])

			fixture.component.selected = 'indeterminate'
			fixture.component.change.dispatch('indeterminate')

			expect(selectionStates()).toEqual([true, true, true])
		})
	})

	describe('nested groups', () => {
		const nestedFixture = new ComponentTestFixture<CheckboxGroup>(html`
			<mo-checkbox-group label='root'>
				<mo-checkbox label='leaf'></mo-checkbox>
				<mo-checkbox-group label='nested'>
					<mo-checkbox label='nested-1'></mo-checkbox>
					<mo-checkbox label='nested-2'></mo-checkbox>
				</mo-checkbox-group>
			</mo-checkbox-group>
		`)

		beforeEach(() => tick())

		const getNestedGroup = () => nestedFixture.component.querySelector<CheckboxGroup>('[label="nested"]')!
		const getNestedCheckbox = (label: string) => getNestedGroup().querySelector<Checkbox>(`[label="${label}"]`)!
		const getLeaf = () => nestedFixture.component.querySelector<Checkbox>('[label="leaf"]')!

		it('should aggregate a nested group\'s state into the grandparent', () => {
			expect(nestedFixture.component.selected).toBe(false)

			selectCheckbox(getNestedCheckbox('nested-1'), true)

			expect(getNestedGroup().selected).toBe('indeterminate')
			expect(nestedFixture.component.selected).toBe('indeterminate')
		})

		it('should propagate a parent toggle through nested groups down to leaf checkboxes', () => {
			selectGroupViaCheckbox(nestedFixture.component, true)

			expect(getLeaf().selected).toBe(true)
			expect(getNestedGroup().selected).toBe(true)
			expect([getNestedCheckbox('nested-1').selected, getNestedCheckbox('nested-2').selected]).toEqual([true, true])
		})
	})

	describe('dynamic children', () => {
		const appendCheckbox = async (label: string, selected: CheckboxSelection = false) => {
			const checkbox = document.createElement('mo-checkbox')
			checkbox.label = label
			checkbox.selected = selected
			fixture.component.append(checkbox)
			await tick()
			return checkbox
		}

		it('should re-aggregate when a checkbox is added later', async () => {
			selectCheckbox(getCheckbox('2'), true)
			selectCheckbox(getCheckbox('3'), true)
			expect(fixture.component.selected).toBe(true)

			await appendCheckbox('4')

			expect(fixture.component.selected).toBe('indeterminate')
		})

		it('should react to changes of a later-added checkbox', async () => {
			selectCheckbox(getCheckbox('1'), false)
			expect(fixture.component.selected).toBe(false)

			const added = await appendCheckbox('4')
			selectCheckbox(added, true)

			expect(fixture.component.selected).toBe('indeterminate')
		})

		it('should re-aggregate over the remaining children when a checkbox is removed', async () => {
			expect(fixture.component.selected).toBe('indeterminate')

			getCheckbox('1').remove()
			await tick()

			expect(fixture.component.selected).toBe(false)
		})
	})
})