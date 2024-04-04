import { Component, component, html, state } from '@a11d/lit'
import { ComponentTestFixture } from '@a11d/lit-testing'
import { SlotController } from './SlotController.js'

fdescribe('SlotController', () => {
	@component('test-slot-controller')
	class TestSlotController extends Component {
		@state() renderSlot = true

		readonly slotController = new SlotController(this)

		protected override get template() {
			return !this.renderSlot ? html.nothing : html`<slot></slot>`
		}
	}

	const fixture = new ComponentTestFixture<TestSlotController>(html`<test-slot-controller></test-slot-controller>`)

	describe('getAssignedNodes', () => {
		const tests = {
			['should handle no assigned nodes'](fixture: ComponentTestFixture<TestSlotController>) {
				const nodes = fixture.component.slotController.getAssignedNodes('')
				expect(nodes.length).toBe(0)
			},

			['should handle assigned nodes'](fixture: ComponentTestFixture<TestSlotController>) {
				const [div, span, text] = [
					document.createElement('div'),
					document.createElement('span'),
					document.createTextNode('Hello, World!')
				]

				fixture.component.append(div, span, text)

				const nodes = fixture.component.slotController.getAssignedNodes('')
				expect(nodes).toContain(div)
				expect(nodes).toContain(span)
				expect(nodes).toContain(text)
			},
		}

		describe('with connected slot', () => {
			for (const [name, test] of Object.entries(tests)) {
				it(name, () => test(fixture))
			}
		})

		describe('without connected slot', () => {
			beforeEach(async () => {
				fixture.component.renderSlot = false
				await fixture.updateComplete
			})

			for (const [name, test] of Object.entries(tests)) {
				it(name, () => test(fixture))
			}
		})
	})
})