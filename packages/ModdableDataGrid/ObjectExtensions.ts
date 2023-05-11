export function objectEquals<T = unknown>(actual: T, expected: T): boolean {
	if (actual === expected) {
		return true
	}

	try {
		actual = JSON.parse(JSON.stringify(actual))
		expected = JSON.parse(JSON.stringify(expected))

		if (actual instanceof Array && expected instanceof Array) {
			const sortedActual = actual.sort()
			const sortedExpected = expected.sort()
			return sortedActual.length === sortedExpected.length
				&& sortedActual.every((value, index) => objectEquals(value, sortedExpected[index]))
		}

		if (actual && typeof actual === 'object' && expected && typeof expected === 'object') {
			const actualKeys = Object.keys(actual).sort() as Array<keyof T>
			const expectedKeys = Object.keys(expected).sort() as Array<keyof T>
			return objectEquals(actualKeys, expectedKeys)
				&& actualKeys.every(key => objectEquals(actual[key], expected[key]))
		}

		return false
	} catch {
		return false
	}
}