import { run, Package } from './util/index.mjs'
import FileSystem from 'fs'
import Path from 'path'

class Release {
	/** @readonly @type {Package} */ package
	/** @readonly @type {string} */ version
	/** @readonly @type {string} */ oldVersion
	/** @readonly @type {Date} */ date
	/** @readonly @type {Commit[]} */ commits = []

	get dateString() { return this.date.toISOString().split('T')[0] }

	/** @param {Partial<Release>} init */
	constructor(init) { Object.assign(this, init) }

	sortCommits() {
		this.commits.sort((a, b) => a - b)
	}

	toString(forGlobalChangelog = false) {
		return !forGlobalChangelog
			? `## ${this.version} (${this.dateString})\n${this.commits.join('\n')}`
			: `### \`${this.package.packageJson.name}\` ${this.version}\n${this.commits.join('\n')}`
	}
}

class Commit {
	/* @readonly */ static order = ['feat', 'fix', 'chore', 'refactor', 'test', 'docs', 'perf']
	/* @readonly */ static commitTypeInfo = new Map([
		['feat', { emoji: '🚀', name: 'Feature' }],
		['fix', { emoji: '🐛', name: 'Fix' }],
		['chore', { emoji: '🧹', name: 'Chore' }],
		['refactor', { emoji: '🛠️', name: 'Refactoring' }],
		['test', { emoji: '🧪', name: 'Test' }],
		['docs', { emoji: '📝', name: 'Documentation' }],
		['perf', { emoji: '⚡️', name: 'Performance Improvement' }],
	])

	/** @param {Partial<Commit>} init */
	constructor(init) {
		Object.assign(this, init)
		this.type ||= 'chore'
		this.message = this.message?.charAt(0).toUpperCase() + this.message?.slice(1)
	}

	/** @readonly @type {Package} */ package
	/** @readonly @type {string} */ hash
	/** @readonly @type {string} */ type
	/** @readonly @type {string} */ message
	/** @readonly @type {Date} */ date
	get typeName() { return Commit.commitTypeInfo.get(this.type)?.name ?? 'Chore' }
	get emoji() { return Commit.commitTypeInfo.get(this.type)?.emoji ?? '🧹' }

	valueOf() {
		return Commit.order.indexOf(this.type)
	}

	toString() {
		return `- ${this.emoji} **${this.typeName}**: ${this.message} ([${this.hash.slice(0, 7)}](${this.package.packageJson.repository.url}/commit/${this.hash}))`
	}
}

export class ChangeLog {
	/* @readonly */ static commitRegex = /(?<type>\w+)(\((?<scope>\w+)\))?(!?): (?<message>.+) \((?<hash>\w+)\) \((?<date>.+)\)/
	/* @readonly */ static versionRegex = /"version": \[-"(?<oldVersion>.+)",-]{\+"(?<version>.+)",\+}/

	static async generate() {
		const releases = (await Promise.all(Package.all.map(p => this.generateForPackage(p)))).flat()
		const releaseNotes = Object.entries(Object.groupBy(releases, release => release.dateString))
			.sort(([a], [b]) => new Date(b) - new Date(a))
			.map(([dateString, releases]) => `# ${dateString}\n\n${releases.map(r => r.toString(true)).join('\n\n')}`)

		FileSystem.writeFileSync(Path.resolve('CHANGELOG.md'), releaseNotes.join('\n\n'))
	}

	/**
	 * @param {Package} p
	 * @returns {Promise<Release[]>}
	 */
	static async generateForPackage(p) {
		const commits = (await run('git log --first-parent origin/main --pretty=format:"%s (%H) (%ad)" --date=format:"%Y-%m-%d" ./package.json', p.relativePath)).split('\n')

		/** @type {Release[]} */ const releases = []
		/** @type {Release} */ let lastRelease
		for (const [index, commit] of commits.entries()) {
			const { type, message, hash, date } = commit.match(ChangeLog.commitRegex)?.groups ?? {}
			const output = await run(`git show --unified=0 --word-diff=plain ${hash} package.json`, p.relativePath)
			if (!output || !output.includes('version')) {
				continue
			}
			let { version, oldVersion } = output.match(ChangeLog.versionRegex)?.groups ?? {}
			if (index === commits.length - 1) {
				version ||= releases.filter(l => !!l.oldVersion).at(-1)?.oldVersion
			}
			const release = !version ? lastRelease : (lastRelease = new Release({ package: p, version, oldVersion, date: new Date(date) }))
			release?.commits.push(new Commit({ package: p, type, message, hash, date }))
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