import { Controller, ReactiveElement } from '@a11d/lit'
import { Localizer } from './Localizer.js'

export class LocalizerController extends Controller {
	static readonly connectedComponents = new Set<ReactiveElement>()

	static {
		Localizer.languages.change.subscribe(() => LocalizerController.requestUpdate())
	}

	static requestUpdate() {
		for (const component of LocalizerController.connectedComponents) {
			component.requestUpdate()
		}
	}

	constructor(protected override readonly host: ReactiveElement) {
		super(host)
	}

	override hostConnected() {
		LocalizerController.connectedComponents.add(this.host)
	}

	override hostDisconnected() {
		LocalizerController.connectedComponents.delete(this.host)
	}
}

ReactiveElement.addInitializer(component => new LocalizerController(component))