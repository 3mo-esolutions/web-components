import { Component, component, html, query, type HTMLTemplateResult } from '@a11d/lit'
import { ComponentTestFixture } from '@a11d/lit-testing'
import { TooltipPlacement } from './TooltipPlacement.js'
import { tooltip } from './TooltipDirective.js'
import { type Tooltip } from './Tooltip.js'
import './index.js'

@component('test-tooltip-directive-host')
class TestTooltipDirectiveHost extends Component {
	content: string | (() => HTMLTemplateResult) = 'Directive tooltip'
	placement?: TooltipPlacement

	@query('#anchor') readonly anchorElement!: HTMLButtonElement

	get tooltip() { return this.renderRoot.querySelector('mo-tooltip') }

	protected override get template() {
		return html`<button id='anchor' ${tooltip(this.content, this.placement)}>Anchor</button>`
	}
}

describe('tooltip directive', () => {
	// The pointer type is a static shared by every PointerController on the page and other suites
	// drive it to "touch", which would send the tooltip down its touch path.
	beforeEach(() => document.dispatchEvent(new PointerEvent('pointerdown', { pointerType: 'mouse' })))

	const create = (host: Partial<TestTooltipDirectiveHost>) =>
		new ComponentTestFixture<TestTooltipDirectiveHost>(() => Object.assign(new TestTooltipDirectiveHost, host))

	const plain = create({ content: 'Directive tooltip' })
	const templated = create({ content: () => html`<span>Rich directive</span>` })
	const placed = create({ content: 'Placed tooltip', placement: TooltipPlacement.BlockStart })

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

	/** Raises keyboard focus interest on the anchor. Headless Firefox delivers no focus events for a
	 * programmatic focus(), so they are dispatched alongside; whether the focus counts as keyboard-driven
	 * is the platform's ":focus-visible" verdict, requested explicitly. */
	function raiseInterest(fixture: ComponentTestFixture<TestTooltipDirectiveHost>) {
		const anchor = fixture.component.anchorElement
		anchor.focus({ preventScroll: true, focusVisible: true } as FocusOptions)
		if (!anchor.matches(':focus-visible')) {
			pending('The platform did not apply the requested focus visibility, as headless Firefox does not in an inactive window')
		}
		anchor.dispatchEvent(new FocusEvent('focus', { composed: true }))
		anchor.dispatchEvent(new FocusEvent('focusin', { bubbles: true, composed: true }))
	}

	async function open(fixture: ComponentTestFixture<TestTooltipDirectiveHost>) {
		await fixture.component.updateComplete
		await until(() => {
			raiseInterest(fixture)
			return !!fixture.component.tooltip
		}, 'the directive has created and opened its tooltip')
		const element = fixture.component.tooltip!
		await element.updateComplete
		return element
	}

	afterEach(async () => {
		for (const fixture of [plain, templated, placed]) {
			fixture.component?.tooltip?.['setOpen'](false)
			fixture.component?.anchorElement?.blur()
			fixture.component?.anchorElement?.dispatchEvent(new FocusEvent('focusout', { bubbles: true, composed: true }))
			fixture.component?.tooltip?.remove()
			await fixture.component?.updateComplete
		}
	})

	it('should lazily create a mo-tooltip anchored to the decorated element', async () => {
		expect(plain.component.tooltip).toBeNull()

		const element = await open(plain)

		expect(element.anchor).toBe(plain.component.anchorElement)
		expect(element.open).toBeTrue()
	})

	it('should render the given string or template content into the tooltip', async () => {
		expect((await open(plain)).textContent?.trim()).toBe('Directive tooltip')

		expect((await open(templated)).querySelector('span')?.textContent).toBe('Rich directive')
	})

	it('should apply the given placement', async () => {
		const element = await open(placed)

		expect(element.placement).toBe(TooltipPlacement.BlockStart)
		expect(element.renderRoot.querySelector('mo-popover')!.placement).toBe(TooltipPlacement.BlockStart)
	})
})

describe('tooltip directive lazy materialization', () => {
	@component('test-lazy-tooltip-anchor')
	class LazyTooltipAnchor extends Component {
		@query('button') readonly button!: HTMLButtonElement

		protected override get template() {
			return html`<button ${tooltip('Test tooltip')}>Anchor</button>`
		}
	}

	// The pointer type is a static shared by every PointerController on the page and other specs
	// drive it to "touch", which would send the tooltip down its touch path.
	beforeEach(() => document.dispatchEvent(new PointerEvent('pointerdown', { pointerType: 'mouse' })))

	const fixture = new ComponentTestFixture(() => new LazyTooltipAnchor)

	const queryMaterializedTooltip = () => fixture.component.renderRoot
		.querySelector('mo-popover-host')
		?.querySelector<Tooltip>('mo-tooltip')
		?? undefined

	/**
	 * The tooltip is materialized on the first interaction and only then takes the interaction
	 * over, across several asynchronous steps, so its state is awaited rather than assumed to
	 * have settled after a fixed number of ticks.
	 */
	const waitForTooltip = async (predicate: (tooltip?: Tooltip) => boolean) => {
		for (let i = 0; i < 50 && !predicate(queryMaterializedTooltip()); i++) {
			await new Promise(r => requestAnimationFrame(r))
			await new Promise(r => setTimeout(r))
		}
		return queryMaterializedTooltip()
	}

	it('should label the anchor immediately without materializing the tooltip', () => {
		expect(fixture.component.button.getAttribute('aria-label')).toBe('Test tooltip')
		expect(queryMaterializedTooltip()).toBeUndefined()
	})

	describe('with a localized label', () => {
		@component('test-localized-tooltip-anchor')
		class LocalizedTooltipAnchor extends Component {
			@query('button') readonly button!: HTMLButtonElement

			protected override get template() {
				return html`<button ${tooltip(t('Copy'))}>Anchor</button>`
			}
		}

		const localized = new ComponentTestFixture(() => new LocalizedTooltipAnchor)

		it('should label the anchor, as localized strings are objects rather than primitive strings', () => {
			expect(localized.component.button.getAttribute('aria-label')).toBe('Copy')
		})
	})

	it('should materialize and open the tooltip on hover', async () => {
		fixture.component.button.dispatchEvent(new PointerEvent('pointerenter', { pointerType: 'mouse' } as PointerEventInit))

		const tooltipElement = await waitForTooltip(t => t?.open === true)

		expect(tooltipElement).toBeDefined()
		expect(tooltipElement?.open).toBe(true)
		expect(tooltipElement?.textContent?.trim()).toBe('Test tooltip')
	})

	it('should close the tooltip when the pointer leaves the anchor', async () => {
		fixture.component.button.dispatchEvent(new PointerEvent('pointerenter', { pointerType: 'mouse' } as PointerEventInit))
		const tooltipElement = await waitForTooltip(t => t?.open === true)
		expect(tooltipElement?.open).toBe(true)

		fixture.component.button.dispatchEvent(new PointerEvent('pointerleave', { pointerType: 'mouse' } as PointerEventInit))
		await waitForTooltip(t => t?.open === false)

		expect(tooltipElement?.open).toBe(false)
	})

	it('should open the tooltip on keyboard focus', async () => {
		fixture.component.button.focus({ preventScroll: true, focusVisible: true } as FocusOptions)
		if (!fixture.component.button.matches(':focus-visible')) {
			pending('The platform did not apply the requested focus visibility, as headless Firefox does not in an inactive window')
		}
		fixture.component.button.dispatchEvent(new FocusEvent('focusin', { bubbles: true }))

		const tooltipElement = await waitForTooltip(t => t?.open === true)

		expect(tooltipElement?.open).toBe(true)
	})

	it('should end a touch tap closed, although it materializes the tooltip and concludes with a click', async () => {
		const touch = (type: string, target: EventTarget = fixture.component.button) =>
			target.dispatchEvent(new PointerEvent(type, { pointerType: 'touch', bubbles: true, composed: true }))

		touch('pointerenter')
		touch('pointerdown')
		const tooltipElement = await waitForTooltip(t => t !== undefined)
		touch('pointerup', document)
		touch('pointerleave')
		fixture.component.button.click()
		// Leaves room for the deferred hand-off of the initiating event to land as well
		await new Promise(r => setTimeout(r, 60))

		expect(tooltipElement?.open).toBe(false)
		expect(tooltipElement?.renderRoot.querySelector('mo-popover')?.matches(':popover-open')).toBe(false)
	})
})