describe('String.toNumber()', () => {
	it('should return undefined when empty', () => {
		expect(''.toNumber()).toBeUndefined()
	})

	it('should return undefined when not a number', () => {
		expect('abc'.toNumber()).toBeUndefined()
	})

	it('should parse numbers that include separators', () => {
		expect('12.345,67'.toNumber(LanguageCode.German)).toBe(12345.67)
		expect('12,345.67'.toNumber(LanguageCode.English)).toBe(12345.67)
	})
})