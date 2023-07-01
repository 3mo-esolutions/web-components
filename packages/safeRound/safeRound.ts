export function safeRound(number: number, decimals = 0) {
	const absNumber = Math.abs(number)
	// Math.round has no support for decimals, so we round value x 10^n and then divide by 10^n
	const factor = Math.pow(10, Math.round(decimals))
	// Float calculations may lead to a mathematical half being represented as a number slightly below .5 which would
	// then be rounded towards zero. Rounding to a precision slightly below the 64-bit-float precision of 15 digits
	// with Number.toPrecision(14) before calling Math.round() should fix this.
	const absResult = Math.round(Number((absNumber * factor).toPrecision(14))) / factor
	// Math.round() rounds negative .5 towards zero (and positive .5 away from zero as expected), so we always round
	// the absolute number and re-apply the sign later.
	return absResult * (absResult > 0 && number < 0 ? -1 : 1)
}