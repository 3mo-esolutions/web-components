import { Component, html } from '@a11d/lit'
import { DataGridVirtualizationController, type VirtualizableRow } from './DataGridVirtualizationController.js'

class FakeIntersectionObserver {
	static readonly instances = new Array<FakeIntersectionObserver>()
	constructor(readonly callback: IntersectionObserverCallback, readonly options: IntersectionObserverInit) {
		FakeIntersectionObserver.instances.push(this)
	}
	observe() { }
	unobserve() { }
	disconnect() { }
	takeRecords() { return [] }

	report(...reports: Array<[target: Element, isIntersecting: boolean]>) {
		const entries = reports.map(([target, isIntersecting]) => ({
			target,
			isIntersecting,
			rootBounds: { width: 800, height: 2900 },
			boundingClientRect: { height: 36 },
		}))
		this.callback(entries as unknown as Array<IntersectionObserverEntry>, this as unknown as IntersectionObserver)
	}
}

class FakeResizeObserver {
	static readonly instances = new Array<FakeResizeObserver>()
	constructor(readonly callback: ResizeObserverCallback) {
		FakeResizeObserver.instances.push(this)
	}
	observe() { }
	unobserve() { }
	disconnect() { }
}

const createRow = (index: number): VirtualizableRow => ({
	index,
	requestUpdate: vi.fn(),
	updateComplete: Promise.resolve(true),
	addController: () => { },
	removeController: () => { },
})

class TestVirtualizedRows extends Component {
	readonly virtualization = new DataGridVirtualizationController(this)
	readonly rows = [createRow(0), createRow(1)]

	protected override get template() {
		return html`
			<div ${this.virtualization.root.ref()}>
				${this.rows.map(row => html`<div class='part' ${this.virtualization.cells(row)}></div>`)}
			</div>
		`
	}
}

customElements.define('test-virtualized-rows', TestVirtualizedRows)

describe('DataGridVirtualizationController', () => {
	beforeEach(() => {
		FakeIntersectionObserver.instances.length = 0
		FakeResizeObserver.instances.length = 0
		vi.stubGlobal('IntersectionObserver', FakeIntersectionObserver)
		vi.stubGlobal('ResizeObserver', FakeResizeObserver)
	})

	afterEach(() => {
		vi.unstubAllGlobals()
		document.querySelectorAll('test-virtualized-rows').forEach(element => element.remove())
	})

	const setup = async () => {
		const element = new TestVirtualizedRows()
		document.body.append(element)
		await element.updateComplete
		FakeResizeObserver.instances.at(-1)!.callback(
			[{ contentRect: { height: 500 } }] as unknown as Array<ResizeObserverEntry>,
			FakeResizeObserver.instances.at(-1) as unknown as ResizeObserver
		)
		const observerWith = (margin: number) => FakeIntersectionObserver.instances.find(observer => observer.options.rootMargin === `${margin}px 0px`)!
		const { margin, hysteresis } = DataGridVirtualizationController
		const [part] = element.renderRoot.querySelectorAll('.part')
		const [row] = element.rows
		const { virtualization } = element
		return { virtualization, row: row!, part: part!, renderBand: observerWith(margin), retentionBand: observerWith(margin + hysteresis) }
	}

	it('should act on the last report about a part in a batch, as the earlier ones are out of date', async () => {
		const { virtualization, row, part, retentionBand } = await setup()
		expect(virtualization.isRendered(row)).toBe(true)

		retentionBand.report([part, false], [part, true])

		expect(virtualization.isRendered(row)).toBe(true)
	})

	it('should empty a row only once it has left the wide band, and keep it between the two', async () => {
		const { virtualization, row, part, renderBand, retentionBand } = await setup()
		expect(virtualization.isRendered(row)).toBe(true)

		renderBand.report([part, false])
		expect(virtualization.isRendered(row)).toBe(true)

		retentionBand.report([part, false])
		expect(virtualization.isRendered(row)).toBe(false)
	})
})