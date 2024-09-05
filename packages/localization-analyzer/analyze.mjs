/* eslint-disable no-undef */
/* eslint-disable no-console */
// @ts-check
import { extractUsedLocalizationKeys } from './extractUsedLocalizationKeys.mjs'
import { getLocalizationDictionaries } from './getLocalizationDictionaries.mjs'

class LanguageAnalysis {
	/**
	 * @param {{ language: string, keys: Set<string>, missingKeys: Set<string>, unusedKeys: Set<string> }} parameters
	 */
	constructor(parameters) {
		this.parameters = parameters
	}

	get language() {
		return this.parameters.language.toUpperCase()
	}

	get keys() {
		return this.parameters.keys
	}

	get unusedKeys() {
		return this.parameters.unusedKeys
	}

	get missingKeys() {
		return this.parameters.missingKeys
	}

	logIssues() {
		const issues = [
			...[...this.missingKeys].filter(Boolean).map(key => ({ Type: '❌ Missing', Key: key })),
			...[...this.unusedKeys].filter(Boolean).map(key => ({ Type: '⚠️  Unused', Key: key }))
		].sort((a, b) => a.Key.localeCompare(b.Key))

		if (issues.length === 0) {
			console.log(`🟢 No issues found for language ${this.language}`)
		} else {
			console.group(`🔴 ${issues.length} issue(s) found for language ${this.language}`)
			console.table(issues)
			console.groupEnd()
		}
	}
}

/**
 * Analyzes the localization of a running application server.
 * @param {{ url: string, code: string, languages: string[] }} options - The options for the analysis
 */
export async function analyze(options) {
	const usedKeys = extractUsedLocalizationKeys(options.code)
	const dictionaries = await getLocalizationDictionaries(options.url)

	function getMissingTranslationsByLanguage() {
		// Check which usedKeys don't have translation in which language:
		/** @type {Map<string, Set<string>} */
		const missingTranslationsByLanguage = new Map()
		for (const key of usedKeys) {
			for (const [language, dictionary] of dictionaries) {
				if (language === 'en' && key.includes(':pluralityNumber') === false) {
					continue
				}

				if (!dictionary.has(key)) {
					if (!missingTranslationsByLanguage.has(language)) {
						missingTranslationsByLanguage.set(language, new Set())
					}
					missingTranslationsByLanguage.get(language)?.add(key)
				}
			}
		}
		return missingTranslationsByLanguage
	}

	function getUnusedTranslationsByLanguage() {
		/** @type {Map<string, Set<string>>} */
		const unusedTranslationsByLanguage = new Map()
		for (const [language, dictionary] of dictionaries) {
			for (const key of dictionary.keys()) {
				if (!usedKeys.has(key)) {
					if (!unusedTranslationsByLanguage.has(language)) {
						unusedTranslationsByLanguage.set(language, new Set())
					}
					unusedTranslationsByLanguage.get(language)?.add(key)
				}
			}
		}
		return unusedTranslationsByLanguage
	}

	const missingTranslationsByLanguage = getMissingTranslationsByLanguage()
	const unusedTranslationsByLanguage = getUnusedTranslationsByLanguage()

	return options.languages.map(language => {
		const missingKeys = missingTranslationsByLanguage.get(language) || new Set()
		const unusedKeys = unusedTranslationsByLanguage.get(language) || new Set()
		return new LanguageAnalysis({
			language,
			keys: usedKeys,
			missingKeys,
			unusedKeys,
		})
	})
}