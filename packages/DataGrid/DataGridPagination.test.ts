import { equals } from '@a11d/equals'
import { DataGridPagination } from './DataGridPagination.js'

describe('DataGridPagination', () => {
	describe('parsing', () => {
		it('should parse both slots', () => {
			const pagination = DataGridPagination.from('scroll 100')

			expect(pagination?.strategy).toBe('scroll')
			expect(pagination?.size).toBe(100)
		})

		it('should parse the slots in either order, as their tokens are disjoint', () => {
			expect(DataGridPagination.from('100 pages')?.[equals](DataGridPagination.from('pages 100'))).toBeTrue()
		})

		it('should parse a strategy alone', () => {
			const pagination = DataGridPagination.from('pages')

			expect(pagination?.strategy).toBe('pages')
			expect(pagination?.size).toBeUndefined()
		})

		it('should parse a size alone', () => {
			const pagination = DataGridPagination.from('100')

			expect(pagination?.strategy).toBeUndefined()
			expect(pagination?.size).toBe(100)
		})

		it('should tolerate surrounding and repeated whitespace', () => {
			expect(DataGridPagination.from('  pages   100 ')?.toString()).toBe('pages 100')
		})
	})

	describe('normalization', () => {
		it('should treat a value specifying neither slot as no value at all', () => {
			expect(DataGridPagination.from(undefined)).toBeUndefined()
			expect(DataGridPagination.from('auto')).toBeUndefined()
			expect(DataGridPagination.from('auto auto')).toBeUndefined()
			expect(DataGridPagination.from({})).toBeUndefined()
		})

		it('should collapse an auto slot into an absent one', () => {
			expect(DataGridPagination.from('scroll auto')?.toString()).toBe('scroll')
			expect(DataGridPagination.from({ strategy: 'pages', size: 'auto' })?.toString()).toBe('pages')
		})

		it('should accept a bare number', () => {
			expect(DataGridPagination.from(25)?.size).toBe(25)
		})

		it('should accept a partial object', () => {
			expect(DataGridPagination.from({ strategy: 'scroll' })?.toString()).toBe('scroll')
		})

		it('should pass an instance through', () => {
			const pagination = DataGridPagination.from('pages 50')!

			expect(DataGridPagination.from(pagination)).toBe(pagination)
		})
	})

	describe('formatting', () => {
		it('should write the strategy first regardless of the parsed order', () => {
			expect(DataGridPagination.from('100 scroll')?.toString()).toBe('scroll 100')
		})

		it('should write only the specified slots', () => {
			expect(DataGridPagination.from('pages')?.toString()).toBe('pages')
			expect(DataGridPagination.from(100)?.toString()).toBe('100')
		})

		it('should round-trip through its own string representation', () => {
			for (const text of ['scroll', 'pages', '100', 'scroll 100', 'pages 25']) {
				expect(DataGridPagination.from(text)?.toString()).toBe(text)
			}
		})

		it('should serialize as its string representation', () => {
			expect(JSON.parse(JSON.stringify({ pagination: DataGridPagination.from('pages 100') })))
				.toEqual({ pagination: 'pages 100' })
		})
	})

	describe('invalid input', () => {
		it('should ignore an unknown token with a warning', () => {
			const warn = spyOn(console, 'warn')

			expect(DataGridPagination.from('scrol 100')?.toString()).toBe('100')
			expect(warn).toHaveBeenCalled()
		})

		it('should keep the first of two tokens of the same slot with a warning', () => {
			const warn = spyOn(console, 'warn')

			expect(DataGridPagination.from('pages scroll')?.toString()).toBe('pages')
			expect(DataGridPagination.from('10 20')?.toString()).toBe('10')
			expect(warn).toHaveBeenCalledTimes(2)
		})

		it('should never throw, as it parses attribute values', () => {
			spyOn(console, 'warn')

			expect(() => DataGridPagination.from('')).not.toThrow()
			expect(() => DataGridPagination.from('   ')).not.toThrow()
			expect(() => DataGridPagination.from('nonsense')).not.toThrow()
			expect(DataGridPagination.from('nonsense')).toBeUndefined()
		})
	})

	describe('with()', () => {
		it('should replace a slot without touching the other one', () => {
			expect(DataGridPagination.from('pages 25')?.with({ size: 50 })?.toString()).toBe('pages 50')
		})

		it('should not materialize the unspecified slot of a partial pagination', () => {
			expect(DataGridPagination.from(25)?.with({ size: 50 })?.toString()).toBe('50')
		})

		it('should clear a slot when given auto or undefined', () => {
			expect(DataGridPagination.from('pages 25')?.with({ size: 'auto' })?.toString()).toBe('pages')
			expect(DataGridPagination.from('pages 25')?.with({ strategy: undefined })?.toString()).toBe('25')
		})

		it('should yield no pagination when the last slot is cleared', () => {
			expect(DataGridPagination.from('pages')?.with({ strategy: undefined })).toBeUndefined()
		})

		it('should not mutate the pagination it is called on', () => {
			const pagination = DataGridPagination.from('pages 25')!

			pagination.with({ size: 50 })

			expect(pagination.toString()).toBe('pages 25')
		})

		it('should be frozen', () => {
			expect(Object.isFrozen(DataGridPagination.from('pages 25'))).toBeTrue()
		})
	})

	describe('equality', () => {
		it('should compare by slots', () => {
			expect(DataGridPagination.from('pages 25')?.[equals](DataGridPagination.from('pages 25'))).toBeTrue()
			expect(DataGridPagination.from('pages 25')?.[equals](DataGridPagination.from('pages 50'))).toBeFalse()
			expect(DataGridPagination.from('pages 25')?.[equals](DataGridPagination.from('scroll 25'))).toBeFalse()
			expect(DataGridPagination.from('pages')?.[equals](DataGridPagination.from('pages 25'))).toBeFalse()
		})

		it('should not equal a foreign value', () => {
			expect(DataGridPagination.from('pages 25')?.[equals]('pages 25')).toBeFalse()
			expect(DataGridPagination.from('pages 25')?.[equals](undefined)).toBeFalse()
		})

		it('should be used by Object[equals]', () => {
			expect(Object[equals](DataGridPagination.from('pages 25'), DataGridPagination.from('pages 25'))).toBeTrue()
			expect(Object[equals](DataGridPagination.from('pages 25'), DataGridPagination.from('scroll'))).toBeFalse()
		})
	})
})