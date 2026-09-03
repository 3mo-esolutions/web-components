import './index.js'

describe('safeRound', () => {
	it('should catch rounding exceptions and return correct numbers - example 1', () => {
		const justUnder50point5 = 0.5 + 1 / (0.1 * 0.2) // JS: 50.49999999999999 - Actual: 50.5

		expect(Math.round(justUnder50point5)).toBe(50)
		expect(Math.safeRound(justUnder50point5)).toBe(51)
	})

	it('should catch rounding exceptions and return correct numbers - example 2', () => {
		const count = 100
		const price = 17.955
		const total = price * count // JS: 1795.4999999999998 - Actual: 1795.5

		expect(Math.round(total)).toBe(1795)
		expect(Math.safeRound(total)).toBe(1796)
	})

	it('should round halves away from zero for negative numbers', () => {
		expect(Math.round(-0.5)).toBe(-0)
		expect(Math.safeRound(-0.5)).toBe(-1)

		const total = 17.955 * 100 * -1 // JS: -1795.4999999999998 - Actual: -1795.5

		expect(Math.round(total)).toBe(-1795)
		expect(Math.safeRound(total)).toBe(-1796)
	})

	it('should round to the requested number of decimals', () => {
		expect(Math.safeRound(1.005, 2)).toBe(1.01)
		expect(Math.safeRound(1.0049, 2)).toBe(1)
		expect(Math.safeRound(-1.005, 2)).toBe(-1.01)
		expect(Math.safeRound(1234.5678, 3)).toBe(1234.568)
	})

	it('should never return -0', () => {
		expect(Math.safeRound(-0.2)).toBe(0)
		expect(Object.is(Math.safeRound(-0.2), -0)).toBeFalse()
		expect(Object.is(Math.safeRound(-0.004, 2), -0)).toBeFalse()
	})
})