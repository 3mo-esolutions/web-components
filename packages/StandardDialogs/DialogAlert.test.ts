import { type Dialog, DialogSize } from '@3mo/dialog'
import { ComponentTestFixture } from '@a11d/lit-testing'
import { DialogAlert } from './DialogAlert.js'

describe('DialogAlert', () => {
	const fixture = new ComponentTestFixture(() => new DialogAlert(parameters))

	const parameters: DialogAlert['parameters'] = {
		heading: 'Heading',
		content: 'Content',
		primaryButtonText: 'Primary Button',
		blocking: true,
		size: DialogSize.Medium,
	}

	it('should have used parameters to customize dialog', () => {
		expect(fixture.component.dialogElement.heading).toBe(parameters.heading)
		expect(fixture.component.dialogElement.textContent?.trim()).toBe(parameters.content as string)
		expect((fixture.component.dialogElement as Dialog).primaryButtonText).toBe(parameters.primaryButtonText)
		expect((fixture.component.dialogElement as Dialog).blocking).toBe(parameters.blocking!)
		expect((fixture.component.dialogElement as Dialog).size).toBe(parameters.size!)
	})

	it('should not have secondary button', async () => {
		fixture.component.dialogElement.open = true
		await fixture.component.updateComplete
		expect(fixture.component.secondaryActionElement).toBeUndefined()
	})

	it('should return "true" if primary button is clicked', async () => {
		fixture.component.dialogElement.open = true
		await fixture.component.updateComplete
		const confirmationPromise = fixture.component.confirm()
		fixture.component.primaryActionElement?.click()
		await expectAsync(confirmationPromise).toBeResolved()
	})
})