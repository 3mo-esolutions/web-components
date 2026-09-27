import { SyntaxHighlighter } from 'storybook/internal/components'

// Balanced braces three levels deep, enough for object literals and arrow functions in a binding.
const binding = /\$\{(?:[^{}]|\{(?:[^{}]|\{(?:[^{}]|\{[^{}]*\})*\})*\})*\}/.source

/** HTML whose `${…}` bindings are TypeScript, which a tag may hold anywhere, `>` of an arrow function included. */
function lit(Prism: any) {
	const interpolation = {
		pattern: new RegExp(binding),
		inside: {
			'interpolation-punctuation': { pattern: /^\$\{|\}$/, alias: 'punctuation' },
			rest: Prism.languages.typescript,
		},
	}
	const attribute = String.raw`[^\s>\/=]+(?:\s*=\s*(?:"[^"]*"|'[^']*'|${binding}|[^\s'">=]+(?=[\s>])))?`
	Prism.languages.lit = Prism.languages.extend('markup', {})
	Prism.languages.lit.tag.pattern = new RegExp(String.raw`<\/?(?!\d)[^\s>\/=$<%]+(?:\s+(?:${attribute}|${binding}))*\s*\/?>`)
	Prism.languages.insertBefore('inside', 'attr-value', { interpolation }, Prism.languages.lit.tag)
	Prism.languages.insertBefore('lit', 'tag', { interpolation })
}
lit.displayName = 'lit'
lit.aliases = [] as Array<string>

SyntaxHighlighter.registerLanguage('lit', lit)