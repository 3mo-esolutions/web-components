import { Commit, type Change, type ChangeType } from '@3mo/commit-analyzer'
import { run, Package } from './util/index.ts'
import FileSystem from 'fs'
import Path from 'path'

class Release {
	static readonly typeInfo = new Map<ChangeType, { readonly emoji: string, readonly name: string }>([
		['feat', { emoji: '🚀', name: 'Feature' }],
		['fix', { emoji: '🐛', name: 'Fix' }],
		['chore', { emoji: '🧹', name: 'Chore' }],
		['refactor', { emoji: '🛠️', name: 'Refactoring' }],
		['test', { emoji: '🧪', name: 'Test' }],
		['docs', { emoji: '📝', name: 'Documentation' }],
		['perf', { emoji: '⚡️', name: 'Performance Improvement' }],
	])

	private static getChangeString(_package: Package, commit: Commit, change: Change) {
		const info = !change.type ? undefined : Release.typeInfo.get(change.type)
		const typeName = info?.name ?? ''
		const typeEmoji = info?.emoji ?? ''
		return `- **${typeEmoji}${change.isBreaking ? '⚠️ Breaking ' : ' '}${typeName}**: ${change.heading} ([${commit.hash.slice(0, 7)}](${_package.repositoryUrl}/commit/${commit.hash}))`
	}

	readonly package!: Package
	readonly version!: string
	readonly oldVersion!: string
	readonly date!: Date
	readonly commits = new Array<Commit>()

	get dateString() { return this.date.toISOString().split('T')[0]! }

	constructor(init: Partial<Release>) { Object.assign(this, init) }

	toString(forGlobalChangelog = false) {
		const changes = this.commits
			.map(c => [c, c.changes.filter(cs => cs.scope === this.package.directoryName)] as const)
			.filter(([, changes]) => changes.length)
			.map(([commit, changes]) => changes.map(change => Release.getChangeString(this.package, commit, change)).join('\n'))
			.flat()
			.map(s => s.trim())
			.filter(s => !!s.length)
		return !changes.length ? '' : (
			!forGlobalChangelog
				? `## ${this.version} (${this.dateString})\n${changes.join('\n')}`
				: `### \`${this.package.packageJson.name}\` ${this.version}\n${changes.join('\n')}`
		)
	}
}

export class ChangeLog {
	static readonly versionRegex = /"version": \[-"(?<oldVersion>.+)",-]{\+"(?<version>.+)",\+}/
	/** The version a package was created with, from the commit that added its `package.json`. */
	static readonly initialVersionRegex = /^new file mode [\s\S]*?\{\+\s*"version": "(?<version>[^"]+)",\+\}/m
	static readonly commitRegex = /^(?=commit [0-9a-f]{40})/m
	static readonly diffRegex = /^(?=diff --git )/m

	static async generate() {
		const history = await this.history()
		const releases = Package.all.flatMap(p => this.generateForPackage(p, history.get(p.relativePath) ?? []))
		const groupBy = (Object as any).groupBy as <K extends PropertyKey, T>(items: Iterable<T>, keySelector: (item: T, index: number) => K) => Partial<Record<K, T[]>>
		const releaseNotes = Object.entries(groupBy(releases, release => release.dateString))
			.sort(([a], [b]) => new Date(b).valueOf() - new Date(a).valueOf())
			.filter(([, releases]) => releases?.length)
			.map(([dateString, releases]) => [dateString, releases?.map(r => r.toString(true)).filter(s => !!s.trim().length)] as const)
			.filter(([, releases]) => releases?.length)
			.map(([dateString, releases]) => `# ${dateString}\n\n${releases?.join('\n\n')}`) as Array<string>

		FileSystem.writeFileSync(Path.resolve('CHANGELOG.md'), releaseNotes.join('\n\n'))
	}

	/** The commits that changed each package's `package.json`, newest first, each as `git show` prints it for that file. */
	private static async history() {
		// A clone without an "origin/main" still gets the changelog of its own history rather than failing `npm start`:
		const branch = (await run('git rev-parse --verify --quiet origin/main', { captureOutput: true, reject: true })).trim() ? 'origin/main' : 'HEAD'
		const log = await run(`git log --first-parent --no-renames --patch --unified=0 --word-diff=plain ${branch} -- "packages/*/package.json"`, { captureOutput: true })
		const history = new Map<string, Array<{ readonly message: string, readonly output: string }>>()
		for (const entry of log.split(ChangeLog.commitRegex)) {
			const [message = '', ...diffs] = entry.split(ChangeLog.diffRegex)
			for (const diff of diffs) {
				const directory = diff.match(/^diff --git a\/(.+)\/package\.json b\//)?.[1]
				if (directory) {
					const commits = history.get(directory) ?? []
					commits.push({ message, output: message + diff })
					history.set(directory, commits)
				}
			}
		}
		return history
	}

	private static generateForPackage(p: Package, commits: ReadonlyArray<{ readonly message: string, readonly output: string }>) {
		const releases = new Array<Release>()
		let lastRelease: Release | undefined
		for (const [index, { message, output }] of commits.entries()) {
			const commit = Commit.parse(message)
			if (!output.includes('version')) {
				continue
			}
			// eslint-disable-next-line prefer-const
			let { version, oldVersion } = output.match(ChangeLog.versionRegex)?.groups ?? {}
			if (index === commits.length - 1) {
				version ||= releases.filter(l => !!l.oldVersion).at(-1)?.oldVersion || output.match(ChangeLog.initialVersionRegex)?.groups?.version || version
			}
			const release = !version ? lastRelease : (lastRelease = new Release({ package: p, version, oldVersion, date: !commit.date ? undefined : new Date(commit.date) }))
			release?.commits.push(commit)
			if (release && !releases.includes(release)) {
				releases.push(release)
			}
		}

		const changelog = releases
			.map(release => release.toString())
			.filter(s => !!s.trim().length)
			.join('\n\n')
		FileSystem.writeFileSync(Path.resolve(p.path, 'CHANGELOG.md'), changelog)

		return releases
	}
}

ChangeLog.generate()