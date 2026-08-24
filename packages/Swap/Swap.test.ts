import { ComponentTestFixture } from '@a11d/lit-testing'
import { html } from '@a11d/lit'
import { type Swap } from './Swap.js'
import './index.js'

describe('Swap', () => {
	const fixture = new ComponentTestFixture<Swap>(html`
		<mo-swap>
			<span>Copy</span>
			<span slot='success'>Copied to clipboard</span>
			<span slot='error'>Error</span>
		</mo-swap>
	`)

	const getSlot = (value: string) => fixture.component.renderRoot.querySelector<HTMLElement>(`[data-value='${value}']`)

	const getActiveSlots = () => [...fixture.component.renderRoot.querySelectorAll<HTMLElement>('[data-value][data-active]')]

	it('should derive its values from the "slot" of each child', () => {
		expect(fixture.component.values).toEqual(['', 'success', 'error'])
	})

	it('should show the default slot as long as the value is empty', () => {
		expect(fixture.component.value).toBe('')
		expect(getActiveSlots()).toEqual([getSlot('')!])
	})

	it('should show only the slot the value names', async () => {
		fixture.component.value = 'success'

		await fixture.updateComplete

		expect(getActiveSlots()).toEqual([getSlot('success')!])
	})

	it('should keep the slots which are not shown out of the accessibility tree', () => {
		expect(getComputedStyle(getSlot('')!).visibility).toBe('visible')
		expect(getComputedStyle(getSlot('success')!).visibility).toBe('hidden')
		expect(getComputedStyle(getSlot('error')!).visibility).toBe('hidden')
	})

	it('should reveal the slot it switches to without awaiting the transition', async () => {
		fixture.component.value = 'success'

		await fixture.updateComplete

		expect(getComputedStyle(getSlot('success')!).visibility).toBe('visible')
	})

	/**
	 * Hiding the slot which is on its way out is deferred until it has faded, which the delay of its
	 * "visibility" transition takes care of. Whether it is still visible midway cannot be sampled reliably,
	 * but a delay which never resolves would leave it visible for good and is worth guarding against.
	 */
	it('should hide the slot it switches away from once it has faded out', async () => {
		fixture.component.style.setProperty('--mo-swap-transition-duration', '30ms')

		fixture.component.value = 'success'
		await fixture.updateComplete
		await new Promise(resolve => setTimeout(resolve, 120))

		expect(getComputedStyle(getSlot('')!).visibility).toBe('hidden')
		expect(getComputedStyle(getSlot('success')!).visibility).toBe('visible')
	})

	it('should keep its size across values, as all slots share one cell', async () => {
		const { width, height } = fixture.component.getBoundingClientRect()

		fixture.component.value = 'success'
		await fixture.updateComplete

		expect(fixture.component.getBoundingClientRect().width).toBe(width)
		expect(fixture.component.getBoundingClientRect().height).toBe(height)
		// The widest slot and not the default one dictates the size.
		expect(width).toBeGreaterThan(getSlot('')!.getBoundingClientRect().width)
	})

	it('should render a slot for the value which is set even before it has content', async () => {
		fixture.component.value = 'pending'

		await fixture.updateComplete

		expect(fixture.component.renderRoot.querySelector('slot[name=pending]')).not.toBeNull()
	})

	it('should adopt values of children which are added later', async () => {
		const child = document.createElement('span')
		child.slot = 'pending'
		fixture.component.appendChild(child)

		await new Promise(resolve => setTimeout(resolve))
		await fixture.updateComplete

		expect(fixture.component.values).toEqual(['', 'success', 'error', 'pending'])
		expect(getSlot('pending')).not.toBeNull()
	})

	it('should not dispatch "change" for the value it starts with', async () => {
		const handler = jasmine.createSpy('change')
		const swap = document.createElement('mo-swap')
		swap.addEventListener('change', handler)

		document.body.appendChild(swap)
		await swap.updateComplete
		swap.remove()

		expect(handler).not.toHaveBeenCalled()
	})

	it('should dispatch "change" with the value it switches to', async () => {
		const handler = jasmine.createSpy('change')
		fixture.component.addEventListener('change', handler)

		fixture.component.value = 'success'
		await fixture.updateComplete

		expect(handler).toHaveBeenCalledTimes(1)
		expect(handler.calls.mostRecent().args[0].detail).toBe('success')
	})

	describe('flash', () => {
		it('should show a value and revert to the preceding one', async () => {
			const flash = fixture.component.flash('success', 25)

			expect(fixture.component.value).toBe('success')
			await flash

			expect(fixture.component.value).toBe('')
		})

		it('should revert to the value preceding the first of several consecutive flashes', async () => {
			const first = fixture.component.flash('success', 100)
			await new Promise(resolve => setTimeout(resolve, 30))

			const second = fixture.component.flash('error', 100)
			expect(fixture.component.value).toBe('error')

			await first
			// The flash which has been superseded must not pull the value back while the later one is still shown.
			expect(fixture.component.value).toBe('error')

			await second
			expect(fixture.component.value).toBe('')
		})

		it('should not revert a value which has been set while it was pending', async () => {
			const flash = fixture.component.flash('success', 25)

			fixture.component.value = 'error'
			await fixture.updateComplete
			await flash

			expect(fixture.component.value).toBe('error')
		})
	})
})