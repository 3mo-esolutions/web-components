import { html } from '@a11d/lit'
import { ComponentTestFixture } from '@a11d/lit-testing'
import { type Scroller } from './Scroller.js'
import './index.js'

const settle = (milliseconds = 100) => new Promise(resolve => setTimeout(resolve, milliseconds))

describe('Scroller', () => {
	const fixture = new ComponentTestFixture<Scroller>(html`
		<mo-scroller style='height: 100px; width: 100px'>
			<div style='height: 1000px; width: 1000px'>Content</div>
		</mo-scroller>
	`)

	it('should scroll content which overflows its bounds', () => {
		expect(fixture.component.scrollHeight).toBeGreaterThan(fixture.component.clientHeight)

		fixture.component.scrollTop = 250

		expect(fixture.component.scrollTop).toBe(250)
	})

	it('should shrink inside a constrained flex parent instead of overflowing it', async () => {
		const parent = document.createElement('div')
		parent.style.cssText = 'display: flex; flex-direction: column; height: 120px; width: 120px'
		const scroller = document.createElement('mo-scroller')
		scroller.innerHTML = '<div style="height: 1000px; width: 1000px">Content</div>'
		parent.appendChild(scroller)
		document.body.appendChild(parent)

		try {
			await scroller.updateComplete
			await settle()

			expect(scroller.getBoundingClientRect().height).toBeCloseTo(120, -1)
			expect(scroller.scrollHeight).toBeGreaterThan(scroller.clientHeight)
		} finally {
			parent.remove()
		}
	})

	it('should re-dispatch its scroll events on window', async () => {
		const handler = jasmine.createSpy('scroll')
		window.addEventListener('scroll', handler)

		try {
			fixture.component.scrollTop = 100
			await settle(200)

			expect(fixture.component.scrollTop).toBe(100)
			expect(handler).toHaveBeenCalled()
		} finally {
			window.removeEventListener('scroll', handler)
		}
	})

	describe('Property "snapType"', () => {
		it('should get from CSS property "scroll-snap-type"', () => {
			fixture.component.style.scrollSnapType = 'x mandatory'

			expect(fixture.component.snapType).toBe('x mandatory')
		})

		it('should set CSS property "scroll-snap-type"', () => {
			fixture.component.snapType = 'y mandatory'

			expect(fixture.component.style.scrollSnapType).toBe('y mandatory')
			expect(getComputedStyle(fixture.component).getPropertyValue('scroll-snap-type')).toBe('y mandatory')
		})
	})

	describe('scrollbar styling', () => {
		it('should tint the scrollbar via "--mo-scroller-thumb-color" and "--mo-scroller-track-color"', () => {
			fixture.component.style.setProperty('--mo-scroller-thumb-color', 'rgb(1, 2, 3)')
			fixture.component.style.setProperty('--mo-scroller-track-color', 'rgb(4, 5, 6)')

			expect(getComputedStyle(fixture.component).getPropertyValue('scrollbar-color')).toBe('rgb(1, 2, 3) rgb(4, 5, 6)')
		})
	})
})