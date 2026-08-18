import { run } from './util/index.ts'

await Promise.all([
	run('npm run analyze'),
	run('node ./scripts/changelog.ts'),
])
await run('storybook build -o docs-dist')