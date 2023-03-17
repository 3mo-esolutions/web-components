import { Controller, type ReactiveControllerHost } from '@a11d/lit'

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