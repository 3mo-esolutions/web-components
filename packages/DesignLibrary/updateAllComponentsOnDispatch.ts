import { ReactiveElement } from '@a11d/lit'

export function updateAllComponentsOnDispatch(eventDispatcher: EventDispatcher<any>) {
	ReactiveElement.addInitializer(element => element.addController(new class {
		hostConnected = () => eventDispatcher.subscribe(this.handleChange)
		hostDisconnected = () => eventDispatcher.unsubscribe(this.handleChange)
		private readonly handleChange = () => element.requestUpdate()
	}))
}