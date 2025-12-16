import { run } from './util/index.ts'

const branch = (await run('git branch --show-current', { captureOutput: true })).trim()

if (branch === 'main') {
	await Promise.all([
		run('npm run readme'),
	])
}