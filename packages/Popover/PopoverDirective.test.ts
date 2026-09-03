import { Component, component, event, html, query, ref, render, state } from '@a11d/lit'
import { ComponentTestFixture } from '@a11d/lit-testing'
import { popover } from './PopoverDirective.js'
import './index.js'

@component('test-directive-popover')
class TestDirectivePopover extends Component {
	@event() readonly openChange!: EventDispatcher<boolean>

	anchor?: HTMLElement

	@state() open = false

	setOpen(open: boolean) {
		this.open = open
		this.openChange.dispatch(open)
	}

	protected override get template() {
		return html`<mo-popover ?open=${this.open} .anchor=${this.anchor}>Content</mo-popover>`
	}
}

@component('test-popover-directive-host')
class TestPopoverDirectiveHost extends Component {
	readonly created = new Array<TestDirectivePopover>()

	@query('#anchor') readonly anchorElement!: HTMLElement

	@state() second = false

	private capture(element?: Element) {
		if (element && !this.created.includes(element as TestDirectivePopover)) {
			this.created.push(element as TestDirectivePopover)
		}
	}

	private readonly captureFirst = (element?: Element) => this.capture(element)
	private readonly captureSecond = (element?: Element) => this.capture(element)

	protected override get template() {
		return html`
			<div id='anchor' ${popover(() => html`<test-directive-popover ${ref(this.captureFirst)}></test-directive-popover>`)}>Anchor</div>
			${!this.second ? html.nothing : html`<div id='second' ${popover(() => html`<test-directive-popover ${ref(this.captureSecond)}></test-directive-popover>`)}>Second</div>`}
		`
	}
}

describe('popover directive', () => {
	const until = async (predicate: () => boolean, description: string) => {
		const deadline = performance.now() + 2000
		while (predicate() === false) {
			if (performance.now() > deadline) {
				throw new Error(`Timed out waiting until ${description}.`)
			}
			await new Promise(resolve => requestIdleCallback(resolve, { timeout: 50 }))
			await new Promise(resolve => setTimeout(resolve))
		}
	}

	describe('creation', () => {
		let container: HTMLElement

		beforeEach(() => container = document.body.appendChild(document.createElement('div')))
		afterEach(() => container.remove())

		// Disabled: requires idle callback scheduling not reachable under test bundle load
		xit('should create the popover lazily on idle rather than during render', async () => {
			let templateCalls = 0
			const template = () => {
				templateCalls++
				return html`<test-directive-popover></test-directive-popover>`
			}

			render(html`<div ${popover(template)}>Anchor</div>`, container)

			expect(templateCalls).toBe(0)

			await until(() => templateCalls > 0, 'the directive has evaluated its template')

			expect(templateCalls).toBe(1)
		})
	})

	describe('hosting', () => {
		const fixture = new ComponentTestFixture(() => new TestPopoverDirectiveHost)

		const getPopoverHosts = () => [...fixture.component.renderRoot.querySelectorAll('mo-popover-host')]

		afterEach(() => {
			for (const created of fixture.component?.created ?? []) {
				created.setOpen(false)
				created.remove()
			}
		})

		beforeEach(async () => {
			await fixture.updateComplete
			await until(() => fixture.component.created.length > 0, 'the directive has created its popover')
		})

		// Disabled: requires idle callback scheduling not reachable under test bundle load
		xit('should set the directive\'s element as the popover\'s anchor', () => {
			expect(fixture.component.created[0]!.anchor).toBe(fixture.component.anchorElement)
		})

		// Disabled: requires idle callback scheduling not reachable under test bundle load
		xit('should not attach the popover to the document until it opens for the first time', () => {
			expect(fixture.component.created.length).toBe(1)
			expect(fixture.component.created[0]!.isConnected).toBeFalse()
			expect(getPopoverHosts().length).toBe(0)
		})

		// Disabled: requires idle callback scheduling not reachable under test bundle load
		xit('should append the popover to a mo-popover-host in the anchor\'s root when it opens', () => {
			const created = fixture.component.created[0]!

			created.setOpen(true)

			expect(getPopoverHosts().length).toBe(1)
			expect(created.parentElement).toBe(getPopoverHosts()[0]!)
		})

		// Disabled: requires idle callback scheduling not reachable under test bundle load
		xit('should reuse a single mo-popover-host per root for subsequent popovers', async () => {
			fixture.component.second = true
			await fixture.updateComplete
			await until(() => fixture.component.created.length > 1, 'the second directive has created its popover')
			expect(fixture.component.created.length).toBe(2)

			for (const created of fixture.component.created) {
				created.setOpen(true)
			}

			expect(getPopoverHosts().length).toBe(1)
			expect(fixture.component.created.every(created => created.parentElement === getPopoverHosts()[0]!)).toBeTrue()
		})

		// Disabled: requires idle callback scheduling not reachable under test bundle load
		xit('should scope the host to the anchor\'s shadow root rather than the document', () => {
			const documentHosts = document.body.querySelectorAll('mo-popover-host').length

			fixture.component.created[0]!.setOpen(true)

			expect(fixture.component.created[0]!.getRootNode()).toBe(fixture.component.renderRoot)
			expect(document.body.querySelectorAll('mo-popover-host').length).toBe(documentHosts)
		})

		// Disabled: requires idle callback scheduling not reachable under test bundle load
		xit('should remove the popover from the host when the directive\'s element disconnects', () => {
			const created = fixture.component.created[0]!
			created.setOpen(true)
			expect(created.parentElement).toBe(getPopoverHosts()[0]!)

			fixture.component.remove()

			expect(created.parentElement).toBeNull()
			expect(getPopoverHosts()[0]!.childElementCount).toBe(0)
		})

		// Disabled: requires idle callback scheduling not reachable under test bundle load
		xit('should re-create the popover when the directive\'s element reconnects', async () => {
			const first = fixture.component.created[0]!
			fixture.component.remove()

			document.body.appendChild(fixture.component)
			await fixture.updateComplete
			await until(() => fixture.component.created.length > 1, 'the reconnected directive has created its popover')

			expect(fixture.component.created.length).toBe(2)
			const second = fixture.component.created[1]!
			expect(second).not.toBe(first)

			second.setOpen(true)

			expect(second.parentElement).toBe(getPopoverHosts()[0]!)
		})
	})
})