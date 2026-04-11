import { Controller } from '@a11d/lit'
import { Theme } from './Theme.js'

export class ThemeController extends Controller {
	override hostConnected() {
		Theme.accent.changed.subscribe(this.handleChange)
		Theme.background.changed.subscribe(this.handleChange)
	}

	override hostDisconnected() {
		Theme.accent.changed.unsubscribe(this.handleChange)
		Theme.background.changed.unsubscribe(this.handleChange)
	}

	private handleChange = () => this.host.requestUpdate()
}