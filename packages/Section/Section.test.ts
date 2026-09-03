import { html } from '@a11d/lit'
import { ComponentTestFixture } from '@a11d/lit-testing'
import { type Section } from './Section.js'
import './index.js'

describe('Section', () => {
	const slotOf = (component: Section, name: string) => component.renderRoot.querySelector<HTMLSlotElement>(`slot[name=${name}]`)!

	describe('Heading', () => {
		const fixture = new ComponentTestFixture<Section>(html`
			<mo-section heading='My Section'>
				<div>Content</div>
			</mo-section>
		`)

		const slottedHeadingFixture = new ComponentTestFixture<Section>(html`
			<mo-section heading='My Section'>
				<span slot='heading'>Custom heading</span>
				<div>Content</div>
			</mo-section>
		`)

		it('should render the "heading" property into a mo-heading exposing the "heading" part', () => {
			const heading = fixture.component.renderRoot.querySelector('mo-heading[part=heading]')!

			expect(heading.textContent?.trim()).toBe('My Section')
		})

		it('should give the "heading" slot precedence over the default heading', () => {
			const slot = slotOf(slottedHeadingFixture.component, 'heading')
			const defaultHeading = slottedHeadingFixture.component.renderRoot.querySelector('mo-heading[part=heading]')!

			expect(slot.assignedElements({ flatten: true })).toEqual([slottedHeadingFixture.component.querySelector('[slot=heading]')!])
			expect(defaultHeading.getClientRects().length).toBe(0)
		})
	})

	describe('Header', () => {
		const slottedHeaderFixture = new ComponentTestFixture<Section>(html`
			<mo-section heading='My Section'>
				<div slot='header'>Custom header</div>
				<div>Content</div>
			</mo-section>
		`)

		const actionFixture = new ComponentTestFixture<Section>(html`
			<mo-section heading='My Section'>
				<button slot='action'>Action</button>
				<div>Content</div>
			</mo-section>
		`)

		it('should replace the whole default header when content is slotted into "header"', () => {
			const slot = slotOf(slottedHeaderFixture.component, 'header')
			const defaultHeader = slottedHeaderFixture.component.renderRoot.querySelector('div[part=header]')!

			expect(slot.assignedElements({ flatten: true })).toEqual([slottedHeaderFixture.component.querySelector('[slot=header]')!])
			expect(defaultHeader.getClientRects().length).toBe(0)
			expect(slottedHeaderFixture.component.querySelector('[slot=header]')!.getClientRects().length).toBeGreaterThan(0)
		})

		it('should render "action" content in the header alongside the heading', () => {
			const header = actionFixture.component.renderRoot.querySelector<HTMLElement>('div[part=header]')!
			const action = actionFixture.component.querySelector('[slot=action]')!
			const heading = actionFixture.component.renderRoot.querySelector('mo-heading[part=heading]')!

			expect(slotOf(actionFixture.component, 'action').parentElement).toBe(header)
			expect(action.getBoundingClientRect().top).toBeGreaterThanOrEqual(header.getBoundingClientRect().top)
			expect(action.getBoundingClientRect().bottom).toBeLessThanOrEqual(header.getBoundingClientRect().bottom)
			expect(action.getBoundingClientRect().left).toBeGreaterThanOrEqual(heading.getBoundingClientRect().right - 1)
		})
	})

	describe('Content', () => {
		const fixture = new ComponentTestFixture<Section>('mo-section')

		it('should not render the content grid while nothing is slotted', () => {
			expect(fixture.component.renderRoot.querySelector('mo-grid')).toBeNull()
		})

		it('should render slotted content inside the grid once it is assigned', async () => {
			const content = document.createElement('div')
			content.textContent = 'Content'

			fixture.component.appendChild(content)
			await fixture.update()

			const grid = fixture.component.renderRoot.querySelector('mo-grid')!
			expect(grid).not.toBeNull()
			expect(content.assignedSlot).toBe(grid.querySelector('slot'))
		})
	})
})