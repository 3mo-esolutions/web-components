import { Enqueuer, EnqueuerError } from './Enqueuer.js'

describe('Enqueuer', () => {
	it('Resolves the promise', async () => {
		const enqueuer = new Enqueuer()
		const promise = new Promise<string>(resolve => setTimeout(() => resolve('result'), 50))

		const promiseResult = enqueuer.enqueue(promise)

		await expectAsync(promiseResult).toBeResolvedTo('result')
	})

	it('should reject a superseded enqueue with an EnqueuerError carrying the discarded result', async () => {
		const enqueuer = new Enqueuer()
		const firstPromise = new Promise<string>(resolve => setTimeout(() => resolve('first'), 100))
		const firstResultPromise = enqueuer.enqueue(firstPromise)

		await new Promise(resolve => setTimeout(resolve, 10))

		const secondPromise = new Promise<string>(resolve => setTimeout(() => resolve('second'), 50))
		const secondResultPromise = enqueuer.enqueue(secondPromise)

		const [firstResult, secondResult] = await Promise.allSettled([
			firstResultPromise,
			secondResultPromise,
		])

		expect(firstResult.status).toBe('rejected')
		const error = (firstResult as PromiseRejectedResult).reason as EnqueuerError<string>
		expect(error).toBeInstanceOf(EnqueuerError)
		expect(error?.message).toBe('The result of a promise has been discarded in favor of another one which has started afterwards.')
		expect(error.discardedResult).toBe('first')

		expect(secondResult.status).toBe('fulfilled')
		const result = (secondResult as PromiseFulfilledResult<string>).value
		expect(result).toBe('second')
	})

	it('should silently drop an enqueue that is superseded before its timer fires, leaving its promise pending', async () => {
		const enqueuer = new Enqueuer()
		let firstSettled = false
		const firstPromise = Promise.resolve('first')
		const secondPromise = Promise.resolve('second')

		enqueuer.enqueue(firstPromise).finally(() => firstSettled = true)
		const secondResult = await enqueuer.enqueue(secondPromise)

		expect(secondResult).toBe('second')
		await new Promise(resolve => setTimeout(resolve, 20))
		expect(firstSettled).toBeFalse()
	})
})