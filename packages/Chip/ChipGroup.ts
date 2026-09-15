import { component, css, property } from '@a11d/lit'
import { SelectionGroup } from '@3mo/selection-group'
import { Chip } from './Chip.js'

export { Selectability as ChipGroupSelectability } from '@3mo/selectability'
export { type SelectionGroupValue as ChipGroupValue } from '@3mo/selection-group'

/**
 * A set of chips sharing one selection and one tab stop — Material's chip set. It is a
 * `mo-selection-group` whose items are chips: the selection, the pattern, the cursor and the value are
 * all the group's, and what is added here is what a chip set has and a set of answers does not.
 *
 * Give it an accessible name with `aria-label` or `aria-labelledby` — a group of filters nothing
 * announces is a bug.
 *
 * @element mo-chip-group
 *
 * @ssr true
 *
 * @attr value - The selected chips' values: the value itself in single selectability, an array of them in multiple.
 * @attr selectability - `single`, `multiple`, or omitted for a row of action chips.
 * @attr deselectable - Re-activating the selected chip clears it. Also makes a single set a toggle group rather than a radio group.
 * @attr nowrap - Keeps the chips on one line, for a set that scrolls instead of wrapping.
 *
 * @slot - The chips.
 *
 * @fires change - Dispatched with the new value when the selection changes.
 */
@component('mo-chip-group')
export class ChipGroup extends SelectionGroup {
	@property({ type: Boolean, reflect: true }) nowrap = false

	/** Only chips, so that a chip wrapped in something of the consumer's own — a popover container — is
	 * that consumer's business rather than an item of the set. */
	get chips() { return [...this.children].filter((child): child is Chip => child instanceof Chip) }

	override get items(): ReadonlyArray<Chip> { return this.chips }

	static override get styles() {
		return css`
			${super.styles}

			:host([nowrap]) {
				flex-wrap: nowrap;
			}
		`
	}
}

declare global {
	interface HTMLElementTagNameMap {
		'mo-chip-group': ChipGroup
	}
}