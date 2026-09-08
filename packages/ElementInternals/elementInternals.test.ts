import { component, Component } from '@a11d/lit'
import { elementInternals } from './elementInternals.js'

@component('element-internals-test-component')
class ElementInternalsTestComponent extends Component { }

describe('elementInternals', () => {
	let component: ElementInternalsTestComponent

	beforeEach(() => {
		component = new ElementInternalsTestComponent()
		document.body.append(component)
	})

	afterEach(() => component.remove())

	it('attaches once and hands the same internals out again', () => {
		expect(elementInternals(component)).toBe(elementInternals(component))
	})

	it('attaches separately per element', () => {
		const other = new ElementInternalsTestComponent()
		expect(elementInternals(component)).not.toBe(elementInternals(other))
	})

	it('spares the host the second attachInternals(), which the platform refuses', () => {
		elementInternals(component)
		expect(() => component.attachInternals()).toThrow()
	})
})