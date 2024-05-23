import '../index.js'
import { DataGridColumnComponent } from './DataGridColumnComponent.js'

describe('DataGridColumnComponent', () => {
	describe('nonEditable', () => {
		it('should not trigger update when a new passed predicate is equal but not identical', () => {
			const hasChanged = DataGridColumnComponent.getPropertyOptions('nonEditable').hasChanged

			expect(hasChanged?.(false, false)).toBe(false)
			expect(hasChanged?.(true, true)).toBe(false)
			expect(hasChanged?.(() => true, () => true)).toBe(false)

			expect(hasChanged?.(false, true)).toBe(true)
			expect(hasChanged?.(true, false)).toBe(true)
			expect(hasChanged?.(() => false, () => true)).toBe(true)
		})
	})
})