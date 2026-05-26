import { Controller, type ReactiveControllerHost } from '@a11d/lit'

export class MediaQueryController extends Controller {
	private readonly mediaQuery: MediaQueryList

	get matches() {
		return this.mediaQuery.matches
	}

	constructor(override readonly host: ReactiveControllerHost, readonly query: string, readonly callback?: (matches: boolean) => void) {
		super(host)
		this.mediaQuery = window.matchMedia(query)
	}

	protected readonly handleChange = () => {
		this.callback?.(this.matches)
		this.host.requestUpdate()
	}

	override hostConnected() {
		this.mediaQuery.onchange = this.handleChange
	}

	override hostDisconnected() {
		this.mediaQuery.onchange = null
	}
}