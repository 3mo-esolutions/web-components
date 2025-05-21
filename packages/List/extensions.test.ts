import { html } from '@a11d/lit'
import { ComponentTestFixture } from '@a11d/lit-testing'
import './extensions.js'
// eslint-disable-next-line no-duplicate-imports
import { list, listItem, listItems } from './extensions.js'

describe('list', () => {
	describe('ul', () => {
		const fixture = new ComponentTestFixture(html`<ul></ul>`)
		it('should return the list itself', () => {
			expect(fixture.component[list]).toBe(fixture.component)
		})
	})
	describe('ol', () => {
		const fixture = new ComponentTestFixture(html`<ol></ol>`)
		it('should return the list itself', () => {
			expect(fixture.component[list]).toBe(fixture.component)
		})
	})

	describe('custom', () => {
		const fixture = new ComponentTestFixture(html`<div role='list'></div>`)

		it('should return true for elements with role "list"', () => {
			expect(fixture.component[list]).toBe(fixture.component)

			fixture.component.removeAttribute('role')

			expect(fixture.component[list]).toBe(undefined)
		})
	})
})

describe('listItem', () => {
	describe('li', () => {
		const fixture = new ComponentTestFixture(html`<li></li>`)

		it('should return the list item itself', () => {
			expect(fixture.component[listItem]).toBe(fixture.component)
		})
	})

	describe('custom', () => {
		const fixture = new ComponentTestFixture(html`<div></div>`)

		it('should return the list item for elements with appropriate role', () => {
			expect(fixture.component[listItem]).toBe(undefined)

			fixture.component.role = 'listitem'
			expect(fixture.component[listItem]).toBe(fixture.component)

			fixture.component.role = 'menuitem'
			expect(fixture.component[listItem]).toBe(fixture.component)

			fixture.component.role = 'menuitemcheckbox'
			expect(fixture.component[listItem]).toBe(fixture.component)

			fixture.component.role = 'menuitemradio'
			expect(fixture.component[listItem]).toBe(fixture.component)

			fixture.component.role = 'option'
			expect(fixture.component[listItem]).toBe(fixture.component)

			fixture.component.removeAttribute('role')
			expect(fixture.component[listItem]).toBe(undefined)
		})
	})
})

describe('listItems', () => {
	describe('non-list', () => {
		const fixture = new ComponentTestFixture(html`<div></div>`)

		it('should return undefined for non-list elements', () => {
			expect(fixture.component[listItems]).toBe(undefined)
		})
	})

	describe('list', () => {
		const fixture = new ComponentTestFixture(html`<ul></ul>`)

		it('should return the list items', () => {
			expect(fixture.component[listItems]).toEqual([])

			const item1 = document.createElement('li')
			const item2 = document.createElement('li')
			fixture.component.append(document.createElement('div'), item1, item2)

			expect(fixture.component[listItems]).toEqual([item1, item2])
		})
	})
})