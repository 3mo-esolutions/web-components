import { Controller, type ReactiveControllerHost } from '@a11d/lit'

export class MediaQueryController extends Controller {
	readonly mediaQuery: MediaQueryList

	get matches() {
		return this.mediaQuery.matches
	}

	constructor(override readonly host: ReactiveControllerHost, readonly query: string) {
		super(host)
		this.mediaQuery = window.matchMedia(query)
	}

	protected readonly handleChange = () => {
		this.host.requestUpdate()
	}

	override hostConnected() {
		this.mediaQuery.onchange = this.handleChange
	}

	override hostDisconnected() {
		this.mediaQuery.onchange = null
	}
}