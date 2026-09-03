import { Component, component } from '@a11d/lit'
import { MediaQueryController } from './MediaQueryController.js'

class FakeMediaQueryList {
	matches = false
	onchange: ((e: MediaQueryListEvent) => void) | null = null

	constructor(readonly media: string) { }

	change(matches: boolean) {
		this.matches = matches
		this.onchange?.(new Event('change') as MediaQueryListEvent)
	}
}

const query = '(min-width: 1234px)'

@component('media-query-controller-test-component')
class TestComponent extends Component {
	readonly matches = new Array<boolean>()
	readonly controller = new MediaQueryController(this, query, matches => this.matches.push(matches))
}

describe('MediaQueryController', () => {
	let mediaQueryList: FakeMediaQueryList
	let component: TestComponent
	let originalMatchMedia: typeof window.matchMedia

	beforeEach(async () => {
		originalMatchMedia = window.matchMedia
		window.matchMedia = (media: string) => (mediaQueryList = new FakeMediaQueryList(media)) as unknown as MediaQueryList
		component = new TestComponent()
		document.body.appendChild(component)
		await component.updateComplete
	})

	afterEach(() => {
		component.remove()
		window.matchMedia = originalMatchMedia
	})

	it('should expose whether the query currently matches', () => {
		expect(mediaQueryList.media).toBe(query)
		expect(component.controller.matches).toBeFalse()

		mediaQueryList.matches = true

		expect(component.controller.matches).toBeTrue()
	})

	it('should invoke the callback and request a host update when the match state changes', () => {
		spyOn(component, 'requestUpdate')

		mediaQueryList.change(true)

		expect(component.matches).toEqual([true])
		expect(component.requestUpdate).toHaveBeenCalled()

		mediaQueryList.change(false)

		expect(component.matches).toEqual([true, false])
	})

	it('should stop reacting to changes after the host is disconnected', () => {
		component.remove()

		mediaQueryList.change(true)

		expect(component.matches).toEqual([])
	})
})