import { PureEventDispatcher, ReactiveElement } from '@a11d/lit'
import { updateAllComponentsOnDispatch } from './updateAllComponentsOnDispatch.js'

const dispatcher = new PureEventDispatcher<void>()
updateAllComponentsOnDispatch(dispatcher)

class TestUpdateTarget extends ReactiveElement { }
customElements.define('test-update-all-components-on-dispatch-target', TestUpdateTarget)

describe('updateAllComponentsOnDispatch', () => {
	let element: TestUpdateTarget

	beforeEach(async () => {
		element = new TestUpdateTarget
		document.body.appendChild(element)
		await element.updateComplete
	})

	afterEach(() => element.remove())

	it('should request an update of connected components when the dispatcher fires', () => {
		const requestUpdate = spyOn(element, 'requestUpdate')

		dispatcher.dispatch()

		expect(requestUpdate).toHaveBeenCalledTimes(1)
	})

	it('should stop updating a component after it disconnects', () => {
		const requestUpdate = spyOn(element, 'requestUpdate')
		element.remove()

		dispatcher.dispatch()

		expect(requestUpdate).not.toHaveBeenCalled()
	})
})