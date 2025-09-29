import { Change } from './Change.ts'
import { Trailer } from './Trailer.ts'

export class Commit {
	static readonly regex = /commit (?<hash>\w+)(?:\s\((?<branch>.+)\))?[\s\S]+?Author: (?<authorName>.+?) <(?<authorEmail>.+?)>[\s\S]+?Date:\s*(?<date>.+?)\n\n\s*(?<body>[\s\S]+)/
	static readonly changeSetsSplitRegex = /(?=\n(?=\w+(?:\(\w+\))?(!?):\s))/

	/**
	 * Parses the commit message output from format
	 * `git log into a Commit object
	 */
	static parse(message: string) {
		message = message.split('\n').map(line => line.trim()).join('\n')
		const { hash, authorName, authorEmail, date, body } = message.match(Commit.regex)?.groups ?? {}

		const trailers = new Array<Trailer>()
		const bodyWithoutTrailers = body?.split('\n').reverse().reduce((acc, line) => {
			const trailer = Trailer.parse(line)
			if (trailer) {
				trailers.unshift(trailer)
				return acc.replace(line, '')
			} else {
				return acc
			}
		}, body)

		const changes = bodyWithoutTrailers?.split(Commit.changeSetsSplitRegex) ?? []

		return new Commit({
			hash,
			date: date ? new Date(date) : undefined,
			author: authorName && authorEmail ? { name: authorName, email: authorEmail } : undefined,
			changes: changes.filter(Boolean).map(Change.parse),
			trailers,
		})
	}

	constructor(init: Omit<Partial<Commit>, 'valueOf'>) {
		Object.assign(this, init)
	}

	readonly hash!: string
	readonly date?: Date
	readonly author?: {
		readonly name: string
		readonly email: string
	}
	readonly changes = new Array<Change>()
	readonly trailers = new Array<Trailer>()

	valueOf() {
		return this.hash
	}
}