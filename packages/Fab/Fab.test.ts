import { html } from '@a11d/lit'
import { ComponentTestFixture } from '@a11d/lit-testing'
import { type Icon } from '@3mo/icon'
import { type Fab } from './Fab.js'
import './index.js'

type MdFab = HTMLElement & { label: string, size: string, updateComplete: Promise<unknown> }

const mdFabOf = (fab: Fab) => fab.renderRoot.querySelector<MdFab>('md-fab')!

const settle = () => new Promise(resolve => setTimeout(resolve, 50))

describe('Fab', () => {
	describe('label', () => {
		const fixture = new ComponentTestFixture<Fab>(html`<mo-fab icon='add'>Create</mo-fab>`)

		it('should derive its label from its text content and tunnel it to the md-fab', () => {
			expect(mdFabOf(fixture.component).label).toBe('Create')
		})

		it('should update the label when the text content changes later', async () => {
			fixture.component.textContent = 'Renamed'
			await settle()

			expect(mdFabOf(fixture.component).label).toBe('Renamed')
		})

		const emptyFixture = new ComponentTestFixture<Fab>(html`<mo-fab icon='add'></mo-fab>`)

		it('should tunnel no label when the text content is empty', () => {
			expect(mdFabOf(emptyFixture.component).hasAttribute('label')).toBe(false)
			expect(mdFabOf(emptyFixture.component).label).toBe('')
		})
	})

	describe('icon', () => {
		const fixture = new ComponentTestFixture<Fab>(html`<mo-fab icon='add'>Create</mo-fab>`)

		it('should render a mo-icon fallback for "icon" in the icon slot', () => {
			const icon = fixture.component.renderRoot.querySelector<Icon>('slot[name=icon] > mo-icon')
			expect(icon?.icon).toBe('add')
		})

		const slottedFixture = new ComponentTestFixture<Fab>(html`
			<mo-fab icon='add'>
				<mo-icon slot='icon' id='slotted-icon' icon='home'></mo-icon>
				Create
			</mo-fab>
		`)

		it('should let slotted "icon" content take precedence over the fallback', () => {
			const slot = slottedFixture.component.renderRoot.querySelector<HTMLSlotElement>('slot[name=icon]')!
			expect(slot.assignedElements().map(element => element.id)).toEqual(['slotted-icon'])
		})
	})

	describe('dense', () => {
		const fixture = new ComponentTestFixture<Fab>(html`<mo-fab icon='add'>Create</mo-fab>`)

		it('should tunnel "dense" as md-fab size "small" and default to "medium"', async () => {
			expect(mdFabOf(fixture.component).size).toBe('medium')

			fixture.component.dense = true
			await fixture.update()

			expect(mdFabOf(fixture.component).size).toBe('small')
		})
	})

	describe('iconAtEnd', () => {
		const fixture = new ComponentTestFixture<Fab>(html`<mo-fab icon='add'>Create</mo-fab>`)

		// BUG: iconAtEnd does not reflect to attribute
		xit('should place the icon after the label when "iconAtEnd" is set', async () => {
			const mdFab = mdFabOf(fixture.component)
			await mdFab.updateComplete
			const button = mdFab.shadowRoot!.querySelector('button')!
			expect(getComputedStyle(button).flexDirection).toBe('row')

			fixture.component.iconAtEnd = true
			await fixture.update()

			expect(getComputedStyle(button).flexDirection).toBe('row-reverse')
		})
	})

	describe('css parts', () => {
		const fixture = new ComponentTestFixture<Fab>(html`<mo-fab icon='add'>Create</mo-fab>`)

		const selectorByPart = new Map([
			['button', 'button'],
			['ripple', 'md-ripple'],
			['focus-ring', 'md-focus-ring'],
		])

		for (const [part, selector] of selectorByPart) {
			it(`should export the css part "${part}" through the md-fab`, async () => {
				const mdFab = mdFabOf(fixture.component)
				await mdFab.updateComplete

				expect(mdFab.getAttribute('exportparts')?.split(',')).toContain(part)
				expect(mdFab.shadowRoot!.querySelector(selector)?.getAttribute('part')?.split(' ')).toContain(part)
			})
		}
	})
})