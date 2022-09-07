import { Controller, ReactiveControllerHost } from '@a11d/lit'

export class NoIntrinsicDimensionsController extends Controller {
	constructor(override readonly host: Element & ReactiveControllerHost) {
		super(host)
	}

	override hostConnected() {
		const { width, height } = this.host.getBoundingClientRect()
		if (width === 0 || height === 0) {
			// eslint-disable-next-line no-console
			console.error(`The following "${this.host.tagName.toLowerCase()}" element has no intrinsic dimensions as the parent element doesn't specify its dimensions.`, this.host)
		}
	}
}