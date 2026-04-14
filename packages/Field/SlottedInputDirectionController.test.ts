import { component, Component, html } from '@a11d/lit'
import { ComponentTestFixture } from '@a11d/lit-testing'
import { SlottedInputDirectionController } from './SlottedInputDirectionController.js'

@component('slotted-input-direction-controller-test')
class TestComponent extends Component {
	readonly inputDirectionController = new SlottedInputDirectionController(
		this,
		() => this.querySelector('input'),
	)

	protected override get template() {
		return html`<slot @slotchange=${() => this.inputDirectionController.observe()}></slot>`
	}
}

describe('SlottedInputDirectionController', () => {
	const fixture = new ComponentTestFixture<TestComponent>(() => {
		const component = new TestComponent()
		const input = document.createElement('input')
		component.appendChild(input)
		return component
	})

	function getInput() {
		return fixture.component.querySelector('input')!
	}

	it('should set dir="auto" on the input if no dir is set', async () => {
		await fixture.update()
		expect(getInput().getAttribute('dir')).toBe('auto')
	})

	it('should not override an explicit dir on the input', async () => {
		getInput().setAttribute('dir', 'rtl')
		fixture.component.inputDirectionController.observe()
		await fixture.update()
		expect(getInput().getAttribute('dir')).toBe('rtl')
	})

	it('should set host dir to "rtl" when input matches :dir(rtl)', async () => {
		getInput().setAttribute('dir', 'rtl')
		fixture.component.inputDirectionController.observe()
		await fixture.update()
		expect(fixture.component.dir).toBe('rtl')
	})

	it('should set host dir to "" when input matches :dir(ltr)', async () => {
		getInput().setAttribute('dir', 'ltr')
		fixture.component.inputDirectionController.observe()
		await fixture.update()
		expect(fixture.component.dir).toBe('')
	})

	it('should react to dir attribute changes on the input', async () => {
		await fixture.update()
		expect(fixture.component.dir).toBe('')

		getInput().setAttribute('dir', 'rtl')
		// MutationObserver is async, wait a microtask
		await new Promise(resolve => setTimeout(resolve, 0))
		expect(fixture.component.dir).toBe('rtl')

		getInput().setAttribute('dir', 'ltr')
		await new Promise(resolve => setTimeout(resolve, 0))
		expect(fixture.component.dir).toBe('')
	})

	it('should disconnect the observer on disconnect()', async () => {
		await fixture.update()
		fixture.component.inputDirectionController.disconnect()

		getInput().setAttribute('dir', 'rtl')
		await new Promise(resolve => setTimeout(resolve, 0))
		// Should not have reacted
		expect(fixture.component.dir).toBe('')
	})
})