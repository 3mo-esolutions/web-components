import { Component, component, html, state } from '@a11d/lit'
import { ComponentTestFixture } from '@a11d/lit-testing'
import { SlotController } from './SlotController.js'

describe('SlotController', () => {
	@component('test-slot-controller')
	class TestSlotController extends Component {
		@state() renderSlot = true

		slotChangeCount = 0

		readonly slotController = new SlotController(this, () => this.slotChangeCount++)

		protected override get template() {
			return !this.renderSlot ? html.nothing : html`
				<slot></slot>
				<slot name='named'></slot>
			`
		}
	}

	@component('test-slot-controller-wrapper')
	class TestSlotControllerWrapper extends Component {
		get innerComponent() {
			return this.shadowRoot!.querySelector<TestSlotController>('test-slot-controller')!
		}

		protected override get template() {
			return html`
				<test-slot-controller>
					<slot></slot>
				</test-slot-controller>
			`
		}
	}

	const fixture = new ComponentTestFixture<TestSlotController>(html`<test-slot-controller></test-slot-controller>`)

	const element = (tagName: string, slot?: string) => {
		const element = document.createElement(tagName)
		if (slot) {
			element.slot = slot
		}
		return element
	}

	const tick = () => new Promise(resolve => setTimeout(resolve, 0))

	type Test = (fixture: ComponentTestFixture<TestSlotController>) => void | Promise<void>

	// The controller falls back to reading the host's light DOM children whenever the requested
	// slot is not rendered, so every query method has to behave the same in both states.
	const describeBothSlotStates = (tests: Record<string, Test>) => {
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
	}

	describe('getAssignedNodes', () => {
		describeBothSlotStates({
			['should handle no assigned nodes'](fixture) {
				const nodes = fixture.component.slotController.getAssignedNodes('')
				expect(nodes.length).toBe(0)
			},

			['should handle assigned nodes'](fixture) {
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

			['should only return the nodes of the requested named slot'](fixture) {
				const [named, unnamed] = [element('div', 'named'), element('span')]

				fixture.component.append(named, unnamed)

				const nodes = fixture.component.slotController.getAssignedNodes('named')
				expect(nodes.length).toBe(1)
				expect(nodes[0]).toBe(named)
			},

			['should not return named nodes for the default slot'](fixture) {
				const [named, unnamed] = [element('div', 'named'), element('span')]

				fixture.component.append(named, unnamed)

				const nodes = fixture.component.slotController.getAssignedNodes('')
				expect(nodes).not.toContain(named)
				expect(nodes).toContain(unnamed)
			},

			['should handle a named slot without assigned nodes'](fixture) {
				fixture.component.append(element('div'))

				const nodes = fixture.component.slotController.getAssignedNodes('named')
				expect(nodes.length).toBe(0)
			},
		})
	})

	describe('getAssignedElements', () => {
		describeBothSlotStates({
			['should handle no assigned elements'](fixture) {
				const elements = fixture.component.slotController.getAssignedElements('')
				expect(elements.length).toBe(0)
			},

			['should filter out text nodes'](fixture) {
				const div = element('div')

				fixture.component.append(document.createTextNode('Hello, World!'), div)

				const elements = fixture.component.slotController.getAssignedElements('')
				expect(elements.length).toBe(1)
				expect(elements[0]).toBe(div)
			},

			['should only return the elements of the requested named slot'](fixture) {
				const [named, unnamed] = [element('div', 'named'), element('span')]

				fixture.component.append(named, unnamed)

				const elements = fixture.component.slotController.getAssignedElements('named')
				expect(elements.length).toBe(1)
				expect(elements[0]).toBe(named)
			},
		})
	})

	describe('hasAssignedNodes', () => {
		describeBothSlotStates({
			['should be false without assigned nodes'](fixture) {
				expect(fixture.component.slotController.hasAssignedNodes('')).toBeFalse()
			},

			['should be true with an assigned element'](fixture) {
				fixture.component.append(element('div'))
				expect(fixture.component.slotController.hasAssignedNodes('')).toBeTrue()
			},

			['should be true with an assigned text node'](fixture) {
				fixture.component.append(document.createTextNode('Hello, World!'))
				expect(fixture.component.slotController.hasAssignedNodes('')).toBeTrue()
			},

			['should be false when the nodes are assigned to another slot'](fixture) {
				fixture.component.append(element('div', 'named'))
				expect(fixture.component.slotController.hasAssignedNodes('')).toBeFalse()
			},
		})
	})

	describe('hasAssignedElements', () => {
		describeBothSlotStates({
			['should be false without assigned nodes'](fixture) {
				expect(fixture.component.slotController.hasAssignedElements('')).toBeFalse()
			},

			['should be false with only assigned text nodes'](fixture) {
				fixture.component.append(document.createTextNode('Hello, World!'))
				expect(fixture.component.slotController.hasAssignedElements('')).toBeFalse()
			},

			['should be true with an assigned element'](fixture) {
				fixture.component.append(element('div'))
				expect(fixture.component.slotController.hasAssignedElements('')).toBeTrue()
			},
		})
	})

	describe('hasAssignedContent', () => {
		describeBothSlotStates({
			['should be false without assigned nodes'](fixture) {
				expect(fixture.component.slotController.hasAssignedContent('')).toBeFalse()
			},

			['should be false with only whitespace text nodes'](fixture) {
				fixture.component.append(document.createTextNode(' \n\t '))
				expect(fixture.component.slotController.hasAssignedContent('')).toBeFalse()
			},

			['should be true with a non-whitespace text node'](fixture) {
				fixture.component.append(document.createTextNode('Hello, World!'))
				expect(fixture.component.slotController.hasAssignedContent('')).toBeTrue()
			},

			['should be true with an assigned element'](fixture) {
				const div = element('div')
				div.textContent = 'Hello, World!'
				fixture.component.append(div)
				expect(fixture.component.slotController.hasAssignedContent('')).toBeTrue()
			},

			// An element counts as content regardless of what it renders, as it may well be
			// styled or filled by the component itself.
			['should be true with an empty assigned element'](fixture) {
				fixture.component.append(element('div'))
				expect(fixture.component.slotController.hasAssignedContent('')).toBeTrue()
			},
		})
	})

	describe('with a forwarded slot', () => {
		const fixture = new ComponentTestFixture<TestSlotControllerWrapper>(html`
			<test-slot-controller-wrapper>
				<div></div>
			</test-slot-controller-wrapper>
		`)

		beforeEach(() => fixture.component.innerComponent.updateComplete)

		const expectFlattenedNodes = () => {
			const elements = fixture.component.innerComponent.slotController.getAssignedElements('')
			expect(elements.length).toBe(1)
			expect(elements[0]).toBe(fixture.component.querySelector('div'))
		}

		it('should flatten the nodes of the forwarded slot', () => {
			expectFlattenedNodes()
		})

		it('should flatten the nodes of the forwarded slot without a connected slot', async () => {
			fixture.component.innerComponent.renderSlot = false
			await fixture.component.innerComponent.updateComplete
			expectFlattenedNodes()
		})
	})

	describe('change detection', () => {
		it('should request a host update on slotchange', () => {
			const requestUpdate = spyOn(fixture.component, 'requestUpdate')

			fixture.component.shadowRoot!.dispatchEvent(new Event('slotchange'))

			expect(requestUpdate).toHaveBeenCalled()
		})

		it('should invoke the slot change callback on slotchange', () => {
			fixture.component.shadowRoot!.dispatchEvent(new Event('slotchange'))

			expect(fixture.component.slotChangeCount).toBe(1)
		})

		it('should invoke the slot change callback when a child is added', async () => {
			fixture.component.append(element('div'))
			await tick()

			expect(fixture.component.slotChangeCount).toBeGreaterThan(0)
		})

		it('should invoke the slot change callback when a child is removed', async () => {
			const div = element('div')
			fixture.component.append(div)
			await tick()

			const slotChangeCount = fixture.component.slotChangeCount
			div.remove()
			await tick()

			expect(fixture.component.slotChangeCount).toBeGreaterThan(slotChangeCount)
		})

		// Neither a nested mutation nor a mutation without a connected slot emits a
		// "slotchange", so both rely solely on the MutationObserver.
		it('should invoke the slot change callback when a nested child is added', async () => {
			const div = element('div')
			fixture.component.append(div)
			await tick()

			const slotChangeCount = fixture.component.slotChangeCount
			div.append(element('span'))
			await tick()

			expect(fixture.component.slotChangeCount).toBeGreaterThan(slotChangeCount)
		})

		it('should invoke the slot change callback when a child is added without a connected slot', async () => {
			fixture.component.renderSlot = false
			await fixture.updateComplete

			const slotChangeCount = fixture.component.slotChangeCount
			fixture.component.append(element('div'))
			await tick()

			expect(fixture.component.slotChangeCount).toBeGreaterThan(slotChangeCount)
		})

		it('should not handle slotchange after the host is disconnected', () => {
			fixture.component.remove()

			fixture.component.shadowRoot!.dispatchEvent(new Event('slotchange'))

			expect(fixture.component.slotChangeCount).toBe(0)
		})
	})
})