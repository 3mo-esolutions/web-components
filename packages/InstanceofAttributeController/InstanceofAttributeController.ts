import { Controller, type ReactiveControllerHost } from '@a11d/lit'

/** A controller that writes the tags of its host's class and of every custom element class it extends into an `instanceof` attribute, so selectors can match subclasses. */
export class InstanceofAttributeController extends Controller {
	private static readonly attribute = 'instanceof'

	constructor(override readonly host: Element & ReactiveControllerHost) {
		super(host)
	}

	override hostConnected() {
		this.host.setAttribute(InstanceofAttributeController.attribute, [...this.walkupPrototypeChainAndGetAttributeNames()].join(' '))
	}

	private *walkupPrototypeChainAndGetAttributeNames() {
		let prototype = this.host.constructor.prototype
		while (prototype) {
			try {
				const tagName = new prototype.constructor().tagName
				if (tagName) {
					yield tagName.toLowerCase()
				}
			} catch {
				// Do nothing
			} finally {
				prototype = Object.getPrototypeOf(prototype)
			}
		}
	}
}