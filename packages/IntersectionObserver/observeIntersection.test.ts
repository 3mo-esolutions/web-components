import { component, Component, html, query, render, state } from '@a11d/lit'
import { ComponentTestFixture } from '@a11d/lit-testing'
import { observeIntersection } from './observeIntersection.js'

@component('observe-intersection-test-component')
class ObserveIntersectionTestComponent extends Component {
	readonly callback = jasmine.createSpy()

	@query('div#with-observer') readonly elementWithObserver!: HTMLDivElement
	@query('div#without-observer') readonly elementWithoutObserver!: HTMLDivElement

	@state() shallRender = true

	protected override get template() {
		return !this.shallRender ? html.nothing : html`
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

describe('observeIntersection', () => {
	let currentObserver: FakeIntersectionObserver
	let originalIntersectionObserver: typeof IntersectionObserver

	beforeEach(() => {
		originalIntersectionObserver = window.IntersectionObserver
		window.IntersectionObserver = class FakeIntersectionObserver {
			constructor(readonly callback: IntersectionObserverCallback) { currentObserver = this }
			observe = jasmine.createSpy('observe')
			unobserve = jasmine.createSpy('unobserve')
			disconnect = jasmine.createSpy('disconnect')
		} as unknown as typeof IntersectionObserver
	})

	afterEach(() => window.IntersectionObserver = originalIntersectionObserver)

	const fixture = new ComponentTestFixture(() => new ObserveIntersectionTestComponent)

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

	it('should observe the element again when the directive is reconnected', () => {
		const container = document.createElement('div')
		document.body.appendChild(container)
		try {
			const part = render(html`<div ${observeIntersection(jasmine.createSpy())}></div>`, container)
			const element = container.firstElementChild!
			const observerWhileConnected = currentObserver
			expect(observerWhileConnected.observe).toHaveBeenCalledOnceWith(element)

			part.setConnected(false)
			expect(observerWhileConnected.disconnect).toHaveBeenCalledTimes(1)

			part.setConnected(true)

			expect(currentObserver).not.toBe(observerWhileConnected)
			expect(currentObserver.observe).toHaveBeenCalledOnceWith(element)
		} finally {
			container.remove()
		}
	})
})