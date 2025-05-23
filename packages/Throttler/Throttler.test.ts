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
		expect(timeSpan).toBeGreaterThanOrEqual(99)
		expect(timeSpan).toBeLessThanOrEqual(150)
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
		expect(timeSpan).toBeGreaterThanOrEqual(expectedMilliseconds)
		expect(timeSpan).toBeLessThanOrEqual(expectedMilliseconds + 50)
	})
})