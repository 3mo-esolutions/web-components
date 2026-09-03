import { Component, component, css, html, query, state } from '@a11d/lit'
import { ComponentTestFixture } from '@a11d/lit-testing'
import { InfiniteScrollController } from './InfiniteScrollController.js'

const containerHeight = 100
const itemHeight = 20

@component('infinite-scroll-test-component')
class InfiniteScrollTestComponent extends Component {
	@query('div#container') readonly container!: HTMLDivElement

	@state() itemCount = 0

	total = 1000
	chunkSize = 5
	reportsEnd = true
	shallFail = false
	shallLoadNothing = false
	suspended = false
	gate?: Promise<void>
	loadCount = 0
	concurrentLoadCount = 0
	maxConcurrentLoadCount = 0

	lastLoad?: Promise<boolean | void>

	readonly controller = new InfiniteScrollController(this, host => ({
		get container() { return host.container },
		get disabled() { return host.suspended },
		fetchNext: () => host.lastLoad = host.fetchNext(),
	}))

	private async fetchNext() {
		this.loadCount++
		this.concurrentLoadCount++
		this.maxConcurrentLoadCount = Math.max(this.maxConcurrentLoadCount, this.concurrentLoadCount)
		try {
			await Promise.resolve()
			await this.gate
			if (this.shallFail) {
				throw new Error('Loading the next chunk failed')
			}
			if (this.shallLoadNothing === false) {
				this.itemCount = Math.min(this.itemCount + this.chunkSize, this.total)
			}
			return this.reportsEnd ? this.itemCount < this.total : undefined
		} finally {
			this.concurrentLoadCount--
		}
	}

	static override get styles() {
		return css`
			#container {
				height: ${containerHeight}px;
				overflow: auto;
			}

			.item {
				height: ${itemHeight}px;
			}
		`
	}

	protected override get template() {
		return html`
			<div id='container'>
				${new Array(this.itemCount).fill(undefined).map((_, index) => html`
					<div class='item'>${index}</div>
				`)}
			</div>
		`
	}
}

/** Awaits the frames the controller uses to coalesce its checks and to measure the container after a chunk. */
const settle = async (component: InfiniteScrollTestComponent) => {
	for (let i = 0; i < 20; i++) {
		await component.updateComplete
		await new Promise(resolve => setTimeout(resolve, 10))
	}
	await component.updateComplete
}

describe('InfiniteScrollController', () => {
	const fixture = new ComponentTestFixture(() => new InfiniteScrollTestComponent())

	it('should fill the container without any user interaction', async () => {
		await settle(fixture.component)

		// Half the container height is the default threshold, so it stops one and a half containers in.
		expect(fixture.component.itemCount).toBe(10)
	})

	it('should not load anything beyond the threshold', async () => {
		await settle(fixture.component)
		const loadCount = fixture.component.loadCount

		fixture.component.container.scrollTop = 1
		fixture.component.container.dispatchEvent(new Event('scroll'))
		await settle(fixture.component)

		expect(fixture.component.loadCount).toBe(loadCount)
	})

	it('should load the next chunk once the user scrolls into the threshold', async () => {
		await settle(fixture.component)

		fixture.component.container.scrollTop = fixture.component.container.scrollHeight
		fixture.component.container.dispatchEvent(new Event('scroll'))
		await settle(fixture.component)

		expect(fixture.component.itemCount).toBe(15)
	})

	it('should never load two chunks at the same time', async () => {
		await settle(fixture.component)

		for (let i = 0; i < 10; i++) {
			fixture.component.container.dispatchEvent(new Event('scroll'))
		}
		await settle(fixture.component)

		expect(fixture.component.maxConcurrentLoadCount).toBe(1)
	})

	it('should not load a chunk per scroll event but only as many as the threshold demands', async () => {
		await settle(fixture.component)
		const loadCount = fixture.component.loadCount

		fixture.component.container.scrollTop = fixture.component.container.scrollHeight
		for (let i = 0; i < 10; i++) {
			fixture.component.container.dispatchEvent(new Event('scroll'))
		}
		await settle(fixture.component)

		expect(fixture.component.loadCount).toBe(loadCount + 1)
	})

	it('should stop loading as soon as no more chunks are available', async () => {
		fixture.component.total = 3
		fixture.component.controller.reset()
		await settle(fixture.component)
		const loadCount = fixture.component.loadCount

		fixture.component.container.dispatchEvent(new Event('scroll'))
		await settle(fixture.component)

		expect(fixture.component.itemCount).toBe(3)
		expect(fixture.component.loadCount).toBe(loadCount)
	})

	it('should stop loading when a chunk does not add anything although more are claimed to be available', async () => {
		fixture.component.shallLoadNothing = true
		fixture.component.controller.reset()
		await settle(fixture.component)

		expect(fixture.component.itemCount).toBe(0)
		expect(fixture.component.loadCount).toBe(1)
	})

	it('should stop loading and expose the error when a chunk fails', async () => {
		fixture.component.shallFail = true
		fixture.component.controller.reset()
		await settle(fixture.component)

		expect(fixture.component.loadCount).toBe(1)
		expect(fixture.component.controller.error).toBeInstanceOf(Error)
		expect(fixture.component.controller.pending).toBeFalse()
	})

	it('should not retry a failed chunk on scroll or resize but only on reset', async () => {
		fixture.component.shallFail = true
		fixture.component.controller.reset()
		await settle(fixture.component)
		const loadCount = fixture.component.loadCount

		fixture.component.container.dispatchEvent(new Event('scroll'))
		await settle(fixture.component)

		expect(fixture.component.loadCount).toBe(loadCount)
		expect(fixture.component.controller.error).toBeInstanceOf(Error)
	})

	it('should keep loading an endless stream for as long as the chunks grow the container', async () => {
		fixture.component.reportsEnd = false
		fixture.component.controller.reset()
		await settle(fixture.component)

		expect(fixture.component.itemCount).toBe(10)
	})

	it('should evaluate loading anew when a reported end of the stream is reset', async () => {
		fixture.component.total = 3
		fixture.component.controller.reset()
		await settle(fixture.component)
		expect(fixture.component.itemCount).toBe(3)

		fixture.component.total = 1000
		fixture.component.controller.reset()
		await settle(fixture.component)

		expect(fixture.component.itemCount).toBeGreaterThan(3)
	})

	it('should not let a settling chunk overrule a reset which happens in the meantime', async () => {
		fixture.component.shallFail = true
		fixture.component.controller.reset()
		await settle(fixture.component)

		fixture.component.shallFail = false
		fixture.component.controller.reset()
		// Reset right after the chunk itself has settled, while the controller is still measuring it.
		fixture.component.shallFail = true
		await new Promise(resolve => setTimeout(resolve, 10))
		await fixture.component.lastLoad?.catch(() => undefined)
		fixture.component.shallFail = false
		fixture.component.controller.reset()
		await settle(fixture.component)

		expect(fixture.component.controller.error).toBeUndefined()
		expect(fixture.component.itemCount).toBe(10)
	})

	it('should resume loading after a failed chunk is reset', async () => {
		fixture.component.shallFail = true
		fixture.component.controller.reset()
		await settle(fixture.component)

		fixture.component.shallFail = false
		fixture.component.controller.reset()
		await settle(fixture.component)

		expect(fixture.component.controller.error).toBeUndefined()
		expect(fixture.component.itemCount).toBe(10)
	})

	it('should not load anything while the container is not laid out', async () => {
		fixture.component.style.display = 'none'
		fixture.component.controller.reset()
		await settle(fixture.component)

		expect(fixture.component.loadCount).toBe(0)

		fixture.component.style.display = ''
		fixture.component.controller.reset()
		await settle(fixture.component)

		expect(fixture.component.itemCount).toBe(10)
	})

	it('should load further chunks when the container grows', async () => {
		await settle(fixture.component)
		const itemCount = fixture.component.itemCount

		fixture.component.renderRoot.querySelector<HTMLElement>('#container')!.style.height = `${containerHeight * 3}px`
		fixture.component.controller.reset()
		await settle(fixture.component)

		expect(fixture.component.itemCount).toBeGreaterThan(itemCount)
	})

	it('should not load anything while disabled and resume once enabled', async () => {
		fixture.component.suspended = true
		fixture.component.controller.reset()
		await settle(fixture.component)

		expect(fixture.component.loadCount).toBe(0)
		expect(fixture.component.itemCount).toBe(0)

		fixture.component.suspended = false
		fixture.component.controller.reset()
		await settle(fixture.component)

		expect(fixture.component.itemCount).toBe(10)
	})

	it('should report pending while a chunk is loading', async () => {
		let openTheGate = () => { }
		fixture.component.gate = new Promise<void>(resolve => openTheGate = resolve)
		fixture.component.controller.reset()

		await new Promise(resolve => setTimeout(resolve, 50))

		expect(fixture.component.controller.pending).toBeTrue()
		expect(fixture.component.loadCount).toBe(1)
		expect(fixture.component.itemCount).toBe(0)

		fixture.component.gate = undefined
		openTheGate()
		await settle(fixture.component)

		expect(fixture.component.controller.pending).toBeFalse()
		expect(fixture.component.itemCount).toBe(10)
	})

	it('should scroll the container back to the start via scrollToStart()', async () => {
		await settle(fixture.component)
		fixture.component.container.scrollTop = fixture.component.container.scrollHeight
		expect(fixture.component.container.scrollTop).toBeGreaterThan(0)

		fixture.component.controller.scrollToStart()
		await new Promise(resolve => setTimeout(resolve, 50))

		expect(fixture.component.container.scrollTop).toBe(0)
	})

	it('should stop fetching after the host is disconnected', async () => {
		await settle(fixture.component)
		const loadCount = fixture.component.loadCount
		const container = fixture.component.container

		fixture.component.remove()

		container.scrollTop = container.scrollHeight
		container.dispatchEvent(new Event('scroll'))
		fixture.component.controller.reset()
		await settle(fixture.component)

		expect(fixture.component.loadCount).toBe(loadCount)
	})
})