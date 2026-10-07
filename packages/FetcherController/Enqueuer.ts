/** Resolves only the latest of the promises it is handed; one superseded before it settled rejects with an `EnqueuerError`. */
export class Enqueuer {
	private timerId?: number

	enqueue<T>(promise: Promise<T>) {
		return new Promise<T>((resolve, reject) => {
			window.clearTimeout(this.timerId)
			const currentTimerId = window.setTimeout(async () => {
				const result = await promise

				if (this.timerId !== currentTimerId) {
					reject(new EnqueuerError(result))
				} else {
					resolve(result)
					this.timerId = undefined
				}
			})
			this.timerId = currentTimerId
		})
	}
}

/** The rejection of a superseded promise, carrying the result that was discarded. */
export class EnqueuerError<T> extends Error {
	private static readonly message = 'The result of a promise has been discarded in favor of another one which has started afterwards.'

	constructor(readonly discardedResult: T, message = EnqueuerError.message) {
		super(message)
	}
}
