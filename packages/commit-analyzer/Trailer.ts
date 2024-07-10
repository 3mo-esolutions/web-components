export class Trailer {
	static readonly keys: Array<string> = ['authored-by', 'co-authored-by', 'signed-off-by', 'reviewed-by']
	private static readonly regex = /(?<key>.+):\s(?<value>.+)/

	static parse(message: string) {
		const match = message.match(Trailer.regex)

		if (!match) {
			return undefined
		}

		const { key, value } = match.groups ?? {}

		if (!key || !Trailer.keys.includes(key.toLowerCase())) {
			return undefined
		}

		return new Trailer({ key, value })
	}

	readonly key?: string
	readonly value?: string

	constructor(init: Omit<Partial<Trailer>, 'valueOf'>) {
		Object.assign(this, init)
	}
}