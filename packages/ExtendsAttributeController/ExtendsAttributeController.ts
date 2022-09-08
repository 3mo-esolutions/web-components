import { Controller, ReactiveControllerHost } from '@a11d/lit'

export class ExtendsAttributeController extends Controller {
	constructor(override readonly host: Element & ReactiveControllerHost) {
		super(host)
	}

	override hostConnected() {
		this.host.setAttribute('extends', [...this.walkupPrototypeChainAndGetAttributeNames()].join(' '))
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