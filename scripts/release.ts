import { execa } from 'execa'
import { Package, run } from './util/index.ts'

// Publishes every package version npm does not have yet, each after the packages it depends on. "--dry-run" only lists them.
const dryRun = process.argv.includes('--dry-run')

const refusals = await checkoutRefusals()
if (refusals.length && !dryRun) {
	throw new Error(`Releases are published from a clean checkout of "main" at "origin/main":\n${list(refusals)}`)
}

const packages = Package.inDependencyOrder.filter(p => !p.packageJson.private)
const published = await inParallel(packages, p => p.published())
const pending = packages.filter((_, index) => !published[index])
const unpublishedChanges = (await inParallel(packages, async (p, index) => !published[index] ? [] : [{ package: p, ...await changesSince(p, published[index].gitHead) }]))
	.flat()
	.filter(({ files }) => files.length)

if (unpublishedChanges.length) {
	write(`Changed since their published version, which is not bumped, so a release leaves these changes out:\n${list(unpublishedChanges.map(({ package: p, since, files }) => `${p.name}@${p.version} since ${since.slice(0, 8)}: ${files.join(', ')}`))}\n`)
}

write(!pending.length ? 'Every version is published.' : `To publish, in this order:\n${list(pending.map(p => `${p.name}@${p.version}${!p.isPrerelease ? '' : ' (tag "preview")'}`))}`)

if (refusals.length) {
	write(`\nA release would refuse to run here:\n${list(refusals)}`)
}

if (!dryRun && pending.length) {
	for (const p of pending) {
		await p.build()
	}
	await run('npm run --silent analyze', { reject: true })
	await run('npm run --silent changelog')
	for (const p of pending) {
		write(`Publishing ${p.name}@${p.version}`)
		await p.publish()
	}
}

async function checkoutRefusals() {
	const refusals = new Array<string>()
	const branch = await git('branch', '--show-current')
	if (branch !== 'main') {
		refusals.push(`The branch is "${branch || 'detached'}", not "main".`)
	}
	if (await git('status', '--porcelain')) {
		refusals.push('The working tree has changes.')
	}
	if (!await git('fetch', '--quiet', 'origin', 'main').then(() => true, () => false)) {
		refusals.push('"origin/main" could not be fetched.')
	} else if (await git('rev-parse', 'HEAD') !== await git('rev-parse', 'origin/main')) {
		refusals.push('HEAD is not "origin/main".')
	}
	return refusals
}

/** The shipped files of a package that changed since its published version was built. */
async function changesSince(p: Package, gitHead: string | undefined) {
	const bump = await git('log', '-1', '--format=%H', '-G"version":', 'HEAD', '--', `${p.relativePath}/package.json`)
	// Versions published before the bump was committed record the commit preceding it:
	const since = gitHead && await git('merge-base', '--is-ancestor', bump, gitHead).then(() => true, () => false) ? gitHead : bump
	const files = !since ? [] : (await git('diff', '--name-only', since, 'HEAD', '--', p.relativePath)).split('\n')
		.filter(file => !!file && !/\.(test|stories)\.ts$|\/stories\/|\.mdx$/.test(file))
		.map(file => file.slice(p.relativePath.length + 1))
	return { since, files }
}

async function git(...args: Array<string>) {
	return (await execa('git', args)).stdout.trim()
}

async function inParallel<T, R>(items: ReadonlyArray<T>, map: (item: T, index: number) => Promise<R>, concurrency = 16) {
	const results = new Array<R>(items.length)
	let next = 0
	await Promise.all(Array.from({ length: concurrency }, async () => {
		while (next < items.length) {
			const index = next++
			results[index] = await map(items[index]!, index)
		}
	}))
	return results
}

function list(lines: ReadonlyArray<string>) {
	return lines.map(line => `  ${line}`).join('\n')
}

function write(text: string) {
	process.stdout.write(`${text}\n`)
}
