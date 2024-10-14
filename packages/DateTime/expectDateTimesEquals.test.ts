export const expectDateTimesEquals = (actual: DateTime | undefined, expected: DateTime | undefined) => {
	const actualRounded = actual?.valueOf() ?? 0
	const expectedRounded = expected?.valueOf() ?? 0
	expect(Math.abs(expectedRounded - actualRounded))
		.withContext(`actual [${actual}] and expected [${expected}] are not equal`)
		.toBeLessThan(1000)
}