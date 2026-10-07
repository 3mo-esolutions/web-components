import { afterAll, describe, inject, it } from 'vitest'
import { elementsByPackage } from './elements.ts'
import { stop } from './hydrate.ts'
import { verdictOf } from './verdict.ts'

declare module 'vitest' {
	interface ProvidedContext {
		/** The package directories `npm test -- Button Tab` narrows the tests to, none meaning every package. */
		testedPackages: Array<string>
	}
}

const testedPackages = inject('testedPackages')

// Every element renders on the server and hydrates to what a client render gives on a page without Lit's hydration support.
// Only the packages of the tests that run are rendered and hydrated, so `-t <tag>` narrows the work further.
describe.concurrent('Server-side rendering', () => {
	afterAll(stop)

	const tested = [...elementsByPackage].filter(([packageName]) => !testedPackages.length || testedPackages.includes(packageName))
	if (!tested.length) {
		it.skip('The packages tested have no elements')
	}
	for (const [packageName, elements] of tested) {
		describe(packageName, () => {
			for (const element of elements) {
				it(element.tag, async ({ expect }) => {
					const verdict = await verdictOf(element)
					expect(verdict.supported, `<${element.tag}> ${verdict.reason}`).toBe(true)
				})
			}
		})
	}
})
