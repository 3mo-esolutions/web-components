import { ComponentTestFixture } from '@a11d/lit/dist/test/index.js'
import { Anchor, AnchorReferrerPolicy } from './Anchor.js'

describe('Anchor', () => {
	const fixture = new ComponentTestFixture<Anchor>('mo-anchor')

	const getAnchorElement = () => fixture.component.renderRoot.querySelector('a') as HTMLAnchorElement

	for (const [key, value] of new Map<keyof Anchor, string>([
		['href', 'https://www.3mo.de/'],
		['target', '_blank'],
		['download', 'download'],
		['ping', 'ping'],
		['referrerPolicy', AnchorReferrerPolicy.Origin],
		['rel', 'rel'],
	])) {
		it(`should apply the property "${key}"`, async () => {
			// @ts-expect-error Key wont be of a readonly property
			fixture.component[key] = value
			await fixture.updateComplete
			expect((getAnchorElement() as any)[key]).toBe(value)
		})
	}

	describe('foreground color', () => {
		const blue = 'rgb(0, 0, 255)'
		const red = 'rgb(255, 0, 0)'

		it('should default to "rgb(0, 119, 200)"', () => {
			expect(getComputedStyle(getAnchorElement()).color).toBe('rgb(0, 119, 200)')
		})

		it('should apply the CSS property "--mo-color-accent"', async () => {
			fixture.component.style.setProperty('--mo-color-accent', blue)
			await fixture.updateComplete
			expect(getComputedStyle(getAnchorElement()).color).toBe(blue)
		})

		it('should apply the CSS property "--mo-anchor-color" over than "--mo-color-accent"', async () => {
			fixture.component.style.setProperty('--mo-color-accent', red)
			fixture.component.style.setProperty('--mo-anchor-color', blue)
			await fixture.updateComplete
			expect(getComputedStyle(getAnchorElement()).color).toBe(blue)
		})
	})

	describe('when no href is set', () => {
		it('should prevent link navigation and call click event handlers', () => {
			const spy = jasmine.createSpy()
			fixture.component.addEventListener('click', spy)
			fixture.component.dispatchEvent(new MouseEvent('click'))
			expect(spy).toHaveBeenCalled()
			// Also implicitly expect no error is thrown due to page reload
		})

		it('should dispatch click event when auxiliary clicked', () => {
			const spy = jasmine.createSpy()
			fixture.component.addEventListener('click', spy)
			fixture.component.dispatchEvent(new MouseEvent('auxclick'))
			expect(spy).toHaveBeenCalled()
		})
	})
})