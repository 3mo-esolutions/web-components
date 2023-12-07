import { Dialog, DialogSize } from '@3mo/dialog'
import { ComponentTestFixture } from '@a11d/lit-testing'
import { GenericDialog } from './GenericDialog.js'

describe('GenericDialog', () => {
	const fixture = new ComponentTestFixture(() => new GenericDialog(parameters))

	const parameters: GenericDialog<string>['parameters'] = {
		heading: 'Heading',
		content: 'Content',
		blocking: true,
		size: DialogSize.Medium,
		primaryButtonText: 'Primary Button',
		primaryAction: jasmine.createSpy('primaryAction').and.returnValue('Primary Button Clicked!'),
		secondaryButtonText: 'Secondary Button',
		secondaryAction: jasmine.createSpy('secondaryAction').and.returnValue('Secondary Button Clicked!'),
	}

	it('should set "primaryOnEnter" dialog property to true', () => {
		expect(fixture.component.dialogElement.primaryOnEnter).toBe(true)
	})

	it('should have used parameters to customize dialog', () => {
		expect(fixture.component.dialogElement.heading).toBe(parameters.heading)
		expect(fixture.component.dialogElement.textContent?.trim()).toBe(parameters.content as string)
		expect((fixture.component.dialogElement as Dialog).primaryButtonText).toBe(parameters.primaryButtonText)
		expect((fixture.component.dialogElement as Dialog).secondaryButtonText).toBe(parameters.secondaryButtonText)
		expect((fixture.component.dialogElement as Dialog).blocking).toBe(parameters.blocking!)
		expect((fixture.component.dialogElement as Dialog).size).toBe(parameters.size!)
	})

	it('should call "primaryAction" parameter and return its value when the primary button is clicked', async () => {
		const confirmationPromise = fixture.component.confirm()
		fixture.component.primaryActionElement?.click()
		expect(parameters.primaryAction).toHaveBeenCalledOnceWith()
		await expectAsync(confirmationPromise).toBeResolvedTo('Primary Button Clicked!')
	})

	it('should call "secondaryAction" parameter and return its value when the secondary button is clicked', async () => {
		const confirmationPromise = fixture.component.confirm()
		fixture.component.secondaryActionElement?.click()
		expect(parameters.secondaryAction).toHaveBeenCalledOnceWith()
		await expectAsync(confirmationPromise).toBeResolvedTo('Secondary Button Clicked!')
	})
})