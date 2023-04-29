import { ReactiveControllerHost, Controller } from '@a11d/lit'

export class IntervalController extends Controller {
	private timerId = -1

	constructor(
		protected override readonly host: ReactiveControllerHost,
		protected readonly periodInMilliseconds: number,
		protected readonly tickTask: () => void | Promise<void>
	) {
		super(host)
	}

	override hostConnected() {
		this.tick()
		this.timerId = window.setInterval(this.tick, this.periodInMilliseconds)
	}

	override hostDisconnected() {
		window.clearInterval(this.timerId)
	}

	protected readonly tick = async () => {
		await this.tickTask()
	}
}