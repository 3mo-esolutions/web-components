import { Package } from './util/index.ts'

const versionBumpType = 'patch'

for (const p of Package.all) {
	try {
		await p.release(versionBumpType)
	} catch (error) {
		// eslint-disable-next-line no-console
		console.error(error)
	}
}