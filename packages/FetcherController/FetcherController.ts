import { type ReactiveControllerHost } from '@a11d/lit'
import { equals } from '@a11d/equals'
import { Task, TaskStatus as TaskStaus, type TaskConfig } from '@lit/task'
import { Throttler } from '@3mo/throttler'
import { Enqueuer } from './index.js'

export class FetcherController<T = unknown, A extends ReadonlyArray<unknown> = readonly unknown[]> extends Task<A, T> {
	protected readonly fetchEnqueuer = new Enqueuer()
	protected readonly throttler = new Throttler(this.options?.throttle ?? 0)

	constructor(
		protected readonly host: ReactiveControllerHost,
		protected readonly options: {
			readonly fetch: TaskConfig<A, T>['task']
			readonly args?: TaskConfig<A, T>['args']
			readonly autoRun?: TaskConfig<A, T>['autoRun']
			readonly throttle?: number
		}
	) {
		super(host, {
			task: options.fetch,
			args: options.args,
			autoRun: options.autoRun,
			argsEqual: (a, b) => Object[equals](a, b),
		})
	}

	get pending() {
		return super.status === TaskStaus.PENDING
	}

	override async run(args?: A) {
		await this.throttler.throttle()
		await this.fetchEnqueuer.enqueue(super.run(args))
	}
}