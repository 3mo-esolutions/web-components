import { Component, component } from '@a11d/lit'
import { ComponentTestFixture } from '@a11d/lit-testing'
import { InstanceofAttributeController } from './InstanceofAttributeController.js'

describe('InstanceofAttributeController', () => {
	@component('test-instanceof-base')
	class TestBase extends Component {
		readonly instanceofController = new InstanceofAttributeController(this)
	}

	@component('test-instanceof-derived')
	class TestDerived extends TestBase { }

	const base = new ComponentTestFixture<TestBase>(() => new TestBase)
	const derived = new ComponentTestFixture<TestDerived>(() => new TestDerived)

	it('should set the "instanceof" attribute to the host\'s tag name on connect', () => {
		expect(base.component.getAttribute('instanceof')).toBe('test-instanceof-base')
	})

	it('should include the tag names of all registered superclass elements in the prototype chain', () => {
		expect(derived.component.getAttribute('instanceof')).toBe('test-instanceof-derived test-instanceof-base')
	})
})