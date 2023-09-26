import { Throttler } from './Throttler.js'

describe('Throttler', () => {
	it('should skip throttling the leading call', async () => {
		const throttler = new Throttler(100)
		const start = Date.now()

		await throttler.throttle()

		expect(Date.now() - start).toBe(0)
	})

	it('should throttle calls', async () => {
		const throttler = new Throttler(100)
		const start = Date.now()

		await throttler.throttle()
		await throttler.throttle()
		await throttler.throttle()

		const timeSpan = Date.now() - start
		expect(timeSpan).toBeGreaterThanOrEqual(99)
		expect(timeSpan).toBeLessThanOrEqual(150)
	})

	it('should throttle multiple times', async () => {
		const throttler = new Throttler(100)
		const start = Date.now()

		await throttler.throttle()
		await new Promise(resolve => setTimeout(resolve, 200))
		await throttler.throttle()
		await new Promise(resolve => setTimeout(resolve, 200))
		await throttler.throttle()

		const timeSpan = Date.now() - start
		const expectedMilliseconds = 100 + 2 * 200
		expect(timeSpan).toBeGreaterThanOrEqual(expectedMilliseconds)
		expect(timeSpan).toBeLessThanOrEqual(expectedMilliseconds + 50)
	})
})