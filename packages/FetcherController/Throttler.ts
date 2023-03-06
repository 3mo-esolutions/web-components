export class Throttler {
	private timerId?: number
	private count = 0

	constructor(readonly delayInMilliseconds: number) { }

	throttle() {
		return new Promise<void>(resolve => {
			const firstInBatch = this.count === 0

			window.clearTimeout(this.timerId)
			this.timerId = window.setTimeout(() => {
				if (!firstInBatch) {
					resolve()
					this.count = 0
				}
				this.timerId = undefined
			}, this.delayInMilliseconds)

			if (firstInBatch) {
				resolve()
			}

			this.count++
		})
	}
}