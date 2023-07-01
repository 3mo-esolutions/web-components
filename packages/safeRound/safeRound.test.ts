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
})