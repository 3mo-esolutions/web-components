import { getCustomElements, type StoryContext } from '@storybook/web-components-vite'

const storyFiles = import.meta.glob<string>(['../packages/**/*.stories.ts', '../samples/**/*.stories.ts'], { query: '?raw', import: 'default' })

/**
 * Shows the rendered HTML of a story unless its code does something HTML cannot express - bindings, directives
 * or content computed by an expression or by statements before the template - in which case the code is shown as written.
 */
export async function transformSource(snippet: string, context: StoryContext) {
	const render = await renderOf(context)
		?? renderCode(String(context.parameters.docs?.source?.originalSource ?? ''))
	return render && (render.computed || !snippet.trim())
		? dedent(render.code)
		: formatHtml(snippet, render?.code)
}

const voidElements = new Set(['area', 'base', 'br', 'col', 'embed', 'hr', 'img', 'input', 'link', 'meta', 'source', 'track', 'wbr'])

let attributeNames: Map<string, string> | undefined
/** The HTML parser lowercases attribute names, so their spelling is restored from the manifest. */
function attributeName(name: string) {
	attributeNames ??= new Map((getCustomElements()?.tags ?? [])
		.flatMap((tag: any) => [...tag.attributes ?? [], ...tag.properties ?? []])
		.map((member: any) => [String(member.attribute ?? member.name).toLowerCase(), String(member.attribute ?? member.name)]))
	return attributeNames.get(name) ?? name
}

/** Formats the rendered HTML without the attributes the story's code never names, such as those an element sets on itself. */
function formatHtml(html: string, code = '') {
	const template = document.createElement('template')
	template.innerHTML = html
	return [...template.content.childNodes].flatMap(node => formatNode(node, '', code.toLowerCase())).join('\n')
}

function formatNode(node: Node, indentation: string, code: string): Array<string> {
	if (node instanceof Text) {
		const text = node.data.trim().replace(/\s+/g, ' ').replace(/</g, '&lt;')
		return text ? [indentation + text] : []
	}
	if (!(node instanceof Element)) {
		return []
	}
	const tag = node.localName
	const attributes = [...node.attributes]
		.filter(({ name }) => !code || code.includes(name))
		.map(({ name, value }) => value === '' ? ` ${attributeName(name)}` : ` ${attributeName(name)}="${value.replace(/"/g, '&quot;')}"`)
		.join('')
	const open = `<${tag}${attributes}>`
	if (voidElements.has(tag)) {
		return [indentation + open]
	}
	const close = `</${tag}>`
	if (tag === 'style' || tag === 'script') {
		return [indentation + open, ...dedent(node.textContent ?? '').split('\n').map(line => `${indentation}\t${line}`), indentation + close]
	}
	const children = [...(node instanceof HTMLTemplateElement ? node.content : node).childNodes]
	const text = node.textContent?.trim().replace(/\s+/g, ' ') ?? ''
	if (children.every(child => child instanceof Text) && text.length <= 80) {
		return [`${indentation}${open}${text}${close}`]
	}
	return [indentation + open, ...children.flatMap(child => formatNode(child, `${indentation}\t`, code)), indentation + close]
}

/** Stories rendering a component written for the demonstration show that component's source instead. */
export function sourceOf(code: string) {
	return { docs: { source: { code: code.trim(), language: 'typescript' } } }
}

/** A story's render code as written in its file, falling back to the default export's render. */
async function renderOf(context: Pick<StoryContext, 'id' | 'parameters'>) {
	const source = await storyFiles[`.${context.parameters.fileName}`]?.()
	if (!source) {
		return undefined
	}
	const storyName = context.id.split('--')[1]
	for (const match of source.matchAll(/^export const (\w+)\b[^=]*=\s*/gm)) {
		if (sanitize(storyNameFromExport(match[1]!)) === storyName) {
			const body = source.slice(match.index + match[0].length)
			return renderCode(body.slice(0, closingBrace(body)))
				?? renderCode(source.slice(source.indexOf('export default'), source.indexOf('export const')))
		}
	}
	return undefined
}

/** The body of a render function that runs statements before its template, otherwise the template itself. */
function renderCode(source: string) {
	const block = source.match(/\brender:\s*(?:\([^)]*\)|\w+)\s*=>\s*\{/)
	if (block) {
		const start = block.index! + block[0].length - 1
		const body = source.slice(start + 1, start + closingBrace(source.slice(start)) - 1)
		if (!/^\s*return\s+html`/.test(body)) {
			return { code: body, computed: true }
		}
	}
	const template = outermostTemplate(source)
	return template === undefined ? undefined : { code: template, computed: isComputed(template) }
}

/** Whether HTML cannot express the template: property and event bindings, element directives, or content computed by an expression. */
function isComputed(template: string) {
	return /\s[.@][\w-]+=\$\{/.test(template)
		|| /<[a-z][\w-]*(?:\s+[^\s<>=]+(?:=(?:'[^']*'|"[^"]*"|\$\{[^{}]*\}|[^\s<>]+))?)*\s+\$\{/i.test(template)
		|| interpolations(template).some(expression => !/^[\w$]+$/.test(expression.trim()))
}

/** The expressions of the template's own `${…}`, not those of templates nested in them. */
function interpolations(template: string) {
	const expressions = new Array<string>()
	for (let i = 0; i < template.length; i++) {
		if (template[i] === '\\') {
			i++
		} else if (template[i] === '$' && template[i + 1] === '{') {
			const end = i + 1 + closingBrace(template.slice(i + 1))
			expressions.push(template.slice(i + 2, end - 1))
			i = end - 1
		}
	}
	return expressions
}

/** The longest `html` template literal that is not nested inside another one. */
function outermostTemplate(source: string) {
	let longest: string | undefined
	let index = 0
	while ((index = source.indexOf('html`', index)) !== -1) {
		const end = closingBacktick(source, index + 5)
		if (end === -1) {
			break
		}
		const content = source.slice(index + 5, end)
		if (longest === undefined || content.length > longest.length) {
			longest = content
		}
		index = end + 1
	}
	return longest
}

function closingBrace(source: string) {
	let depth = 0
	for (let i = 0; i < source.length; i++) {
		const char = source[i]
		if (char === '/' && source[i + 1] === '/') {
			i = source.indexOf('\n', i)
		} else if (char === '/' && source[i + 1] === '*') {
			const end = source.indexOf('*/', i)
			i = end === -1 ? -1 : end + 1
		} else if (char === '\'' || char === '"') {
			i = closingQuote(source, i + 1, char)
		} else if (char === '`') {
			i = closingBacktick(source, i + 1)
		} else if (char === '{' || char === '(' || char === '[') {
			depth++
		} else if (char === '}' || char === ')' || char === ']') {
			depth--
			if (depth === 0) {
				return i + 1
			}
		}
		if (i === -1) {
			return source.length
		}
	}
	return source.length
}

function closingBacktick(source: string, start: number): number {
	let depth = 0
	for (let i = start; i < source.length; i++) {
		const char = source[i]
		if (char === '\\') {
			i++
		} else if (depth === 0) {
			if (char === '`') {
				return i
			}
			if (char === '$' && source[i + 1] === '{') {
				depth = 1
				i++
			}
		} else if (char === '\'' || char === '"') {
			i = closingQuote(source, i + 1, char)
		} else if (char === '`') {
			i = closingBacktick(source, i + 1)
		} else if (char === '{') {
			depth++
		} else if (char === '}') {
			depth--
		}
		if (i === -1) {
			return -1
		}
	}
	return -1
}

function closingQuote(source: string, start: number, quote: string) {
	for (let i = start; i < source.length; i++) {
		if (source[i] === '\\') {
			i++
		} else if (source[i] === quote) {
			return i
		} else if (source[i] === '\n') {
			return -1
		}
	}
	return -1
}

/** Removes the common indentation, ignoring a first line that starts right after the opening backtick. */
function dedent(code: string) {
	const lines = code.replace(/^[ \t]*\n/, '').replace(/\n\s*$/, '').split('\n')
	const hanging = lines.length > 1 && /^\S/.test(lines[0]!)
	const indents = lines.slice(hanging ? 1 : 0).filter(line => line.trim()).map(line => line.match(/^\s*/)![0].length)
	const width = indents.length ? Math.min(...indents) : 0
	return lines.map((line, index) => hanging && index === 0 ? line : line.slice(Math.min(width, line.match(/^\s*/)![0].length))).join('\n')
}

/** Storybook's own `storyNameFromExport` and `sanitize`, which derive a story's id from its export name. */
function storyNameFromExport(name: string) {
	return name.replace(/[_\-.]/g, ' ')
		.replace(/([^\n])([A-Z])([a-z])/g, (_, a, b, c) => `${a} ${b}${c}`)
		.replace(/([a-z])([A-Z])/g, (_, a, b) => `${a} ${b}`)
		.replace(/([a-z])([0-9])/gi, (_, a, b) => `${a} ${b}`)
		.replace(/([0-9])([a-z])/gi, (_, a, b) => `${a} ${b}`)
		.replace(/(\s|^)(\w)/g, (_, a, b) => `${a}${b.toUpperCase()}`)
		.replace(/ +/g, ' ')
		.trim()
}

function sanitize(value: string) {
	return value.toLowerCase()
		.replace(/[ ’–—―′¿'`~!@#$%^&*()_|+\-=?;:'",.<>{}[\]\\/]/gi, '-')
		.replace(/-+/g, '-')
		.replace(/^-+/, '')
		.replace(/-+$/, '')
}