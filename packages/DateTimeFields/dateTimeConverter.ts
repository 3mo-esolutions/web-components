export const dateTimeConverter = (value: unknown) => {
	if (value instanceof DateTime) {
		return value
	}

	if (value instanceof Date || typeof value === 'string' || typeof value === 'number') {
		const date = new DateTime(value)
		return isNaN(date.getTime()) ? undefined : date
	}

	return undefined
}