import { ComponentTestFixture } from '@a11d/lit/dist/test/index.js'

describe('PopoverHost', () => {
	const fixture = new ComponentTestFixture('mo-popover-host')

	it('should reject inert attempt via attribute', async () => {
		fixture.component.setAttribute('inert', '')

		await fixture.updateComplete

		expect(fixture.component.hasAttribute('inert')).toBe(false)
		expect(fixture.component.inert).toBe(false)
	})

	it('should reject inert attempt via property', async () => {
		fixture.component.inert = true

		await fixture.updateComplete

		expect(fixture.component.hasAttribute('inert')).toBe(false)
		expect(fixture.component.inert).toBe(false)
	})
})