import { component, Component, html, nothing, query, state } from '@a11d/lit'
import { ComponentTestFixture } from '@a11d/lit/dist/test/index.js'
import { observeIntersection } from './observeIntersection.js'

@component('observe-intersection-test-component')
class ObserveIntersectionTestComponent extends Component {
	readonly callback = jasmine.createSpy()

	@query('div#with-observer') readonly elementWithObserver!: HTMLDivElement
	@query('div#without-observer') readonly elementWithoutObserver!: HTMLDivElement

	@state() shallRender = true

	protected override get template() {
		return !this.shallRender ? nothing : html`
			<div id='with-observer' ${observeIntersection(this.callback)}></div>
			<div id='without-observer'></div>
		`
	}
}

interface FakeIntersectionObserver {
	readonly observe: jasmine.Spy
	readonly disconnect: jasmine.Spy
	readonly callback: IntersectionObserverCallback
}

describe(observeIntersection.name, () => {
	const fixture = new ComponentTestFixture(() => new ObserveIntersectionTestComponent)

	let currentObserver: FakeIntersectionObserver

	beforeAll(() => {
		window.IntersectionObserver = class FakeIntersectionObserver {
			constructor(readonly callback: IntersectionObserverCallback) { currentObserver = this }
			observe = jasmine.createSpy('observe')
			disconnect = jasmine.createSpy('disconnect')
		} as unknown as typeof IntersectionObserver
	})

	it('should register an IntersectionObserver on the element', () => {
		expect(currentObserver.observe).toHaveBeenCalledOnceWith(fixture.component.elementWithObserver)
		expect(currentObserver.observe).not.toHaveBeenCalledWith(fixture.component.elementWithoutObserver)
	})

	it('should call the callback when the element is intersecting', () => {
		const entries = [{ isIntersecting: true }] as Array<IntersectionObserverEntry>

		currentObserver.callback(entries, currentObserver as unknown as IntersectionObserver)

		expect(fixture.component.callback).toHaveBeenCalledWith(entries, currentObserver)
	})

	it('should disconnect the observer when the element is disconnected', async () => {
		const wasCalledTimes = currentObserver.disconnect.calls.count()

		fixture.component.shallRender = false
		await fixture.updateComplete

		expect(currentObserver.disconnect).toHaveBeenCalledTimes(wasCalledTimes + 1)
	})
})