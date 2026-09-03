import { PeriodicTimer } from './PeriodicTimer.js'

describe('PeriodicTimer', () => {
	// The timer is driven by setInterval and Date.now, both of which the clock owns — real time would
	// make every case here a five-second wait.
	beforeEach(() => {
		jasmine.clock().install()
		jasmine.clock().mockDate()
	})

	afterEach(() => jasmine.clock().uninstall())

	/** Drains the microtask chain a resolved wait settles through, which the clock does not advance. */
	const settle = async () => {
		for (let index = 0; index < 5; index++) {
			await Promise.resolve()
		}
	}

	const waitOf = (timer: PeriodicTimer) => {
		const state = { ticked: false }
		timer.waitForNextTick().then(() => state.ticked = true)
		return state
	}

	it('should resolve waitForNextTick once the interval elapses', async () => {
		const timer = new PeriodicTimer(1000)
		const wait = waitOf(timer)

		jasmine.clock().tick(999)
		await settle()
		expect(wait.ticked).toBe(false)

		jasmine.clock().tick(1)
		await settle()
		expect(wait.ticked).toBe(true)

		timer.dispose()
	})

	it('should report the remaining time to the next tick', () => {
		const timer = new PeriodicTimer(1000)
		expect(timer.remainingTimeToNextTick).toBe(0) // nothing is running yet

		timer.run()
		expect(timer.remainingTimeToNextTick).toBe(1000)

		jasmine.clock().tick(400)
		expect(timer.remainingTimeToNextTick).toBe(600)

		timer.dispose()
	})

	it('should not tick while paused', async () => {
		const timer = new PeriodicTimer(1000)
		const wait = waitOf(timer)

		jasmine.clock().tick(400)
		timer.pause()
		jasmine.clock().tick(10_000)
		await settle()

		expect(wait.ticked).toBe(false)

		timer.dispose()
	})

	it('should resume with the remaining time preserved after a pause', async () => {
		const timer = new PeriodicTimer(1000)
		const wait = waitOf(timer)

		jasmine.clock().tick(400)
		timer.pause()
		expect(timer.remainingTimeToNextTick).toBe(600)

		jasmine.clock().tick(10_000) // held: time spent paused is not spent
		timer.run()

		jasmine.clock().tick(599)
		await settle()
		expect(wait.ticked).toBe(false)

		jasmine.clock().tick(1)
		await settle()
		expect(wait.ticked).toBe(true)

		timer.dispose()
	})

	it('should not resolve pending waits after dispose', async () => {
		const timer = new PeriodicTimer(1000)
		const wait = waitOf(timer)

		timer.dispose()
		jasmine.clock().tick(10_000)
		await settle()

		expect(wait.ticked).toBe(false)
	})
})