import { Localizer, type LanguageCode } from '@3mo/localization'

const packageNames = import.meta.glob<string>('../../*/package.json', { import: 'name', eager: true })
const aggregates = import.meta.glob<string>(['./*.ts', '!./*.test.ts'], { query: '?raw', import: 'default', eager: true })
const loadAggregates = import.meta.glob(['./*.ts', '!./*.test.ts'])
const packageTranslations = import.meta.glob<string>(['../../*/translations/*.ts', '!../../DesignLibrary/**', '!**/*.test.ts'], { query: '?raw', import: 'default', eager: true })

const packageFiles = Object.entries(packageTranslations).map(([path, source]) => {
	const [, directory, language] = path.match(/^\.\.\/\.\.\/([^/]+)\/translations\/([^/]+)\.ts$/)!
	const keys = [...source.matchAll(/^\t'((?:[^'\\]|\\.)*)':/gm)].map(([, key]) => key!.replace(/\\(.)/g, '$1'))
	return { name: packageNames[`../../${directory}/package.json`]!, language: language as LanguageCode, keys }
})

describe('Translations', () => {
	it('should find translations of several packages', () => {
		expect(packageFiles.length).toBeGreaterThan(1)
	})

	it('should import every package\'s translations in the aggregate of their language', () => {
		for (const { name, language } of packageFiles) {
			expect(aggregates[`./${language}.ts`], `${name} ${language}`).toContain(`import '${name}/translations/${language}'`)
		}
	})

	it('should register every package\'s translations once the aggregate of their language is imported', async () => {
		await Promise.all(Object.values(loadAggregates).map(load => load()))

		for (const { name, language, keys } of packageFiles) {
			for (const key of keys) {
				expect(Localizer.dictionaries.get(language).has(key), `${name} ${language} "${key}"`).toBe(true)
			}
		}
	})
})