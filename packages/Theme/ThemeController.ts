import { Controller, ReactiveElement } from '@a11d/lit'
import { Theme } from './Theme.js'

export class ThemeController extends Controller {
	constructor(override readonly host: ReactiveElement) {
		super(host)
	}

	override hostConnected() {
		this.setAttribute()
		Theme.accent.changed.subscribe(this.handleChange)
		Theme.background.changed.subscribe(this.handleChange)
	}

	override hostDisconnected() {
		Theme.accent.changed.unsubscribe(this.handleChange)
		Theme.background.changed.unsubscribe(this.handleChange)
	}

	private handleChange = () => {
		this.setAttribute()
		this.host.requestUpdate()
	}

	private setAttribute() {
		this.host.setAttribute('data-theme', Theme.background.calculatedValue)
	}
}