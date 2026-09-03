import { Component, component, html, query, state, style } from '@a11d/lit'
import { ComponentTestFixture } from '@a11d/lit-testing'
import { observeResize } from './observeResize.js'

@component('observe-resize-test-component')
class ObserveResizeTestComponent extends Component {
	readonly callback = jasmine.createSpy<ResizeObserverCallback>('callback')

	@query('div') readonly element!: HTMLDivElement

	@state() width = 50
	@state() shallRender = true

	protected override get template() {
		return !this.shallRender ? html.nothing : html`
			<div ${style({ width: `${this.width}px`, height: '20px' })} ${observeResize(this.callback)}></div>
		`
	}
}

describe('observeResize', () => {
	const fixture = new ComponentTestFixture(() => new ObserveResizeTestComponent)

	const tick = () => new Promise(resolve => setTimeout(resolve, 50))

	const until = async (predicate: () => boolean) => {
		for (let i = 0; i < 20 && !predicate(); ++i) {
			await tick()
		}
	}

	const entryOfLastCall = () => fixture.component.callback.calls.mostRecent().args[0][0]

	it('should invoke the callback with the element\'s entry when it is laid out and when it resizes', async () => {
		await until(() => fixture.component.callback.calls.count() > 0)

		expect(entryOfLastCall()?.target).toBe(fixture.component.element)
		expect(entryOfLastCall()?.contentRect.width).toBe(50)

		fixture.component.width = 120
		await fixture.updateComplete
		await until(() => entryOfLastCall()?.contentRect.width === 120)

		expect(entryOfLastCall()?.contentRect.width).toBe(120)
	})

	it('should disconnect the observer when the directive part is disconnected', async () => {
		const element = fixture.component.element
		await until(() => fixture.component.callback.calls.count() > 0)

		fixture.component.shallRender = false
		await fixture.updateComplete
		await tick()

		const callCount = fixture.component.callback.calls.count()
		element.style.width = '200px'
		document.body.append(element)
		await tick()

		expect(fixture.component.callback).toHaveBeenCalledTimes(callCount)
		element.remove()
	})
})