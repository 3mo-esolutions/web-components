import { ComponentTestFixture } from '../../test/index.js'
import { IconButton } from './IconButton.js'

describe(IconButton.name, () => {
	const fixture = new ComponentTestFixture(() => document.createElement('mo-icon-button'))

	const getMwcIconButton = () => fixture.component.renderRoot.querySelector('mwc-icon-button')

	const getButton = () => getMwcIconButton()?.renderRoot.querySelector('button') as HTMLButtonElement

	it('should have a default font-size of 20px', () => {
		expect(getComputedStyle(fixture.component).fontSize).toBe('20px')
	})

	it('should have a default display of inline-block', () => {
		expect(getComputedStyle(fixture.component).display).toBe('inline-block')
	})

	it('should export css part "button"', () => {
		expect(getMwcIconButton()?.getAttribute('exportparts')).toContain('button')
		expect(getButton()?.getAttribute('part')).toContain('button')
	})

	it('should reflect "disabled" onto the mwc-icon-button element', async () => {
		fixture.component.disabled = true
		await fixture.update()
		expect(getMwcIconButton()?.disabled).toBe(true)
	})

	it('should have an "icon" slot containing a default mo-icon element', () => {
		expect(fixture.component.renderRoot.querySelector('slot[name="icon"]')).toBeTruthy()
		expect(fixture.component.renderRoot.querySelector('slot[name="icon"] > mo-icon')).toBeTruthy()
	})

	it('should reflect "icon" onto the the mo-icon element', async () => {
		fixture.component.icon = 'home'
		await fixture.update()
		expect(fixture.component.renderRoot.querySelector('mo-icon')?.icon).toBe('home')
	})
})