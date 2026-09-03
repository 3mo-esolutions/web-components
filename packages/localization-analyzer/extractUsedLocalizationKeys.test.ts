// Imported straight from the module instead of "index.mjs", which re-exports the puppeteer-backed
// analyzer and cannot be bundled into the browser test bundle.
import { extractUsedLocalizationKeys } from './extractUsedLocalizationKeys.mjs'

describe('extractUsedLocalizationKeys()', () => {
	const extract = (code: string) => [...extractUsedLocalizationKeys(code)].sort()

	it('should collect string keys from t() call sites', () => {
		expect(extract(`
			t('Save')
			console.log(t('Cancel'), t('Delete'))
		`)).toEqual(['Cancel', 'Delete', 'Save'])
	})

	it('should deduplicate repeated keys', () => {
		expect(extract(`
			t('Save')
			t('Save')
			t('Save')
		`)).toEqual(['Save'])
	})

	it('should ignore calls to other identifiers and member calls', () => {
		expect(extract(`
			translate('Save')
			obj.t('Cancel')
			this.t('Delete')
		`)).toEqual([])
	})

	it('should ignore t() calls whose first argument is not a string literal', () => {
		expect(extract(`
			const key = 'Save'
			t(key)
			t(\`Hello \${name}\`)
		`)).toEqual([])
	})

	it('should parse modern module syntax without throwing', () => {
		expect(extract(`
			const module = await import('./module.js')
			export const label = t('Save')
			const fallback = module?.deep?.[0] ?? t('Fallback')
		`)).toEqual(['Fallback', 'Save'])
	})
})