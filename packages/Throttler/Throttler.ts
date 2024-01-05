/**
 * Throttles a function call to a specified delay asynchronously.
 *
 * @ssr true
 *
 * @example
 * const throttler = new Throttler(1000)
 * [...Array(10)].forEach(i => setTimeout(execute, i * 50))
 * function execute() {
 *     await throttler.throttle()
 *     // Do something here and it will done only once per second.
 * }
 */
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