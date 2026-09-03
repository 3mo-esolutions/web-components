import { html } from '@a11d/lit'
import { ComponentTestFixture } from '@a11d/lit-testing'
import { list, type List } from './index.js'

describe('List', () => {
	const fixture = new ComponentTestFixture<List>(html`
		<mo-list>
			<mo-list-item>Item 1</mo-list-item>
			<ul>
				<li>Item 2</li>
				<li>Item 3</li>
			</ul>
			<div>Not an item</div>
		</mo-list>
	`)

	it('should have the list role, which the list-item extensions key off', () => {
		expect(fixture.component.role).toBe('list')
		expect(fixture.component[list]).toBe(fixture.component)
	})

	describe('items', () => {
		it('should collect the slotted list items, flattening nested lists and slots', () => {
			expect(fixture.component.items.map(item => item.tagName)).toEqual(['MO-LIST-ITEM', 'LI', 'LI'])
		})

		it('should leave out slotted elements that are not list items', () => {
			const notAnItem = fixture.component.querySelector('div')!

			expect(fixture.component.items).not.toContain(notAnItem)
		})

		it('should dispatch itemsChange when the slotted items change', async () => {
			let items: Array<HTMLElement> | undefined
			fixture.component.addEventListener('itemsChange', event => items = (event as CustomEvent<Array<HTMLElement>>).detail)

			fixture.component.insertAdjacentHTML('beforeend', '<mo-list-item>Item 4</mo-list-item>')
			const item = fixture.component.lastElementChild as HTMLElement
			for (let attempt = 0; attempt < 100 && items === undefined; ++attempt) {
				await new Promise(resolve => setTimeout(resolve))
			}

			expect(items?.map(i => i.tagName)).toEqual(['MO-LIST-ITEM', 'LI', 'LI', 'MO-LIST-ITEM'])
			expect(items).toContain(item)
		})
	})
})