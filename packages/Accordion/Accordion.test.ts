import { ComponentTestFixture } from '@a11d/lit-testing'
import { html } from '@a11d/lit'
import { type Accordion } from './Accordion.js'
import { type AccordionItem } from './AccordionItem.js'
import './index.js'

/** The items settle one update cycle after the accordion they are slotted into, so both have to be awaited. */
const settle = async (accordion: Accordion) => {
	await accordion.updateComplete
	await Promise.all(accordion.items.map(item => item.updateComplete))
	await new Promise(resolve => setTimeout(resolve))
}

describe('AccordionItem', () => {
	const fixture = new ComponentTestFixture<AccordionItem>(html`
		<mo-accordion-item heading='Shipping'>
			<p style='height: 60px; margin: 0'>Content</p>
		</mo-accordion-item>
	`)

	const slottedHeadingFixture = new ComponentTestFixture<AccordionItem>(html`
		<mo-accordion-item heading='Shipping'>
			<span slot='heading'>Delivery</span>
			<p style='height: 60px; margin: 0'>Content</p>
		</mo-accordion-item>
	`)

	const summary = () => fixture.component.renderRoot.querySelector('summary')!

	/** A "details" element fires its "toggle" asynchronously, so a click is only followed one task later. */
	const click = async () => {
		summary().click()
		await new Promise(resolve => setTimeout(resolve))
		await fixture.updateComplete
	}

	it('should render its heading into a native details element', () => {
		expect(fixture.component.detailsElement instanceof HTMLDetailsElement).toBe(true)
		expect(summary().textContent).toContain('Shipping')
	})

	it('should let the browser interpolate the height of the content, which is what animates it', () => {
		if (CSS.supports('interpolate-size', 'allow-keywords') === false) {
			// A browser which cannot interpolate a size keyword opens at once, which is the intended way for it to fall short.
			pending('"interpolate-size" is not supported')
		}

		expect(getComputedStyle(fixture.component.detailsElement).getPropertyValue('interpolate-size')).toBe('allow-keywords')
	})

	/** Only the settled heights are asserted, as a transition cannot be sampled reliably while it runs. */
	it('should not take up more room than its summary while it is closed', async () => {
		const closedHeight = fixture.component.detailsElement.getBoundingClientRect().height

		fixture.component.open = true
		await fixture.updateComplete
		await new Promise(resolve => setTimeout(resolve, 500))

		expect(closedHeight).toBe(summary().getBoundingClientRect().height)
		expect(fixture.component.detailsElement.getBoundingClientRect().height).toBeGreaterThanOrEqual(closedHeight)
	})

	it('should open when its summary is clicked and close when it is clicked again', async () => {
		await click()

		expect(fixture.component.open).toBe(true)
		expect(fixture.component.hasAttribute('open')).toBe(true)

		await click()

		expect(fixture.component.open).toBe(false)
	})

	it('should dispatch "openChange" with the new state, but not for the state it is rendered with', async () => {
		const handler = jasmine.createSpy('openChange')
		fixture.component.addEventListener('openChange', handler)

		expect(handler).not.toHaveBeenCalled()

		fixture.component.open = true
		await fixture.updateComplete

		expect(handler).toHaveBeenCalledTimes(1)
		expect(handler.calls.mostRecent().args[0].detail).toBe(true)
	})

	it('should give the "heading" slot precedence over the "heading" attribute', () => {
		const slot = slottedHeadingFixture.component.renderRoot.querySelector<HTMLSlotElement>('slot[name=heading]')!

		expect(slot.assignedNodes({ flatten: true }).map(node => node.textContent)).toEqual(['Delivery'])
	})

	describe('disabled', () => {
		beforeEach(async () => {
			fixture.component.disabled = true
			await fixture.updateComplete
		})

		it('should not open when its summary is clicked', async () => {
			await click()

			expect(fixture.component.open).toBe(false)
		})

		it('should still open when it is told to, as only the interaction is refused', async () => {
			fixture.component.open = true
			await fixture.updateComplete

			expect(fixture.component.detailsElement.open).toBe(true)
		})

		it('should take its summary out of the tab order and announce itself as disabled', () => {
			expect(summary().tabIndex).toBe(-1)
			expect(summary().getAttribute('aria-disabled')).toBe('true')
		})
	})
})

describe('Accordion', () => {
	const fixture = new ComponentTestFixture<Accordion>(html`
		<mo-accordion>
			<mo-accordion-item value='shipping' heading='Shipping'>Shipping</mo-accordion-item>
			<mo-accordion-item value='payment' heading='Payment'>Payment</mo-accordion-item>
			<mo-accordion-item value='returns' heading='Returns'>Returns</mo-accordion-item>
		</mo-accordion>
	`)

	const valuelessItemFixture = new ComponentTestFixture<Accordion>(html`
		<mo-accordion>
			<mo-accordion-item value='shipping' heading='Shipping'>Shipping</mo-accordion-item>
			<mo-accordion-item heading='Notes'>Notes</mo-accordion-item>
		</mo-accordion>
	`)

	const item = (value: string) => fixture.component.items.find(item => item.value === value)!

	const openValues = () => fixture.component.openItems.map(item => item.value)

	beforeEach(() => settle(fixture.component))

	it('should collect the items which are slotted into it', () => {
		expect(fixture.component.items.map(item => item.value)).toEqual(['shipping', 'payment', 'returns'])
	})

	it('should start with every item closed and without a value', () => {
		expect(openValues()).toEqual([])
		expect(fixture.component.value).toBeUndefined()
	})

	it('should close the item which is open when another one opens', async () => {
		item('shipping').open = true
		await settle(fixture.component)

		item('returns').open = true
		await settle(fixture.component)

		expect(openValues()).toEqual(['returns'])
	})

	it('should adopt the value of the item which opens and dispatch "change" once', async () => {
		const handler = jasmine.createSpy('change')
		fixture.component.addEventListener('change', handler)

		item('payment').open = true
		await settle(fixture.component)

		expect(fixture.component.value).toBe('payment')
		expect(handler).toHaveBeenCalledTimes(1)
		expect(handler.calls.mostRecent().args[0].detail).toBe('payment')
	})

	it('should open the item its value names', async () => {
		fixture.component.value = 'payment'
		await settle(fixture.component)

		expect(openValues()).toEqual(['payment'])

		fixture.component.value = undefined
		await settle(fixture.component)

		expect(openValues()).toEqual([])
	})

	it('should not dispatch "change" for a value it was given itself', async () => {
		const handler = jasmine.createSpy('change')
		fixture.component.addEventListener('change', handler)

		fixture.component.value = 'payment'
		await settle(fixture.component)

		expect(handler).not.toHaveBeenCalled()
	})

	it('should leave an accordion nested in one of its items to itself', async () => {
		const nested = document.createElement('mo-accordion')
		const nestedItem = document.createElement('mo-accordion-item')
		nestedItem.value = 'nested'
		nested.appendChild(nestedItem)
		item('shipping').appendChild(nested)
		item('shipping').open = true
		await settle(fixture.component)

		nestedItem.open = true
		await settle(fixture.component)

		expect(fixture.component.value).toBe('shipping')
		expect(item('shipping').open).toBe(true)
	})

	it('should let an item without a value take part in exclusivity but not in the value', async () => {
		const [named, unnamed] = valuelessItemFixture.component.items as [AccordionItem, AccordionItem]
		await settle(valuelessItemFixture.component)

		named.open = true
		await settle(valuelessItemFixture.component)
		expect(valuelessItemFixture.component.value).toBe('shipping')

		unnamed.open = true
		await settle(valuelessItemFixture.component)

		expect(named.open).toBe(false)
		expect(unnamed.open).toBe(true)
		expect(valuelessItemFixture.component.value).toBeUndefined()
	})

	describe('multiple', () => {
		beforeEach(async () => {
			fixture.component.multiple = true
			await settle(fixture.component)
		})

		it('should keep every item which is opened open', async () => {
			item('shipping').open = true
			item('returns').open = true
			await settle(fixture.component)

			expect(openValues()).toEqual(['shipping', 'returns'])
			expect(fixture.component.value).toEqual(['shipping', 'returns'])
		})

		it('should open every item its value names', async () => {
			fixture.component.value = ['payment', 'returns']
			await settle(fixture.component)

			expect(openValues()).toEqual(['payment', 'returns'])
		})

		it('should keep a value it is given in the very update which unsets it', async () => {
			fixture.component.value = ['shipping', 'payment']
			await settle(fixture.component)

			// Both at once is what a control which writes every property of a component does on every change.
			fixture.component.multiple = false
			fixture.component.value = 'returns'
			await settle(fixture.component)

			expect(openValues()).toEqual(['returns'])
			expect(fixture.component.value).toBe('returns')
		})

		it('should fall back to the first open item when it is unset again', async () => {
			fixture.component.value = ['shipping', 'payment']
			await settle(fixture.component)

			fixture.component.multiple = false
			await settle(fixture.component)

			expect(openValues()).toEqual(['shipping'])
			expect(fixture.component.value).toBe('shipping')
		})
	})

	describe('items which are already open', () => {
		const openFixture = new ComponentTestFixture<Accordion>(html`
			<mo-accordion>
				<mo-accordion-item value='shipping' heading='Shipping' open>Shipping</mo-accordion-item>
				<mo-accordion-item value='payment' heading='Payment' open>Payment</mo-accordion-item>
			</mo-accordion>
		`)

		beforeEach(() => settle(openFixture.component))

		it('should keep only the first of them and take its value from it', () => {
			expect(openFixture.component.openItems.map(item => item.value)).toEqual(['shipping'])
			expect(openFixture.component.value).toBe('shipping')
		})
	})
})