import { run } from './util/index.ts'

const branch = (await run('git branch --show-current')).trim()

if (branch === 'main') {
	await Promise.all([
		run('npm run readme'),
	])
}