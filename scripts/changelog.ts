import { run, Package } from './util/index.ts'
import FileSystem from 'fs'
import Path from 'path'

class Release {
	readonly package!: Package
	readonly version!: string
	readonly oldVersion!: string
	readonly date!: Date
	readonly commits = new Array<Commit>()

	get dateString() { return this.date.toISOString().split('T')[0] }

	constructor(init: Partial<Release>) { Object.assign(this, init) }

	sortCommits() {
		this.commits.sort((a, b) => a.valueOf() - b.valueOf())
	}

	toString(forGlobalChangelog = false) {
		return !forGlobalChangelog
			? `## ${this.version} (${this.dateString})\n${this.commits.join('\n')}`
			: `### \`${this.package.packageJson.name}\` ${this.version}\n${this.commits.join('\n')}`
	}
}

class Commit {
	static regex = /(?<body>.+)?\((?<hash>\w+)\)\s?\((?<date>.+)\)/s

	static fromMessage(message: string, pkg: Package) {
		const match = message.match(Commit.regex)?.groups
		if (!match) {
			throw new Error(`Invalid commit message: ${message}`)
		}
		const { body, hash, date } = match
		return new Commit({
			hash,
			date: new Date(date),
			package: pkg,
			changeSets: body?.split('\n').map(s => s.trim()).filter(Boolean).map(cs => ChangeSet.fromMessage(cs))
		})
	}

	constructor(init: Omit<Partial<Commit>, 'valueOf'>) {
		Object.assign(this, init)
		this.changeSets.forEach(cs => cs.commit = this)
	}

	valueOf() {
		return this.changeSets.map(cs => cs.valueOf()).reduce((a, b) => a + b, 0)
	}

	readonly package!: Package
	readonly hash!: string
	readonly date!: Date
	readonly changeSets = new Array<ChangeSet>()

	toString() {
		return [...new Set(this.changeSets.map(cs => cs.toString())).values()].join('\n')
	}
}

class ChangeSet {
	static regex = /(?<type>\w+)(\((?<scope>\w+)\))?(?<breakingChangeMarker>!?): (?<message>.+)/

	static fromMessage(message: string) {
		const match = message.match(ChangeSet.regex)?.groups
		if (!match) {
			return new ChangeSet({ message })
		}
		const { type, scope, breakingChangeMarker, message: _message } = match
		return new ChangeSet({ type, scope, message: _message, breakingChange: !!breakingChangeMarker })
	}

	static order = ['feat', 'fix', 'chore', 'refactor', 'test', 'docs', 'perf']
	static typeInfo = new Map([
		['feat', { emoji: '🚀', name: 'Feature' }],
		['fix', { emoji: '🐛', name: 'Fix' }],
		['chore', { emoji: '🧹', name: 'Chore' }],
		['refactor', { emoji: '🛠️', name: 'Refactoring' }],
		['test', { emoji: '🧪', name: 'Test' }],
		['docs', { emoji: '📝', name: 'Documentation' }],
		['perf', { emoji: '⚡️', name: 'Performance Improvement' }],
	])

	constructor(init: Omit<Partial<ChangeSet>, 'valueOf'>) {
		Object.assign(this, init)
		this.type ||= 'chore'
		this.message = this.message?.charAt(0).toUpperCase() + this.message?.slice(1)
	}
	get typeName() { return ChangeSet.typeInfo.get(this.type)?.name ?? 'Chore' }
	get emoji() { return ChangeSet.typeInfo.get(this.type)?.emoji ?? '🧹' }

	readonly type!: string
	readonly scope!: string
	readonly message!: string
	readonly breakingChange!: boolean
	commit!: Commit

	valueOf() {
		return ChangeSet.order.indexOf(this.type)
	}

	toString() {
		return `- **${this.emoji}${this.breakingChange ? '⚠️ Breaking ' : ' '}${this.typeName}**: ${this.message} ([${this.commit.hash.slice(0, 7)}](${this.commit.package.packageJson.repository.url}/commit/${this.commit.hash}))`
	}
}

export class ChangeLog {
	static readonly versionRegex = /"version": \[-"(?<oldVersion>.+)",-]{\+"(?<version>.+)",\+}/

	static async generate() {
		const releases = (await Promise.all(Package.all.map(p => this.generateForPackage(p)))).flat()
		const groupBy = (Object as any).groupBy as <K extends PropertyKey, T>(items: Iterable<T>, keySelector: (item: T, index: number) => K) => Partial<Record<K, T[]>>
		const releaseNotes = Object.entries(groupBy(releases, (release: Release) => release.dateString))
			.sort(([a], [b]) => new Date(b).valueOf() - new Date(a).valueOf())
			.map(([dateString, releases]) => `# ${dateString}\n\n${releases?.map(r => r.toString(true)).join('\n\n')}`) as Array<string>

		FileSystem.writeFileSync(Path.resolve('CHANGELOG.md'), releaseNotes.join('\n\n'))
	}

	static async generateForPackage(p: Package) {
		const commits = (await run('git log --first-parent origin/main --pretty=format:"%B (%H) (%ad);;;" --date=format:"%Y-%m-%d" ./package.json', p.relativePath)).split(';;;')

		const releases = new Array<Release>()
		let lastRelease: Release | undefined
		for (const [index, commit] of commits.entries()) {
			const { hash, date } = commit.match(Commit.regex)?.groups ?? {}
			if (!hash || !date) {
				continue
			}
			const output = await run(`git show --unified=0 --word-diff=plain ${hash} package.json`, p.relativePath)
			if (!output || !output.includes('version')) {
				continue
			}
			// eslint-disable-next-line prefer-const
			let { version, oldVersion } = output.match(ChangeLog.versionRegex)?.groups ?? {}
			if (index === commits.length - 1) {
				version ||= releases.filter(l => !!l.oldVersion).at(-1)?.oldVersion || version
			}
			const release = !version ? lastRelease : (lastRelease = new Release({ package: p, version, oldVersion, date: new Date(date) }))
			release?.commits.push(Commit.fromMessage(commit, p))
			if (release && !releases.includes(release)) {
				releases.push(release)
			}
		}

		for (const release of releases) {
			release.sortCommits()
		}

		const changelog = releases.map(release => release.toString()).join('\n\n')
		FileSystem.writeFileSync(Path.resolve(p.path, 'CHANGELOG.md'), changelog)

		// If we want to have changelogs directly in the repository in the future, we should get rid of this:
		p.packageJson.changelog = changelog
		FileSystem.writeFileSync(Path.resolve(p.path, 'package.json'), JSON.stringify(p.packageJson, null, '\t'))

		return releases
	}
}

ChangeLog.generate()