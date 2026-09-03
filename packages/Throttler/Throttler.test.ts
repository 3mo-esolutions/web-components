import { Throttler } from './Throttler.js'

describe('Throttler', () => {
	it('should skip throttling the leading call', async () => {
		const throttler = new Throttler(100)
		const start = performance.now()

		await throttler.throttle()

		expect(performance.now() - start).toBeLessThanOrEqual(1)
	})

	it('should throttle calls', async () => {
		const throttler = new Throttler(100)
		const measure = performance.now()

		await throttler.throttle()
		await throttler.throttle()
		await throttler.throttle()

		const timeSpan = performance.now() - measure
		expect(timeSpan).toBeGreaterThanOrEqual(95)
		// Only a generous ceiling: under a loaded run the timers fire late, and how a burst collapses is
		// pinned deterministically by the mocked-clock case below rather than by wall-clock arithmetic.
		expect(timeSpan).toBeLessThanOrEqual(2000)
	})

	it('should resolve only the first and the last call of a concurrent burst, leaving intermediate calls pending', async () => {
		jasmine.clock().install()
		try {
			const throttler = new Throttler(100)
			const settled = [false, false, false]

			// The whole burst is issued within one task, as a consumer calling into a throttled function does.
			settled.forEach((_, index) => void throttler.throttle().then(() => settled[index] = true))
			await Promise.resolve()

			expect(settled).toEqual([true, false, false])

			jasmine.clock().tick(100)
			await Promise.resolve()
			await Promise.resolve()

			expect(settled).toEqual([true, false, true])

			// The intermediate call's timer has been cleared by its successor, so it never settles.
			jasmine.clock().tick(10_000)
			await Promise.resolve()
			await Promise.resolve()

			expect(settled).toEqual([true, false, true])
		} finally {
			jasmine.clock().uninstall()
		}
	})

	it('should throttle multiple times', async () => {
		const throttler = new Throttler(100)
		const start = performance.now()

		await throttler.throttle()
		await new Promise(resolve => setTimeout(resolve, 200))
		await throttler.throttle()
		await new Promise(resolve => setTimeout(resolve, 200))
		await throttler.throttle()

		const timeSpan = performance.now() - start
		const expectedMilliseconds = 100 + 2 * 200
		expect(timeSpan).toBeGreaterThanOrEqual(expectedMilliseconds - 20)
		expect(timeSpan).toBeLessThanOrEqual(expectedMilliseconds + 2000)
	})
})