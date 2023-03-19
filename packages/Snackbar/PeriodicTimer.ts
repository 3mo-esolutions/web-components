export class PeriodicTimer {
	private static readonly missThreshold = 50

	private startTime?: number
	private timerId?: number
	private remainingTimeBeforePaused?: number
	private readonly resolves = new Set<() => void>()

	constructor(readonly interval: number) { }

	get remainingTimeToNextTick() {
		if (!this.startTime) {
			return this.remainingTimeBeforePaused ?? 0
		}
		const elapsed = Date.now() - this.startTime
		return Math.max(this.interval - (elapsed % this.interval), 0)
	}

	waitForNextTick() {
		if (!this.timerId) {
			this.run()
		}

		return new Promise<void>(resolve => this.resolves.add(resolve))
	}

	run() {
		if (this.timerId) {
			return // Timer is already running, do nothing.
		}

		if (this.remainingTimeBeforePaused) {
			this.startTime = Date.now() - (this.interval - this.remainingTimeBeforePaused)
			this.remainingTimeBeforePaused = undefined
			window.setTimeout(() => this.tickIfApplies(), this.remainingTimeToNextTick)
		} else {
			this.startTime = Date.now()
		}

		this.timerId = window.setInterval(() => this.tickIfApplies(), this.interval)
	}

	private tickIfApplies() {
		const delta = Math.abs(this.remainingTimeToNextTick - this.interval)
		const shallTick = delta <= PeriodicTimer.missThreshold
		if (shallTick) {
			this.resolves.forEach(resolve => resolve())
			this.resolves.clear()
		}
	}

	pause() {
		if (!this.timerId) {
			return // Timer is not running, do nothing.
		}

		clearInterval(this.timerId)
		this.timerId = undefined
		this.remainingTimeBeforePaused = this.remainingTimeToNextTick
		this.startTime = undefined
	}

	dispose() {
		this.pause()
		this.resolves.clear()
	}
}