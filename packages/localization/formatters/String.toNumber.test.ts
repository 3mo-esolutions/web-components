describe('String.toNumber()', () => {
	it('should return undefined when empty', () => {
		expect(''.toNumber()).toBeUndefined()
	})

	it('should return undefined when not a number', () => {
		expect('abc'.toNumber()).toBeUndefined()
	})

	it('should parse numbers that include separators', () => {
		expect('12.345,67'.toNumber('de')).toBe(12345.67)
		expect('12,345.67'.toNumber('en')).toBe(12345.67)
	})

	it('should not allow -0 and return 0 instead', () => {
		expect(Object.is('-0'.toNumber('en'), 0)).toBeTrue()
		expect(Object.is('-0'.toNumber('de'), 0)).toBeTrue()
	})
})