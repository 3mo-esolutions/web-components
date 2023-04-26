import { ComponentTestFixture } from '@a11d/lit/dist/test/index.js'

type KeyProperty = { key: string, fieldKey?: undefined, inputKey?: undefined } | { key?: undefined, fieldKey: string, inputKey: string }
type ValueProperty = { value: any, inputValue?: undefined, fieldValue?: undefined } | { value?: undefined, inputValue: string, fieldValue: any }

export const expectFieldPropertyTunnelsToInput = async (fixture: ComponentTestFixture<any>, parameters: KeyProperty & ValueProperty) => {
	const { key, fieldKey, inputKey, value, fieldValue, inputValue } = parameters
	expect(fixture.component.inputElement[inputKey ?? key as string]).toBeFalsy()

	fixture.component[fieldKey ?? key as string] = fieldValue ?? value
	await fixture.updateComplete

	expect(fixture.component.inputElement[inputKey ?? key as string]).toBe(inputValue ?? value)
}

export const expectInputEventTunnelsToField = (fixture: ComponentTestFixture<any>, event: string, inputValue: any, value = inputValue) => {
	const dispatch = jasmine.createSpy('dispatch')
	fixture.component.addEventListener(event, (e: CustomEvent<any>) => dispatch(e.detail))

	fixture.component.inputElement.value = inputValue
	fixture.component.inputElement.dispatchEvent(new Event(event))

	expect(dispatch).toHaveBeenCalledOnceWith(value)
}