import { Component, component, html } from '@a11d/lit'
import { HydrationController } from './HydrationController.js'
import { SlotController } from './SlotController.js'

describe('HydrationController', () => {
	@component('test-hydration-controller')
	class TestHydrationController extends Component {
		readonly hydrationController = new HydrationController(this)
		readonly slotController = new SlotController(this)
		readonly renders = new Array<{ readonly hydrating: boolean, readonly assignedElements: number }>()

		protected override get template() {
			this.renders.push({
				hydrating: this.hydrationController.hydrating,
				assignedElements: this.slotController.getAssignedElements('').length,
			})
			return html`<slot></slot>`
		}
	}

	let container: HTMLDivElement

	beforeEach(() => {
		container = document.createElement('div')
		document.body.append(container)
	})

	afterEach(() => container.remove())

	const settle = async (element: TestHydrationController) => {
		await element.updateComplete
		await new Promise(resolve => setTimeout(resolve, 0))
		await element.updateComplete
	}

	/** Parsed where it cannot upgrade, so that it upgrades with its shadow root attached, as a server-rendered element does. */
	const renderOnServer = async () => {
		const element = Document.parseHTMLUnsafe('<test-hydration-controller><template shadowrootmode="open"><slot></slot></template><span></span></test-hydration-controller>')
			.querySelector('test-hydration-controller')!
		await new Promise(resolve => setTimeout(resolve, 0))
		container.append(element)
		return element as TestHydrationController
	}

	it('should not be hydrating a host rendered in the browser', async () => {
		const element = document.createElement('test-hydration-controller') as TestHydrationController
		element.append(document.createElement('span'))
		container.append(element)
		await settle(element)

		expect(element.renders[0]).toEqual({ hydrating: false, assignedElements: 1 })
		expect(element.renders.some(render => render.hydrating)).toBe(false)
	})

	it('should hide the light DOM while hydrating a server-rendered host and update once more afterwards', async () => {
		const element = await renderOnServer()
		await settle(element)

		expect(element.renders[0]).toEqual({ hydrating: true, assignedElements: 0 })
		expect(element.renders.at(-1)).toEqual({ hydrating: false, assignedElements: 1 })
	})
})