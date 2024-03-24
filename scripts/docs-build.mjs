import { run } from './util/index.mjs'

await Promise.all([
	run('npm run analyze', undefined, true),
	run('node ./scripts/changelog.mjs'),
])
await run('storybook build -o docs-dist', undefined, true)