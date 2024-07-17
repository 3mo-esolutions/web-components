export type ChangeType = 'feat' | 'fix' | 'chore' | 'docs' | 'style' | 'refactor' | 'perf' | 'test' | 'build' | 'ci' | 'revert' | 'release'

/**
 * Represents a change included in a commit.
 */
export class Change {
	private static readonly order: Array<ChangeType> = ['feat', 'fix', 'chore', 'refactor', 'test', 'docs', 'perf', 'style', 'build', 'ci', 'revert', 'release']

	private static readonly conventionalFormatRegex = /(?<type>\w+)(\((?<scope>\w+)\))?(?<isBreakingMarker>!?):\s(?<heading>.+)(\n+(?<description>(.|\n)+))?/
	private static readonly referenceRegex = /(?:#(?<github>\d+)|(?<jira>[A-Z]+-\d+))/g

	/** Parses the change from a commit message */
	static parse(message: string) {
		// replace all references with empty strings:
		message = message.trim()
		const references = [...message.matchAll(Change.referenceRegex)].map(match => match[0])
		const conventional = message.match(Change.conventionalFormatRegex)?.groups
		if (conventional) {
			const { type, scope, isBreakingMarker, heading, description } = conventional
			return new Change({
				type: type as ChangeType,
				scope,
				heading,
				description: description?.trim(),
				references,
				isBreaking: !!isBreakingMarker
			})
		}
		const [heading, ...description] = message.split('\n').map(line => line.trim())
		return new Change({
			heading,
			description: description.join('\n').trim() || undefined,
			references
		})
	}

	readonly type?: ChangeType
	readonly scope?: string
	readonly heading: string = ''
	readonly description?: string
	readonly isBreaking: boolean = false
	readonly references = new Array<string>()

	constructor(init: Omit<Partial<Change>, 'valueOf'>) {
		Object.assign(this, init)
	}

	valueOf() {
		return this.type ? Change.order.indexOf(this.type) : Change.order.length
	}
}