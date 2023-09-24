export const expectDateTimesEquals = (actual: DateTime | undefined, expected: DateTime | undefined) => {
	const actualRounded = actual?.round('minutes')
	const expectedRounded = expected?.round('minutes')
	expect(actualRounded).withContext(`actual: ${actual} and expected: ${expected} are not equal`).toEqual(expectedRounded)
}