/** Runs at most `concurrency` of the tasks handed to the returned function at once, queueing the rest. */
export function limit(concurrency: number) {
	let active = 0
	const waiting = new Array<() => void>()
	return async <T>(task: () => Promise<T>) => {
		while (active >= concurrency) {
			await new Promise<void>(resolve => waiting.push(resolve))
		}
		active++
		try {
			return await task()
		} finally {
			active--
			waiting.shift()?.()
		}
	}
}
