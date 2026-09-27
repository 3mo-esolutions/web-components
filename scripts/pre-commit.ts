import { run } from './util/index.ts'

const branch = (await run('git branch --show-current', { captureOutput: true })).trim()

if (branch === 'main') {
	await run('npm run --silent readme -- --root')
	try { await run('git add README.md') } catch { /* ignore */ }
}