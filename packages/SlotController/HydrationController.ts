import { Controller, isServer, type ReactiveControllerHost } from '@a11d/lit'

/**
 * Tracks whether a server-rendered host is hydrating, i.e. rendering its first update in the browser.
 *
 * Hydration fails on any template the server did not render, and a server cannot see the light DOM.
 * A template must therefore not depend on the light DOM on the server or while hydrating,
 * which is why the host updates once more right after hydrating to catch up on it.
 *
 * A client render also signals a change of every slot it renders with assigned content,
 * which a server-rendered slot never does, so the host's slots signal it right after hydrating as well.
 */
export class HydrationController extends Controller {
	private _hydrating: boolean

	constructor(protected override readonly host: ReactiveControllerHost & Element) {
		super(host)
		this._hydrating = isServer === false && !!host.shadowRoot
	}

	get hydrating() {
		return this._hydrating
	}

	override hostUpdated() {
		if (this._hydrating) {
			this._hydrating = false
			this.host.updateComplete.then(() => this.hydrated())
		}
	}

	private hydrated() {
		this.host.requestUpdate()
		for (const slot of this.host.shadowRoot?.querySelectorAll('slot') ?? []) {
			if (slot.assignedNodes().length > 0) {
				slot.dispatchEvent(new Event('slotchange', { bubbles: true }))
			}
		}
	}
}