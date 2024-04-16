import { type Dialog, DialogSize } from '@3mo/dialog'
import { ComponentTestFixture } from '@a11d/lit-testing'
import { DialogAcknowledge } from './DialogAcknowledge.js'

describe('DialogAcknowledge', () => {
	const fixture = new ComponentTestFixture(() => new DialogAcknowledge(parameters))

	const parameters: DialogAcknowledge['parameters'] = {
		heading: 'Heading',
		content: 'Content',
		primaryButtonText: 'Primary Button',
		blocking: true,
		size: DialogSize.Medium,
		secondaryButtonText: 'Secondary Button'
	}

	it('should have used parameters to customize dialog', () => {
		expect(fixture.component.dialogElement.heading).toBe(parameters.heading)
		expect(fixture.component.dialogElement.textContent?.trim()).toBe(parameters.content as string)
		expect((fixture.component.dialogElement as Dialog).primaryButtonText).toBe(parameters.primaryButtonText)
		expect((fixture.component.dialogElement as Dialog).blocking).toBe(parameters.blocking!)
		expect((fixture.component.dialogElement as Dialog).size).toBe(parameters.size!)
		expect((fixture.component.dialogElement as Dialog).secondaryButtonText).toBe(parameters.secondaryButtonText)
	})

	it('should return "true" if primary button is clicked', async () => {
		const confirmationPromise = fixture.component.confirm()
		fixture.component.primaryActionElement?.click()
		await expectAsync(confirmationPromise).toBeResolvedTo(true)
	})

	it('should return "false" if secondary button is clicked', async () => {
		const confirmationPromise = fixture.component.confirm()
		fixture.component.secondaryActionElement?.click()
		await expectAsync(confirmationPromise).toBeResolvedTo(false)
	})
})