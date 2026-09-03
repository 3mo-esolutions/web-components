import { type ReactiveControllerHost } from '@a11d/lit'
import { FetcherController } from './FetcherController.js'
import { EnqueuerError } from './Enqueuer.js'

describe('FetcherController', () => {
	const createHost = () => ({
		addController: jasmine.createSpy('addController'),
		removeController: jasmine.createSpy('removeController'),
		requestUpdate: jasmine.createSpy('requestUpdate'),
		updateComplete: Promise.resolve(true),
	}) as unknown as ReactiveControllerHost

	const waitUntil = async (condition: () => boolean, timeoutInMilliseconds = 3000) => {
		const start = performance.now()
		while (condition() === false) {
			if (performance.now() - start > timeoutInMilliseconds) {
				throw new Error('The condition has not been met in time.')
			}
			await new Promise(resolve => setTimeout(resolve, 5))
		}
	}

	type Call = { readonly args: ReadonlyArray<unknown>, readonly resolve: (value: string) => void }

	const createDeferredFetch = () => {
		const calls = new Array<Call>()
		const fetch = (args: ReadonlyArray<unknown>) => new Promise<string>(resolve => calls.push({ args, resolve }))
		return { calls, fetch }
	}

	const settle = async (fetcher: FetcherController<string, any>, call: Call, value: string) => {
		call.resolve(value)
		await waitUntil(() => fetcher.pending === false)
		await new Promise(resolve => setTimeout(resolve))
	}

	describe('pending', () => {
		it('should report pending from run start until the fetch settles', async () => {
			const { calls, fetch } = createDeferredFetch()
			const fetcher = new FetcherController<string>(createHost(), { fetch, autoRun: false })

			expect(fetcher.pending).toBeFalse()

			const run = fetcher.run()
			await waitUntil(() => calls.length === 1)

			expect(fetcher.pending).toBeTrue()
			expect(fetcher.value).toBeUndefined()

			calls[0]!.resolve('value')
			await run

			expect(fetcher.pending).toBeFalse()
			expect(fetcher.value).toBe('value')
		})
	})

	describe('argument equality', () => {
		it('should fetch automatically when the computed args change structurally', async () => {
			let search = 'a'
			const { calls, fetch } = createDeferredFetch()
			const fetcher = new FetcherController<string, [{ search: string }]>(createHost(), { fetch, args: () => [{ search }] })

			fetcher.hostUpdate()
			await waitUntil(() => calls.length === 1)
			await settle(fetcher, calls[0]!, 'first')

			search = 'b'
			fetcher.hostUpdate()
			await waitUntil(() => calls.length === 2)
			await settle(fetcher, calls[1]!, 'second')

			expect(calls.map(call => call.args)).toEqual([[{ search: 'a' }], [{ search: 'b' }]])
			expect(fetcher.value).toBe('second')
		})

		it('should not refetch when the args are replaced by a structurally equal value', async () => {
			const { calls, fetch } = createDeferredFetch()
			const fetcher = new FetcherController<string, [{ search: string }]>(createHost(), { fetch, args: () => [{ search: 'a' }] })

			fetcher.hostUpdate()
			await waitUntil(() => calls.length === 1)
			await settle(fetcher, calls[0]!, 'first')

			fetcher.hostUpdate()
			await new Promise(resolve => setTimeout(resolve, 50))

			expect(calls.length).toBe(1)
		})

		it('should not fetch on host updates when autoRun is disabled', async () => {
			let search = 'a'
			const { calls, fetch } = createDeferredFetch()
			const fetcher = new FetcherController<string, [{ search: string }]>(createHost(), { fetch, args: () => [{ search }], autoRun: false })

			fetcher.hostUpdate()
			search = 'b'
			fetcher.hostUpdate()
			await new Promise(resolve => setTimeout(resolve, 50))

			expect(calls.length).toBe(0)

			const run = fetcher.run()
			await waitUntil(() => calls.length === 1)
			calls[0]!.resolve('explicit')
			await run

			expect(fetcher.value).toBe('explicit')
		})
	})

	describe('throttling', () => {
		it('should coalesce runs issued within the throttle window into a single fetch', async () => {
			const { calls, fetch } = createDeferredFetch()
			const fetcher = new FetcherController<string>(createHost(), { fetch, autoRun: false, throttle: 100 })
			const first = fetcher.run()
			await waitUntil(() => calls.length === 1)
			await settle(fetcher, calls[0]!, 'initial')
			await first

			fetcher.run()
			fetcher.run()
			const last = fetcher.run()
			await waitUntil(() => calls.length === 2)
			calls[1]!.resolve('batched')
			await last

			expect(calls.length).toBe(2)
			await new Promise(resolve => setTimeout(resolve, 200))
			expect(calls.length).toBe(2)
			expect(fetcher.value).toBe('batched')
		})

		it('should resolve an awaited run only once the batch\'s fetched value is available', async () => {
			const { calls, fetch } = createDeferredFetch()
			const fetcher = new FetcherController<string>(createHost(), { fetch, autoRun: false, throttle: 100 })
			const first = fetcher.run()
			await waitUntil(() => calls.length === 1)
			await settle(fetcher, calls[0]!, 'initial')
			await first

			fetcher.run()
			let valueOnResolution: string | undefined
			const last = fetcher.run().then(() => valueOnResolution = fetcher.value)
			await waitUntil(() => calls.length === 2)

			expect(valueOnResolution).toBeUndefined()

			calls[1]!.resolve('batched')
			await last

			expect(valueOnResolution).toBe('batched')
		})
	})

	describe('racing runs', () => {
		const race = async () => {
			const { calls, fetch } = createDeferredFetch()
			const fetcher = new FetcherController<string>(createHost(), { fetch, autoRun: false })
			const first = fetcher.run()
			await waitUntil(() => calls.length === 1)
			const second = fetcher.run()
			await waitUntil(() => calls.length === 2)
			return { calls, fetcher, first, second }
		}

		it('should settle on the value of the newest run when runs overlap', async () => {
			const { calls, fetcher, first, second } = await race()

			calls[1]!.resolve('second')
			calls[0]!.resolve('first')
			await second
			await first.catch(() => undefined)

			expect(calls.length).toBe(2)
			expect(fetcher.value).toBe('second')
		})

		it('should never resolve a superseded run\'s promise with the stale value', async () => {
			const { calls, fetcher, first, second } = await race()

			calls[1]!.resolve('second')
			calls[0]!.resolve('first')
			await second

			await expectAsync(first).toBeRejectedWithError(EnqueuerError, 'The result of a promise has been discarded in favor of another one which has started afterwards.')
			expect(fetcher.value).toBe('second')
		})
	})
})