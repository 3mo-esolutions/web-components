import { defineConfig } from 'vitest/config'
import { playwright } from '@vitest/browser-playwright'
import { defaultClientConditions } from 'vite'
import { readdirSync, readFileSync, existsSync } from 'fs'
import { resolve } from 'path'

const packagesPath = resolve(import.meta.dirname, 'packages')

// Every package resolves to its source rather than to the "main" it publishes, which points at a
// dist that is absent until a build runs. Subpaths do so through the "source" condition of their
// exports, which is why each alias matches the name exactly. Storybook resolves the same way.
const alias = readdirSync(packagesPath).flatMap(directory => {
	const manifest = resolve(packagesPath, directory, 'package.json')
	const entry = resolve(packagesPath, directory, 'index.ts')
	return !existsSync(manifest) || !existsSync(entry) ? [] : [{ find: new RegExp(`^${JSON.parse(readFileSync(manifest, 'utf8')).name}$`), replacement: entry }]
})

const browser = {
	enabled: true,
	headless: true,
	// Karma served the suites in a full-size frame; Vitest defaults to a 414px phone viewport,
	// which puts every layout- and breakpoint-dependent expectation on the wrong side of it.
	viewport: { width: 1280, height: 800 },
	provider: playwright(),
}

// The package directories `npm test -- Button Tab` narrows every kind of test to, none meaning every package.
const testedPackages = process.env.TEST_PACKAGES?.split(',').filter(Boolean) ?? []

export default defineConfig({
	resolve: { alias, conditions: ['source', ...defaultClientConditions] },
	test: {
		globals: true,
		provide: { testedPackages },
		setupFiles: ['./scripts/vitest-setup.ts'],
		// A later beforeEach may rely on an earlier one having built its fixture, so hooks of the same
		// kind run in the order they were registered rather than together.
		sequence: { hooks: 'list' },
		// Every spec gets its spies back the way it found them.
		restoreMocks: true,
		projects: [
			{
				extends: true,
				test: {
					name: 'specs',
					include: !testedPackages.length ? ['packages/**/*.test.ts'] : testedPackages.map(directory => `packages/${directory}/**/*.test.ts`),
					exclude: [
						'**/node_modules/**',
						// Helpers that carry the extension without declaring a suite.
						'**/expectDateTimesEquals.test.ts',
						'**/fakeNavigation.test.ts',
						'**/fakeScreenSizeMedia.test.ts',
					],
					browser: {
						...browser,
						// Named explicitly, as they would otherwise be "specs (chromium)", and `npm run dev` selects "chromium".
						instances: [
							{ browser: 'chromium', name: 'chromium' },
							{ browser: 'firefox', name: 'firefox' },
						],
					},
				},
			},
			{
				test: {
					name: 'ssr',
					include: ['scripts/ssr/**/*.test.ts'],
					provide: { testedPackages },
					environment: 'node',
					// Renders each element in a Node process of its own and hydrates each package on a Chromium page of its own.
					maxConcurrency: 16,
					testTimeout: 180_000,
					hookTimeout: 30_000,
				},
			},
			{
				extends: true,
				test: {
					name: 'stories',
					include: ['.storybook/stories.test.ts'],
					// Whether a story renders does not depend on the browser, and Firefox is three times slower.
					browser: { ...browser, instances: [{ browser: 'chromium' }] },
				},
			},
		],
	},
})
