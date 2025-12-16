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
		return `- **${typeEmoji}${change.isBreaking ? '⚠️ Breaking ' : ' '}${typeName}**: ${change.heading} ([${commit.hash.slice(0, 7)}](${_package.packageJson.repository.url}/commit/${commit.hash}))`
	}

	readonly package!: Package
	readonly version!: string
	readonly oldVersion!: string
	readonly date!: Date
	readonly commits = new Array<Commit>()

	get dateString() { return this.date.toISOString().split('T')[0] }

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
	static readonly splitRegex = /(?=(\n|^)commit [0-9a-f]{40})/

	static async generate() {
		const releases = (await Promise.all(Package.all.map(p => this.generateForPackage(p)))).flat()
		const groupBy = (Object as any).groupBy as <K extends PropertyKey, T>(items: Iterable<T>, keySelector: (item: T, index: number) => K) => Partial<Record<K, T[]>>
		const releaseNotes = Object.entries(groupBy(releases, release => release.dateString))
			.sort(([a], [b]) => new Date(b).valueOf() - new Date(a).valueOf())
			.filter(([, releases]) => releases?.length)
			.map(([dateString, releases]) => [dateString, releases?.map(r => r.toString(true)).filter(s => !!s.trim().length)] as const)
			.filter(([, releases]) => releases?.length)
			.map(([dateString, releases]) => `# ${dateString}\n\n${releases?.join('\n\n')}`) as Array<string>

		FileSystem.writeFileSync(Path.resolve('CHANGELOG.md'), releaseNotes.join('\n\n'))
	}

	private static async generateForPackage(p: Package) {
		const commits = (await run('git log --first-parent origin/main ./package.json', { directory: p.relativePath, captureOutput: true }))
			.split(ChangeLog.splitRegex)
			.filter(s => !!s.trim().length)
		const releases = new Array<Release>()
		let lastRelease: Release | undefined
		for (const [index, commitMessage] of commits.entries()) {
			const commit = Commit.parse(commitMessage)
			const output = await run(`git show --unified=0 --word-diff=plain ${commit.hash} package.json`, { directory: p.relativePath, captureOutput: true })
			if (!output || !output.includes('version')) {
				continue
			}
			// eslint-disable-next-line prefer-const
			let { version, oldVersion } = output.match(ChangeLog.versionRegex)?.groups ?? {}
			if (index === commits.length - 1) {
				version ||= releases.filter(l => !!l.oldVersion).at(-1)?.oldVersion || version
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

		// If we want to have changelogs directly in the repository in the future, we should get rid of this:
		p.packageJson.changelog = changelog
		FileSystem.writeFileSync(Path.resolve(p.path, 'package.json'), JSON.stringify(p.packageJson, null, '\t'))

		return releases
	}
}

ChangeLog.generate()