import { Component, component, html, render } from '@a11d/lit'
import { ComponentTestFixture } from '@a11d/lit-testing'
import { type KeyValue } from './KeyValue.js'
import { type KeyValueList } from './KeyValueList.js'
import './index.js'

describe('KeyValueList', () => {
	const fixture = new ComponentTestFixture<KeyValueList>(html`
		<mo-key-value-list>
			<mo-key-value key='Email'>ada@lovelace.org</mo-key-value>
			<mo-key-value key='Phone'>+49 123 456</mo-key-value>
			<mo-key-value key='Company'>Analytical Engines</mo-key-value>
			<mo-key-value key='Country'>United Kingdom</mo-key-value>
		</mo-key-value-list>
	`)

	const resizeTo = async (width: number) => {
		fixture.component.style.width = `${width}px`
		fixture.component['width'] = width
		fixture.component.requestUpdate()
		await fixture.updateComplete
		await new Promise(resolve => setTimeout(resolve, 20))
		await fixture.updateComplete
	}

	const keyValues = () => [...fixture.component.querySelectorAll('mo-key-value')]

	const trackCount = () => getComputedStyle(fixture.component.renderRoot.querySelector('dl')!)
		.gridTemplateColumns.split(' ').length

	beforeEach(() => resizeTo(900))

	it('should render the pairs as a description list', () => {
		expect(fixture.component.renderRoot.querySelector('dl')).not.toBeNull()
		expect(keyValues()[0]!.renderRoot.querySelector('dt')?.textContent?.trim()).toBe('Email')
		expect(keyValues()[0]!.renderRoot.querySelector('dd slot')).not.toBeNull()
	})

	it('should lay the pairs out over as many key-value columns as fit', async () => {
		expect(fixture.component.columns).toBe(2)
		expect(trackCount()).toBe(4)

		await resizeTo(1200)

		expect(fixture.component.columns).toBe(3)
		expect(trackCount()).toBe(6)
	})

	it('should keep a column which is narrower than "minColumnWidth" rather than none at all', async () => {
		await resizeTo(320)

		expect(fixture.component.columns).toBe(1)
		expect(trackCount()).toBe(2)
	})

	it('should let "minColumnWidth" decide how early a column is dropped', async () => {
		fixture.component.minColumnWidth = 250

		await fixture.updateComplete

		expect(fixture.component.columns).toBe(3)
	})

	it('should give every pair the two tracks of a key-value column', () => {
		const keyValue = keyValues()[0]!
		expect(getComputedStyle(keyValue).gridColumnEnd).toBe('span 2')
		expect(getComputedStyle(keyValue).gridTemplateColumns).toContain('subgrid')
	})

	describe('stacking', () => {
		it('should stack the pairs once the width falls to "stackingWidth"', async () => {
			await resizeTo(285)

			expect(fixture.component.stacked).toBe(true)
			expect(fixture.component.hasAttribute('stacked')).toBe(true)
			expect(trackCount()).toBe(1)
			expect(getComputedStyle(keyValues()[0]!).gridColumnEnd).toBe('span 1')
		})

		it('should let "stackingWidth" decide the width at which the pairs stack', async () => {
			expect(fixture.component.stacked).toBe(false)

			fixture.component.stackingWidth = 1000
			await fixture.updateComplete

			expect(fixture.component.stacked).toBe(true)
			expect(fixture.component.hasAttribute('stacked')).toBe(true)
			expect(fixture.component.columns).toBe(1)
			expect(trackCount()).toBe(1)
		})

		it('should place the key above the value instead of beside it', async () => {
			const key = () => keyValues()[0]!.renderRoot.querySelector('dt')!.getBoundingClientRect()
			const value = () => keyValues()[0]!.renderRoot.querySelector('dd')!.getBoundingClientRect()

			expect(key().right).toBeLessThanOrEqual(value().left)

			await resizeTo(280)

			expect(key().bottom).toBeLessThanOrEqual(value().top)
			expect(key().left).toBe(value().left)
		})

		it('should stack regardless of the width when "alwaysStacked" is set', async () => {
			fixture.component.alwaysStacked = true

			await fixture.updateComplete

			expect(fixture.component.stacked).toBe(true)
			expect(fixture.component.columns).toBe(1)
			expect(trackCount()).toBe(1)
		})

		it('should not divide a single column from a neighbour it does not have', async () => {
			fixture.component.style.setProperty('--mo-key-value-list-divider-color', 'rgb(255, 0, 0)')
			const columnDivider = () => getComputedStyle(keyValues()[0]!, '::before').backgroundColor
			const rowDivider = () => getComputedStyle(keyValues()[0]!, '::after').backgroundColor

			expect(columnDivider()).toBe('rgb(255, 0, 0)')

			await resizeTo(280)

			expect(columnDivider()).toBe('rgba(0, 0, 0, 0)')
			expect(rowDivider()).toBe('rgb(255, 0, 0)')
		})
	})
})

describe('KeyValue', () => {
	const fixture = new ComponentTestFixture<KeyValue>(html`<mo-key-value key='Email'>ada@lovelace.org</mo-key-value>`)

	// Slotted content is reported at the end of the current task, which outlives "updateComplete".
	const settle = async () => {
		await new Promise(resolve => setTimeout(resolve))
		await fixture.updateComplete
	}

	const placeholderShown = () => getComputedStyle(fixture.component.renderRoot.querySelector('.placeholder')!).display !== 'none'

	it('should render the "key" attribute as the term of the pair', () => {
		expect(fixture.component.renderRoot.querySelector('dt')?.textContent?.trim()).toBe('Email')
	})

	it('should let the "key" slot supersede the attribute', async () => {
		const key = document.createElement('span')
		key.slot = 'key'
		key.textContent = 'E-Mail'
		fixture.component.appendChild(key)

		await settle()

		const keySlot = fixture.component.renderRoot.querySelector<HTMLSlotElement>('slot[name=key]')!
		expect(keySlot.assignedElements()).toEqual([key])
	})

	it('should not be empty while it has a value', () => {
		expect(fixture.component.empty).toBe(false)
		expect(fixture.component.hasAttribute('empty')).toBe(false)
		expect(placeholderShown()).toBe(false)
	})

	it('should be empty and show a placeholder without a value', async () => {
		fixture.component.textContent = ''

		await settle()

		expect(fixture.component.empty).toBe(true)
		expect(fixture.component.hasAttribute('empty')).toBe(true)
		expect(placeholderShown()).toBe(true)
	})

	it('should take a value which is text whole when it is clicked, but not one made of elements', async () => {
		const element = document.createElement('span')
		fixture.component.appendChild(element)

		await settle()

		expect(getComputedStyle(fixture.component.renderRoot.querySelector('dd')!).userSelect).toBe('all')
		expect(getComputedStyle(element).userSelect).toBe('text')
	})

	it('should count an element without text as a value', async () => {
		fixture.component.textContent = ''
		fixture.component.appendChild(document.createElement('span'))

		await settle()

		expect(fixture.component.empty).toBe(false)
		expect(placeholderShown()).toBe(false)
	})

	describe('value', () => {
		it('should render the "value" attribute as the value of the pair', async () => {
			fixture.component.textContent = ''
			fixture.component.value = 'ada@lovelace.org'

			await settle()

			expect(fixture.component.renderRoot.querySelector('dd')!.textContent).toContain('ada@lovelace.org')
			expect(fixture.component.empty).toBe(false)
			expect(placeholderShown()).toBe(false)
		})

		it('should let slotted content supersede it', async () => {
			fixture.component.value = 'from the property'

			await settle()

			const slot = fixture.component.renderRoot.querySelector<HTMLSlotElement>('dd slot')!
			expect(slot.assignedNodes().map(node => node.textContent).join('')).toBe('ada@lovelace.org')
		})
	})

	describe('hiddenWhenEmpty', () => {
		const empty = async () => {
			fixture.component.textContent = ''
			await settle()
		}

		it('should keep an empty pair in place unless it is set', async () => {
			await empty()

			expect(getComputedStyle(fixture.component).display).not.toBe('none')
		})

		it('should take an empty pair out of the list', async () => {
			fixture.component.hiddenWhenEmpty = true

			await empty()

			expect(getComputedStyle(fixture.component).display).toBe('none')
		})

		it('should bring the pair back once it has a value again', async () => {
			fixture.component.hiddenWhenEmpty = true
			await empty()

			fixture.component.textContent = 'ada@lovelace.org'
			await settle()

			expect(getComputedStyle(fixture.component).display).not.toBe('none')
		})

		it('should notice a value which lit rewrites and then clears', async () => {
			const host = document.createElement('div')
			document.body.appendChild(host)
			const renderValue = (value: string) => render(html`<mo-key-value hiddenWhenEmpty key='Email'>${value}</mo-key-value>`, host)

			renderValue('ada@lovelace.org')
			const keyValue = host.querySelector('mo-key-value')!
			await keyValue.updateComplete
			expect(keyValue.empty).toBe(false)

			renderValue('a')
			await new Promise(resolve => setTimeout(resolve))
			await keyValue.updateComplete
			expect(keyValue.empty).toBe(false)

			renderValue('')
			await new Promise(resolve => setTimeout(resolve))
			await keyValue.updateComplete
			expect(keyValue.empty).toBe(true)
			expect(getComputedStyle(keyValue).display).toBe('none')

			host.remove()
		})
	})

	describe('with a forwarded value slot', () => {
		@component('key-value-list-test-wrapper')
		class Wrapper extends Component {
			get keyValue() { return this.renderRoot.querySelector('mo-key-value') as KeyValue }

			protected override get template() {
				return html`
					<mo-key-value key='Email'>
						<slot></slot>
					</mo-key-value>
				`
			}
		}

		const wrapperWith = async (content?: Node) => {
			const wrapper = new Wrapper()
			if (content) {
				wrapper.appendChild(content)
			}
			document.body.appendChild(wrapper)
			await wrapper.updateComplete
			await new Promise(resolve => setTimeout(resolve))
			await wrapper.keyValue.updateComplete
			return wrapper
		}

		it('should be empty while nothing reaches the forwarded slot', async () => {
			const wrapper = await wrapperWith()

			expect(wrapper.keyValue.empty).toBe(true)

			wrapper.remove()
		})

		it('should not be empty once something does', async () => {
			const wrapper = await wrapperWith(document.createTextNode('ada@lovelace.org'))

			expect(wrapper.keyValue.empty).toBe(false)

			wrapper.remove()
		})
	})
})