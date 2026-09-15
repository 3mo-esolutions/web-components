import { html } from '@a11d/lit'
import { ComponentTestFixture } from '@a11d/lit-testing'
import { type ChipGroup } from './ChipGroup.js'
import { type Chip } from './Chip.js'
import './index.js'

describe('ChipGroup', () => {
	const keyDown = (element: Element, key: string) => element.dispatchEvent(new KeyboardEvent('keydown', { key, bubbles: true, composed: true, cancelable: true }))

	// Firefox headless updates `activeElement` but fires no focus events while the document itself is
	// unfocused, so the focusin the cursor tracks has to be delivered by hand.
	const focus = (element: HTMLElement) => {
		element.focus()
		element.dispatchEvent(new FocusEvent('focusin', { bubbles: true, composed: true }))
	}

	describe('single selectability', () => {
		const fixture = new ComponentTestFixture<ChipGroup>(html`
			<mo-chip-group selectability='single' aria-label='View'>
				<mo-chip value='overview'>Overview</mo-chip>
				<mo-chip value='open'>Open orders</mo-chip>
				<mo-chip value='archived'>Archived</mo-chip>
			</mo-chip-group>
		`)

		const chips = () => fixture.component.chips

		it('should expose itself as a radio group, since one chip is always chosen', () => {
			expect(fixture.component.getAttribute('role')).toBe('radiogroup')
		})

		it('should have its chips announce themselves as radios', async () => {
			await fixture.updateComplete

			expect(chips().map(chip => chip.actionElement.getAttribute('role'))).toEqual(['radio', 'radio', 'radio'])
			expect(chips().every(chip => !chip.actionElement.hasAttribute('aria-pressed'))).toBe(true)
		})

		it('should make every chip selectable', async () => {
			await fixture.updateComplete

			expect(chips().every(chip => chip.selectable)).toBe(true)
		})

		it('should select the chip carrying the assigned value', async () => {
			fixture.component.value = 'open'
			await fixture.updateComplete

			expect(chips().map(chip => chip.selected)).toEqual([false, true, false])
		})

		it('should keep the value scalar and replace the selection when another chip is picked', async () => {
			const values = new Array<unknown>()
			fixture.component.addEventListener('change', (e: Event) => values.push((e as CustomEvent).detail))

			chips()[0]!.actionElement.click()
			await fixture.updateComplete
			chips()[2]!.actionElement.click()
			await fixture.updateComplete

			expect(values).toEqual(['overview', 'archived'])
			expect(fixture.component.value).toBe('archived')
			expect(chips().map(chip => chip.selected)).toEqual([false, false, true])
		})

		it('should not clear the selection when the selected chip is picked again', async () => {
			chips()[1]!.actionElement.click()
			await fixture.updateComplete
			chips()[1]!.actionElement.click()
			await fixture.updateComplete

			expect(fixture.component.value).toBe('open')
			expect(chips().map(chip => chip.selected)).toEqual([false, true, false])
		})

		it('should hold exactly one tab stop, on the selected chip', async () => {
			fixture.component.value = 'archived'
			await fixture.updateComplete

			expect(chips().map(chip => chip.tabIndex)).toEqual([-1, -1, 0])
		})

		it('should move focus and the tab stop with the arrow keys, wrapping', async () => {
			await fixture.updateComplete
			focus(chips()[0]!)

			keyDown(chips()[0]!.actionElement, 'ArrowRight')
			expect(document.activeElement).toBe(chips()[1]!)
			expect(chips().map(chip => chip.tabIndex)).toEqual([-1, 0, -1])

			keyDown(chips()[1]!.actionElement, 'ArrowLeft')
			keyDown(chips()[0]!.actionElement, 'ArrowLeft')
			expect(document.activeElement).toBe(chips()[2]!)
		})

		it('should jump to the first and last chip with Home and End', async () => {
			await fixture.updateComplete
			focus(chips()[1]!)

			keyDown(chips()[1]!.actionElement, 'End')
			expect(document.activeElement).toBe(chips()[2]!)

			keyDown(chips()[2]!.actionElement, 'Home')
			expect(document.activeElement).toBe(chips()[0]!)
		})
	})

	describe('single selectability, deselectable', () => {
		const fixture = new ComponentTestFixture<ChipGroup>(html`
			<mo-chip-group selectability='single' deselectable aria-label='Filter'>
				<mo-chip value='open'>Open orders</mo-chip>
				<mo-chip value='paid'>Paid</mo-chip>
			</mo-chip-group>
		`)

		it('should expose itself as a group of toggles, since it can be emptied', () => {
			expect(fixture.component.getAttribute('role')).toBe('group')
		})

		it('should clear the selection when the selected chip is picked again', async () => {
			const chips = fixture.component.chips

			chips[0]!.actionElement.click()
			await fixture.updateComplete
			expect(fixture.component.value).toBe('open')

			chips[0]!.actionElement.click()
			await fixture.updateComplete

			expect(fixture.component.value).toBeUndefined()
			expect(chips.some(chip => chip.selected)).toBe(false)
		})
	})

	describe('multiple selectability', () => {
		const fixture = new ComponentTestFixture<ChipGroup>(html`
			<mo-chip-group selectability='multiple' aria-label='Filters'>
				<mo-chip value='a'>A</mo-chip>
				<mo-chip value='b'>B</mo-chip>
			</mo-chip-group>
		`)

		it('should keep the value an array and add to the selection', async () => {
			const chips = fixture.component.chips

			chips[0]!.actionElement.click()
			await fixture.updateComplete
			chips[1]!.actionElement.click()
			await fixture.updateComplete

			expect(fixture.component.value).toEqual(['a', 'b'])
			expect(chips.map(chip => chip.selected)).toEqual([true, true])
		})

		it('should remove from the selection when a selected chip is picked again', async () => {
			fixture.component.value = ['a', 'b']
			await fixture.updateComplete

			fixture.component.chips[0]!.actionElement.click()
			await fixture.updateComplete

			expect(fixture.component.value).toEqual(['b'])
		})
	})

	describe('without selectability', () => {
		const fixture = new ComponentTestFixture<ChipGroup>(html`
			<mo-chip-group aria-label='Actions'>
				<mo-chip value='a'>A</mo-chip>
				<mo-chip value='b'>B</mo-chip>
			</mo-chip-group>
		`)

		it('should expose itself as a toolbar of commands', () => {
			expect(fixture.component.getAttribute('role')).toBe('toolbar')
		})

		it('should leave the chips as plain actions', async () => {
			await fixture.updateComplete

			expect(fixture.component.chips.every(chip => !chip.selectable)).toBe(true)

			fixture.component.chips[0]!.actionElement.click()
			await fixture.updateComplete

			expect(fixture.component.value).toBeUndefined()
			expect(fixture.component.chips[0]!.selected).toBe(false)
		})

		it('should still hold one tab stop and navigate', async () => {
			await fixture.updateComplete

			expect(fixture.component.chips.map(chip => chip.tabIndex)).toEqual([0, -1])
		})
	})

	describe('disabled chips', () => {
		const fixture = new ComponentTestFixture<ChipGroup>(html`
			<mo-chip-group selectability='single' aria-label='View'>
				<mo-chip value='a'>A</mo-chip>
				<mo-chip value='b' disabled>B</mo-chip>
				<mo-chip value='c'>C</mo-chip>
			</mo-chip-group>
		`)

		it('should skip them when navigating', async () => {
			await fixture.updateComplete
			const chips = fixture.component.chips
			focus(chips[0]!)

			keyDown(chips[0]!.actionElement, 'ArrowRight')

			expect(document.activeElement).toBe(chips[2]!)
		})

		it('should never make them the tab stop', async () => {
			await fixture.updateComplete

			expect(fixture.component.chips[1]!.tabIndex).toBe(-1)
		})
	})

	describe('removal', () => {
		const fixture = new ComponentTestFixture<ChipGroup>(html`
			<mo-chip-group aria-label='Tags'>
				<mo-chip value='a' removable>A</mo-chip>
				<mo-chip value='b' removable>B</mo-chip>
				<mo-chip value='c' removable>C</mo-chip>
			</mo-chip-group>
		`)

		const remove = async (chip: Chip) => {
			focus(chip)
			chip.renderRoot.querySelector<HTMLButtonElement>('#remove')!.click()
			chip.remove()
			await fixture.updateComplete
			await new Promise(resolve => setTimeout(resolve))
		}

		it('should move focus to the chip that took the removed one’s place', async () => {
			await fixture.updateComplete

			await remove(fixture.component.chips[1]!)

			expect(fixture.component.chips.map(chip => chip.value)).toEqual(['a', 'c'])
			expect(document.activeElement).toBe(fixture.component.chips[1]!)
		})

		it('should move focus to the previous chip when the last one is removed', async () => {
			await fixture.updateComplete

			await remove(fixture.component.chips[2]!)

			expect(document.activeElement).toBe(fixture.component.chips[1]!)
		})

		it('should not move focus when the removal was vetoed', async () => {
			await fixture.updateComplete
			const chips = fixture.component.chips
			fixture.component.addEventListener('requestRemove', (e: Event) => e.preventDefault())
			focus(chips[0]!)

			chips[0]!.renderRoot.querySelector<HTMLButtonElement>('#remove')!.click()
			await fixture.updateComplete

			expect(fixture.component.chips.length).toBe(3)
			expect(document.activeElement).toBe(chips[0]!)
		})
	})
})