import { ComponentTestFixture } from '@a11d/lit/dist/test/index.js'
import { expectFieldPropertyTunnelsToInput, expectInputEventTunnelsToField } from '@3mo/field'
import { FieldPercent } from './FieldPercent.js'

describe('FieldPercent', () => {
	const fixture = new ComponentTestFixture<FieldPercent>('mo-field-percent')
	it('should set the part attribute', () => expect(fixture.component.inputElement.getAttribute('part')).toBe('input'))
	it('should tunnel disabled', () => expectFieldPropertyTunnelsToInput(fixture, { value: true, key: 'disabled' }))
	it('should tunnel readonly', () => expectFieldPropertyTunnelsToInput(fixture, { value: true, fieldKey: 'readonly', inputKey: 'readOnly' }))
	it('should tunnel required', () => expectFieldPropertyTunnelsToInput(fixture, { value: true, key: 'required' }))
	it('should tunnel value', () => expectFieldPropertyTunnelsToInput(fixture, { fieldValue: 4.999, inputValue: '5', key: 'value' }))
	it('should proxy input event', () => expectInputEventTunnelsToField(fixture, 'input', '4', 4))
	it('should proxy change event', async () => {
		expectInputEventTunnelsToField(fixture, 'change', '4.467', 4.467)
		await fixture.updateComplete
		expect(fixture.component.inputElement.value).toBe('4.47')
	})
})