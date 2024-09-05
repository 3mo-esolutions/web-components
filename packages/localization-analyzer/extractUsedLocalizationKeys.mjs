// @ts-check
import { parse } from 'acorn'
import { simple } from 'acorn-walk'

/**
 * Extracts the localization keys used in the given code.
 * @param {string} code - The bundle code to analyze for localization keys
 * @returns {Set<string>} - The localization keys used in the code
 */
export function extractUsedLocalizationKeys(code) {
	const ast = parse(code, { sourceType: 'module', ecmaVersion: 2024 })

	/** @type {Set<string>} */
	const localizationKeys = new Set()

	simple(ast, {
		CallExpression(node) {
			if (node.callee.type === 'Identifier' && node.callee.name === 't') {
				// @ts-ignore
				const key = node.arguments[0].value
				if (key) {
					localizationKeys.add(key)
				}
			}
		}
	})

	return localizationKeys
}
