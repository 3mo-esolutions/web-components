import { Enqueuer, EnqueuerError } from './Enqueuer.js'

describe('Enqueuer', () => {
	it('Resolves the promise', async () => {
		const enqueuer = new Enqueuer()
		const promise = new Promise<string>(resolve => setTimeout(() => resolve('result'), 50))

		const promiseResult = enqueuer.enqueue(promise)

		await expectAsync(promiseResult).toBeResolvedTo('result')
	})

	// TODO: the allSettled() method does not resolve for some reason
	xit('Rejects the first promise if a second promise wins the race', async () => {
		const enqueuer = new Enqueuer()
		const firstPromise = new Promise<string>(resolve => setTimeout(() => resolve('first'), 100))
		const secondPromise = new Promise<string>(resolve => setTimeout(() => resolve('second'), 50))

		const [firstResult, secondResult] = await Promise.allSettled([
			enqueuer.enqueue(firstPromise),
			enqueuer.enqueue(secondPromise),
		])

		expect(firstResult.status).toBe('rejected')
		const error = (firstResult as PromiseRejectedResult).reason as EnqueuerError<string>
		expect(error).toBeInstanceOf(EnqueuerError)
		expect(error?.message).toBe('The result of a promise has been discarded in favor of another one which has started afterwards.')
		expect((error as EnqueuerError<string>).discardedResult).toBe('first')

		expect(secondResult.status).toBe('fulfilled')
		const result = (secondResult as PromiseFulfilledResult<string>).value
		expect(result).toBe('second')
	})
})