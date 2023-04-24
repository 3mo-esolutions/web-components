import { ComponentTestFixture } from '@a11d/lit/dist/test/index.js'

export const expectFieldPropertyTunnelsToInput = async (fixture: ComponentTestFixture<any>, value: any, fieldKey: string, inputKey: string = fieldKey as any) => {
	expect(fixture.component.inputElement[inputKey]).toBeFalsy()

	fixture.component[fieldKey] = value
	await fixture.updateComplete

	expect(fixture.component.inputElement[inputKey]).toBe(value as any)
}

export const expectInputEventTunnelsToField = (fixture: ComponentTestFixture<any>, event: string, inputValue: any, value = inputValue) => {
	const dispatch = jasmine.createSpy('dispatch')
	fixture.component.addEventListener(event, (e: CustomEvent<any>) => dispatch(e.detail))

	fixture.component.inputElement.value = inputValue
	fixture.component.inputElement.dispatchEvent(new Event(event))

	expect(dispatch).toHaveBeenCalledOnceWith(value)
}