/* eslint-disable */

export class Arguments {
	static #arguments = process.argv.slice(2)

	static get(index) {
		return Arguments.#arguments.at(index)
	}

	static tryGet(index, errorMessage = `No argument at index ${index}`) {
		const value = Arguments.get(index)
		if (value === undefined) {
			throw new Error(errorMessage)
		}
		return value
	}
}