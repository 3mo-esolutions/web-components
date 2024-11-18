// @ts-check
import { run, Package } from './util/index.mjs'
import FileSystem from 'fs'
import Path from 'path'
import * as CommitAnalyzer from '@3mo/commit-analyzer/Chan'

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
	static changeTypeInfo = new Map([
		['feat', { emoji: '🚀', name: 'Feature', order: 1 }],
		['fix', { emoji: '🐛', name: 'Fix', order: 2 }],
		['chore', { emoji: '🧹', name: 'Chore', order: 3 }],
		['refactor', { emoji: '🛠️', name: 'Refactoring', order: 4 }],
		['test', { emoji: '🧪', name: 'Test', order: 5 }],
		['docs', { emoji: '📝', name: 'Documentation', order: 6 }],
		['perf', { emoji: '⚡️', name: 'Performance Improvement', order: 7 }],
	])


	static parse(/** @type string */ message, /** @type Package */ pkg) {
		const commit = CommitAnalyzer.Commit.parse(message)
		return new Commit({ commit, package: pkg })
	}

	/** @param {Partial<Commit>} init */
	constructor(init) { Object.assign(this, init) }

	valueOf() {
		return this.commit.changes
			.map(cs => Commit.changeTypeInfo.get(cs.type)?.order ?? 0)
			.reduce((a, b) => a + b, 0)
	}

	/** @readonly @type {Package} */ package
	/** @readonly @type {CommitAnalyzer.Commit} */ commit

	toString() {
		return [...new Set(this.commit.changes.map(change => {
			const typeName = Commit.changeTypeInfo.get(change.type)?.name ?? 'Chore'
			const emoji = Commit.changeTypeInfo.get(change.type)?.emoji ?? '🧹'
			return `- **${emoji}${change.isBreaking ? '⚠️ Breaking ' : ' '}${typeName}**: ${change.heading} ([${this.commit.hash.slice(0, 7)}](${this.package.packageJson.repository.url}/commit/${this.commit.hash}))\n\n${change.description}`.trim()
		})).values()].join('\n')
	}
}

export class ChangeLog {
	/* @readonly */ static versionRegex = /"version": \[-"(?<oldVersion>.+)",-]{\+"(?<version>.+)",\+}/

	static async generate() {
		const releases = (await Promise.all(Package.all.map(p => this.generateForPackage(p)))).flat()
		const releaseNotes = Object.entries(Object.groupBy(releases, release => release.dateString))
			.sort(([a], [b]) => new Date(b).valueOf() - new Date(a).valueOf())
			.map(([dateString, releases]) => `# ${dateString}\n\n${releases.map(r => r.toString(true)).join('\n\n')}`)

		FileSystem.writeFileSync(Path.resolve('CHANGELOG.md'), releaseNotes.join('\n\n'))
	}

	/**
	 * @param {Package} p
	 * @returns {Promise<Release[]>}
	 */
	static async generateForPackage(p) {
		const commits = (await run('git log --first-parent origin/main --pretty=format:"%B (%H) (%ad);;;" --date=format:"%Y-%m-%d" ./package.json', p.relativePath)).split(';;;')

		/** @type {Release[]} */ const releases = []
		/** @type {Release} */ let lastRelease
		for (const [index, commit] of commits.entries()) {
			const { hash, date } = commit.match(Commit.regex)?.groups ?? {}
			if (!hash || !date) {
				continue
			}
			const output = await run(`git show --unified=0 --word-diff=plain ${hash} package.json`, p.relativePath)
			if (!output || !output.includes('version')) {
				continue
			}
			let { version, oldVersion } = output.match(ChangeLog.versionRegex)?.groups ?? {}
			if (index === commits.length - 1) {
				version ||= releases.filter(l => !!l.oldVersion).at(-1)?.oldVersion
			}
			const release = !version ? lastRelease : (lastRelease = new Release({ package: p, version, oldVersion, date: new Date(date) }))
			release?.commits.push(Commit.parse(commit))
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