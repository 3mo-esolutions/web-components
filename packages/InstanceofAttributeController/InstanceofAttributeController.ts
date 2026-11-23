import { Controller, type ReactiveControllerHost } from '@a11d/lit'

/** A controller that writes the tags of its host's class and of every custom element class it extends into an `instanceof` attribute, so selectors can match subclasses. */
export class InstanceofAttributeController extends Controller {
	private static readonly attribute = 'instanceof'

	constructor(override readonly host: Element & ReactiveControllerHost) {
		super(host)
	}

	private static readonly valuesByConstructor = new WeakMap<object, string>()

	override hostConnected() {
		const { constructor } = this.host
		let value = InstanceofAttributeController.valuesByConstructor.get(constructor)
		if (value === undefined) {
			InstanceofAttributeController.valuesByConstructor.set(constructor, value = [...this.walkupPrototypeChainAndGetAttributeNames()].join(' '))
		}
		this.host.setAttribute(InstanceofAttributeController.attribute, value)
	}

	private *walkupPrototypeChainAndGetAttributeNames() {
		let prototype = this.host.constructor.prototype
		while (prototype) {
			const tagName = typeof prototype.constructor !== 'function' ? undefined : customElements.getName(prototype.constructor)
			if (tagName) {
				yield tagName
			}
			prototype = Object.getPrototypeOf(prototype)
		}
	}
}
