import { Controller, ReactiveControllerHost } from '@a11d/lit'

export class NoIntrinsicDimensionsController extends Controller {
	constructor(override readonly host: Element & ReactiveControllerHost) {
		super(host)
	}

	override hostUpdated() {
		const { width, height } = this.host.getBoundingClientRect()

		if ('environment' in globalThis && (globalThis as any).environment === 'test') {
			return
		}

		if (width === 0 || height === 0) {
			// eslint-disable-next-line no-console
			console.warn(`The following "${this.host.tagName.toLowerCase()}" element has no intrinsic dimensions and the parent element doesn't specify its dimensions.`, this.host)
		}
	}
}