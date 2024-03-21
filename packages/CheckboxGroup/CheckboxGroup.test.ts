import { html } from '@a11d/lit'
import { ComponentTestFixture } from '@a11d/lit-testing'
import type { Checkbox } from '@3mo/checkbox'
import type { Flex } from '@3mo/flex'
import type { CheckboxGroup } from '.'
import '.'

describe('CheckboxGroup', () => {
	const fixture = new ComponentTestFixture<CheckboxGroup>(html`
		<mo-checkbox-group label='0'>
			<mo-checkbox label='1' selected></mo-checkbox>
			<mo-checkbox label='2'></mo-checkbox>
			<mo-checkbox label='3'></mo-checkbox>
		</mo-checkbox-group>
	`)

	const getCheckbox = (label: string) => fixture.component.querySelector<Checkbox>(`[label="${label}"]`)!

	const selectCheckbox = (label: string, selected: CheckboxSelection) => {
		const checkbox = getCheckbox(label)
		checkbox.selected = selected
		checkbox.change.dispatch(selected)
	}

	it('tunnels the direction attribute to the flex', async () => {
		const flex = fixture.component.renderRoot.querySelector<Flex>('mo-flex > mo-flex')!
		expect(flex!.direction).toBe('vertical')

		fixture.component.direction = 'horizontal'
		await fixture.updateComplete
		expect(flex!.direction).toBe('horizontal')
	})

	it('should initialize with the correct selection state', () => {
		expect(fixture.component.selected).toBe('indeterminate')
	})

	it('should update the selection state when a child checkbox changes', () => {
		const spy = spyOn(fixture.component.change, 'dispatch')

		selectCheckbox('1', false)
		expect(fixture.component.selected).toBe(false)
		expect(fixture.component.change.dispatch).toHaveBeenCalledWith(false)
		spy.calls.reset()

		selectCheckbox('1', true)
		selectCheckbox('2', true)
		expect(fixture.component.selected).toBe('indeterminate')
		expect(fixture.component.change.dispatch).toHaveBeenCalledWith('indeterminate')
		spy.calls.reset()

		selectCheckbox('3', true)
		expect(fixture.component.selected).toBe(true)
		expect(fixture.component.change.dispatch).toHaveBeenCalledWith(true)
	})
})