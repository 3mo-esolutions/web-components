import { Component, component, html } from '@a11d/lit'
import { ComponentTestFixture } from '@a11d/lit-testing'
import { LocalizerController } from './LanguageController.js'
import { Localizer } from './Localizer.js'

describe('LocalizerController', () => {
	@component('test-localizer-controller')
	class TestLocalizerController extends Component { }

	const fixture = new ComponentTestFixture<TestLocalizerController>(html`<test-localizer-controller></test-localizer-controller>`)

	it('should be attached to every ReactiveElement automatically', () => {
		expect(LocalizerController.connectedComponents.has(fixture.component)).toBeTrue()
	})

	it('should request an update of connected components when the language changes', () => {
		const requestUpdate = spyOn(fixture.component, 'requestUpdate')

		Localizer.languages.change.dispatch(Localizer.languages.current)

		expect(requestUpdate).toHaveBeenCalledTimes(1)
	})

	it('should stop updating a component after it disconnects', () => {
		fixture.component.remove()
		const requestUpdate = spyOn(fixture.component, 'requestUpdate')

		Localizer.languages.change.dispatch(Localizer.languages.current)

		expect(LocalizerController.connectedComponents.has(fixture.component)).toBeFalse()
		expect(requestUpdate).not.toHaveBeenCalled()
	})
})