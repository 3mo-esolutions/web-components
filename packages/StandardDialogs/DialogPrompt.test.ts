import { ComponentTestFixture } from '@a11d/lit/dist/test/ComponentTestFixture.js'
import { Dialog, DialogSize } from '@3mo/dialog'
import { DialogPrompt } from './DialogPrompt.js'

describe('DialogPrompt', () => {
	const fixture = new ComponentTestFixture(() => new DialogPrompt(parameters))

	const parameters: DialogPrompt['parameters'] = {
		heading: 'Heading',
		content: 'Content',
		primaryButtonText: 'Primary Button',
		blocking: true,
		size: DialogSize.Large,
		value: 'Initial value',
	} as const

	it('should set "primaryOnEnter" dialog property to true', () => {
		expect(fixture.component.dialogElement.primaryOnEnter).toBe(true)
	})

	it('should not have secondary button', () => {
		expect(fixture.component.secondaryActionElement).toBeUndefined()
	})

	it('should have used parameters to customize dialog', () => {
		expect(fixture.component.dialogElement.heading).toBe(parameters.heading)
		expect(fixture.component.dialogElement.textContent?.trim()).toBe(parameters.content as string)
		expect((fixture.component.dialogElement as Dialog).primaryButtonText).toBe(parameters.primaryButtonText)
		expect((fixture.component.dialogElement as Dialog).blocking).toBe(parameters.blocking!)
		expect((fixture.component.dialogElement as Dialog).size).toBe(parameters.size!)
	})

	const parametersVariations: Array<DialogPrompt['parameters']> = [
		{
			...parameters,
			inputLabel: undefined,
			isTextArea: false
		},
		{
			...parameters,
			inputLabel: 'Input Label',
			isTextArea: false,
		},
		{
			...parameters,
			inputLabel: undefined,
			isTextArea: true
		},
		{
			...parameters,
			inputLabel: 'Input Label',
			isTextArea: true
		},
	]

	for (const parameters of parametersVariations) {
		describe(`when ["isTextArea" is "${parameters.isTextArea}"] and ["inputLabel" is "${parameters.inputLabel}"]`, () => {
			const fixture = new ComponentTestFixture(() => new DialogPrompt(parameters))

			it('should set the label of the input element', () => {
				expect(fixture.component.inputElement.label).toBe(parameters.inputLabel ?? 'Input')
			})

			it('should set the initial value of the input element', () => {
				expect(fixture.component.inputElement.value).toBe(parameters.value)
			})

			it('should return the value of the input element when the primary button is clicked', () => {
				expect(fixture.component.inputElement.value).toBe(parameters.value)
			})
		})
	}
})