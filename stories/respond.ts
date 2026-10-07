/** Stands in for a server: resolves with the result after a moment, like a request would. */
export function respond<T>(result: T, milliseconds = 750) {
	return new Promise<T>(resolve => setTimeout(() => resolve(result), milliseconds))
}
