import ts from 'typescript'
import FileSystem from 'fs'
import Path from 'path'
import { isExportStory, storyNameFromExport, toId } from 'storybook/internal/csf'
import { ModuleExports } from './ModuleExports.ts'
import { Package } from './Package.ts'

type Literal = string | number | boolean | null | undefined

/** A value known without running the story, told apart from one that is not known at all. */
type Resolved = { readonly value: Literal } | undefined

type FunctionLike = ts.ArrowFunction | ts.FunctionExpression | ts.FunctionDeclaration | ts.MethodDeclaration

interface Source {
	readonly path: string
	readonly file: ts.SourceFile
}

export interface Story {
	readonly exportName: string
	readonly name: string
	readonly url: string
	readonly description?: string
	readonly code?: Code
}

export interface Code {
	readonly language: 'html' | 'ts'
	readonly text: string
}

/** A stories file as the Storybook indexes and documents it, read with the TypeScript compiler instead of being run. */
export class StoriesFile {
	static readonly storybookUrl = 'https://3mo-esolutions.github.io/web-components/'

	/** The stories files of a package, ordered by title as the Storybook sidebar orders them. */
	static of(directory: string, packageName: string) {
		return StoriesFile.find(directory)
			.flatMap(path => StoriesFile.parse(path, packageName) ?? [])
			.sort((a, b) => a.title.localeCompare(b.title, 'en'))
	}

	/** The stories file at a path, as the Storybook documents it. */
	static at(path: string) {
		const p = Package.all.find(p => Path.resolve(path).startsWith(Path.resolve(p.path) + Path.sep))
		return StoriesFile.parse(path, p?.name ?? '')
	}

	/** The text of the file a module imports as `?raw` under a name. */
	static rawImport(file: ts.SourceFile, path: string, name: string) {
		const declaration = file.statements.find((s): s is ts.ImportDeclaration => ts.isImportDeclaration(s) && s.importClause?.name?.text === name)
		const specifier = declaration && ts.isStringLiteral(declaration.moduleSpecifier) ? declaration.moduleSpecifier.text : ''
		const target = specifier.endsWith('?raw') ? Path.resolve(Path.dirname(path), specifier.slice(0, -'?raw'.length)) : undefined
		return !target || !FileSystem.existsSync(target) ? undefined : FileSystem.readFileSync(target, 'utf8').replace(/\r\n/g, '\n')
	}

	private static find(directory: string): Array<string> {
		return FileSystem.readdirSync(directory, { withFileTypes: true }).flatMap(entry => {
			const path = Path.join(directory, entry.name)
			return entry.isDirectory()
				? entry.name === 'node_modules' || entry.name === 'dist' ? [] : StoriesFile.find(path)
				: entry.name.endsWith('.stories.ts') ? [path] : []
		})
	}

	private static parse(path: string, packageName: string) {
		const source = parse(path)
		const meta = objectLiteral(source.file.statements.find(ts.isExportAssignment)?.expression, source)
		const title = stringOf(property(meta, 'title'))
		return !meta || title === undefined ? undefined : new StoriesFile(source, meta, title, dependencies(source, packageName))
	}

	readonly path: string
	readonly title: string
	/** The component's id, which prefixes the ids of its stories and of its docs page. */
	readonly id: string
	readonly component: string | undefined
	/** The controller whose accessibility a page without a component documents, as `parameters.controller` names it. */
	readonly controller: string | undefined
	readonly stories: ReadonlyArray<Story>
	/** The first story's Lit template with its known arguments filled in, unless it renders a demonstration. */
	readonly usage: string | undefined
	readonly argTypeDescriptions: ReadonlyMap<string, string>
	/** What the stories and their demonstrations import by value from the package itself, which is what using it takes. */
	readonly imports: ReadonlySet<string>

	private constructor(source: Source, meta: ts.ObjectLiteralExpression, title: string, dependencies: Dependencies) {
		this.path = source.path
		this.title = title
		this.id = toId(stringOf(property(meta, 'id')) || title)
		this.component = stringOf(property(meta, 'component'))
		this.controller = stringOf(path(meta, source, 'parameters', 'controller'))
		this.imports = new Set(dependencies.imports)
		this.argTypeDescriptions = new Map(propertiesOf(objectLiteral(property(meta, 'argTypes'), source), source).flatMap(([name, argType]) => {
			const description = stringOf(property(objectLiteral(argType, source), 'description'))
			return !description ? [] : [[name, description] as const]
		}))

		const stories = storiesOf(source, meta)
		this.stories = stories.map(({ exportName, statement, annotations, render }) => ({
			exportName,
			name: stringOf(property(annotations, 'name')) ?? stringOf(property(annotations, 'storyName')) ?? storyNameFromExport(exportName),
			url: `${StoriesFile.storybookUrl}?path=/story/${toId(this.id, storyNameFromExport(exportName))}`,
			description: stringOf(path(annotations, source, 'parameters', 'docs', 'description', 'story')) ?? jsDocOf(statement, source.file),
			code: codeOf(source, meta, annotations, render),
		}))
		this.usage = !stories[0] ? undefined : usageOf(source, meta, stories[0].annotations, stories[0].render, dependencies.tags)
	}
}

interface Dependencies {
	readonly imports: Array<string>
	/** The elements the stories define for the demonstration. */
	readonly tags: Array<string>
}

/** The named imports and defined elements of a stories file and of the demonstrations it imports from a `stories` directory. */
function dependencies(source: Source, packageName: string, root = Path.dirname(Path.resolve(source.path)), visited = new Set<string>()): Dependencies {
	visited.add(Path.resolve(source.path))
	const tags = [...source.file.text.matchAll(/(?:@component|customElements\.define)\(\s*['"`]([a-z][\w.-]*-[\w.-]*)['"`]/g)].map(match => match[1]!)
	const imports = new Array<string>()
	for (const statement of source.file.statements) {
		if (!ts.isImportDeclaration(statement) || !ts.isStringLiteral(statement.moduleSpecifier)) {
			continue
		}
		const specifier = statement.moduleSpecifier.text.replace(/\?.*$/, '')
		const bindings = statement.importClause?.namedBindings
		if (!statement.importClause?.isTypeOnly && (specifier.startsWith('.') || specifier === packageName) && bindings && ts.isNamedImports(bindings)) {
			imports.push(...bindings.elements.filter(element => !element.isTypeOnly).map(element => (element.propertyName ?? element.name).text))
		}
		const target = ModuleExports.resolve(source.path, specifier)
		if (target && !visited.has(target) && Path.relative(root, target).split(Path.sep).includes('stories')) {
			const demonstration = dependencies(parse(target), packageName, root, visited)
			imports.push(...demonstration.imports)
			tags.push(...demonstration.tags)
		}
	}
	return { imports, tags }
}

function parse(path: string): Source {
	const text = FileSystem.readFileSync(path, 'utf8').replace(/\r\n/g, '\n')
	return { path, file: ts.createSourceFile(path, text, ts.ScriptTarget.Latest, true, ts.ScriptKind.TS) }
}

function unwrap(node: ts.Node | undefined): ts.Expression | undefined {
	return !node || !ts.isExpression(node) ? undefined
		: ts.isAsExpression(node) || ts.isSatisfiesExpression(node) || ts.isParenthesizedExpression(node) || ts.isNonNullExpression(node) || ts.isTypeAssertionExpression(node)
			? unwrap(node.expression)
			: node
}

function constInitializer(source: Source, name: string) {
	for (const statement of source.file.statements) {
		if (ts.isVariableStatement(statement) && statement.declarationList.flags & ts.NodeFlags.Const) {
			const declaration = statement.declarationList.declarations.find(d => ts.isIdentifier(d.name) && d.name.text === name)
			if (declaration) {
				return declaration.initializer
			}
		}
	}
	return undefined
}

/** The object literal an expression stands for, looking through constants and calls such as `meta.story({ … })`. */
function objectLiteral(node: ts.Node | undefined, source: Source, depth = 0): ts.ObjectLiteralExpression | undefined {
	const expression = unwrap(node)
	return !expression || depth > 5 ? undefined
		: ts.isObjectLiteralExpression(expression) ? expression
			: ts.isIdentifier(expression) ? objectLiteral(constInitializer(source, expression.text), source, depth + 1)
				: ts.isCallExpression(expression) ? objectLiteral(expression.arguments[0], source, depth + 1)
					: undefined
}

function nameOf(name: ts.PropertyName | ts.BindingName) {
	return ts.isIdentifier(name) || ts.isStringLiteral(name) || ts.isNumericLiteral(name) || ts.isPrivateIdentifier(name) ? name.text : undefined
}

function property(object: ts.ObjectLiteralExpression | undefined, name: string): ts.Node | undefined {
	const element = object?.properties.find(element => element.name && nameOf(element.name) === name)
	return !element ? undefined
		: ts.isPropertyAssignment(element) ? element.initializer
			: ts.isShorthandPropertyAssignment(element) ? element.name
				: element
}

function path(object: ts.ObjectLiteralExpression | undefined, source: Source, ...names: Array<string>) {
	return names.reduce<ts.Node | undefined>((node, name, index) => property(index === 0 ? object : objectLiteral(node, source), name), undefined)
}

function propertiesOf(object: ts.ObjectLiteralExpression | undefined, source: Source, depth = 0): Array<[string, ts.Node]> {
	return (object?.properties ?? []).flatMap((element): Array<[string, ts.Node]> => {
		if (ts.isSpreadAssignment(element)) {
			return depth > 5 ? [] : propertiesOf(objectLiteral(element.expression, source), source, depth + 1)
		}
		const name = element.name && nameOf(element.name)
		return name === undefined ? []
			: ts.isPropertyAssignment(element) ? [[name, element.initializer]]
				: ts.isShorthandPropertyAssignment(element) ? [[name, element.name]]
					: [[name, element]]
	})
}

function stringOf(node: ts.Node | undefined) {
	const expression = unwrap(node)
	return expression && (ts.isStringLiteral(expression) || ts.isNoSubstitutionTemplateLiteral(expression)) ? expression.text : undefined
}

function patternOf(node: ts.Node | undefined) {
	const expression = unwrap(node)
	if (expression && ts.isArrayLiteralExpression(expression)) {
		return expression.elements.flatMap(element => stringOf(element) ?? [])
	}
	const match = expression && ts.isRegularExpressionLiteral(expression) ? expression.text.match(/^\/(.*)\/(\w*)$/s) : undefined
	return !match ? undefined : new RegExp(match[1]!, match[2])
}

function functionOf(node: ts.Node | undefined, source: Source, depth = 0): FunctionLike | undefined {
	if (node && (ts.isFunctionDeclaration(node) || ts.isMethodDeclaration(node))) {
		return node
	}
	const expression = unwrap(node)
	return !expression || depth > 5 ? undefined
		: ts.isArrowFunction(expression) || ts.isFunctionExpression(expression) ? expression
			: ts.isIdentifier(expression) ? functionOf(constInitializer(source, expression.text), source, depth + 1)
				: undefined
}

/** The named exports Storybook takes for stories, in file order, with their annotations or, for a function, their render. */
function storiesOf(source: Source, meta: ts.ObjectLiteralExpression) {
	const filter = { includeStories: patternOf(property(meta, 'includeStories')), excludeStories: patternOf(property(meta, 'excludeStories')) }
	return source.file.statements.flatMap(statement => {
		const exported = ts.canHaveModifiers(statement) && !!ts.getModifiers(statement)?.some(m => m.kind === ts.SyntaxKind.ExportKeyword)
		const declarations = !exported ? []
			: ts.isVariableStatement(statement) ? statement.declarationList.declarations.flatMap(d => ts.isIdentifier(d.name) ? [{ exportName: d.name.text, value: d.initializer as ts.Node | undefined }] : [])
				: ts.isFunctionDeclaration(statement) && statement.name ? [{ exportName: statement.name.text, value: statement as ts.Node }] : []
		return declarations
			.filter(({ exportName }) => isExportStory(exportName, filter))
			.map(({ exportName, value }) => {
				const render = functionOf(value, source)
				return { exportName, statement, render, annotations: render ? undefined : objectLiteral(value, source) }
			})
	})
}

/** The JSDoc above a story, extracted the way Storybook extracts it. */
function jsDocOf(statement: ts.Statement, file: ts.SourceFile) {
	const text = (ts.getLeadingCommentRanges(file.text, statement.pos) ?? [])
		.map(range => file.text.slice(range.pos, range.end))
		.filter(comment => comment.startsWith('/**'))
		.map(comment => comment.slice(2, -2).split('\n').map(line => line.replace(/^(\s+)?(\*+)?(\s)?/, '')).join('\n').trim())
		.filter(Boolean)
		.join('\n')
	return text || undefined
}

function usageOf(source: Source, meta: ts.ObjectLiteralExpression, annotations: ts.ObjectLiteralExpression | undefined, storyRender: FunctionLike | undefined, demonstrationTags: ReadonlyArray<string>) {
	const render = renderOf(source, meta, annotations, storyRender)
	const filled = demonstrationOf(source, annotations) || !render ? undefined : filledTemplate(source, meta, annotations, render)
	return !filled?.result.trim() || demonstrationTags.some(tag => new RegExp(`<${tag}[\\s>/]`).test(filled.masked)) ? undefined : dedent(filled.result)
}

/** A story's code as its "Show code" shows it: the code it demonstrates, what its render runs before the template, or the template with the known arguments filled in. */
function codeOf(source: Source, meta: ts.ObjectLiteralExpression, annotations: ts.ObjectLiteralExpression | undefined, storyRender: FunctionLike | undefined): Code | undefined {
	const demonstration = demonstrationOf(source, annotations)
	if (demonstration) {
		return !demonstration.text ? undefined : { language: 'ts', text: demonstration.text }
	}
	const render = renderOf(source, meta, annotations, storyRender)
	const body = render?.body && ts.isBlock(render.body) ? render.body : undefined
	const [first, ...rest] = body?.statements ?? []
	const returnsTemplate = !!first && !rest.length && ts.isReturnStatement(first) && !!first.expression && ts.isTaggedTemplateExpression(first.expression)
	if (body && !returnsTemplate) {
		return { language: 'ts', text: dedent(source.file.text.slice(body.getStart(source.file) + 1, body.end - 1)) }
	}
	const filled = !render ? undefined : filledTemplate(source, meta, annotations, render)
	return !filled?.result.trim() ? undefined : { language: 'html', text: dedent(filled.result) }
}

function renderOf(source: Source, meta: ts.ObjectLiteralExpression, annotations: ts.ObjectLiteralExpression | undefined, storyRender: FunctionLike | undefined) {
	return storyRender ?? (!annotations ? undefined : functionOf(property(annotations, 'render') ?? property(meta, 'render'), source))
}

/** The code a story shows instead of its own, given as `parameters: sourceOf(…)` or `parameters.docs.source.code`. */
function demonstrationOf(source: Source, annotations: ts.ObjectLiteralExpression | undefined) {
	const parameters = unwrap(property(annotations, 'parameters'))
	const code = parameters && ts.isCallExpression(parameters) && ts.isIdentifier(parameters.expression) && parameters.expression.text === 'sourceOf'
		? parameters.arguments[0]
		: path(annotations, source, 'parameters', 'docs', 'source', 'code')
	return !code ? undefined : { text: textOf(code, source)?.trim() }
}

/** The text of string literals, templates of them and `?raw` imports. */
function textOf(node: ts.Node | undefined, source: Source, depth = 0): string | undefined {
	const expression = unwrap(node)
	if (!expression || depth > 5) {
		return undefined
	}
	if (ts.isStringLiteral(expression) || ts.isNoSubstitutionTemplateLiteral(expression)) {
		return expression.text
	}
	if (ts.isTemplateExpression(expression)) {
		const parts = [expression.head.text, ...expression.templateSpans.flatMap(span => [textOf(span.expression, source, depth + 1), span.literal.text])]
		return parts.some(part => part === undefined) ? undefined : parts.join('')
	}
	return !ts.isIdentifier(expression) ? undefined
		: StoriesFile.rawImport(source.file, source.path, expression.text) ?? textOf(constInitializer(source, expression.text), source, depth + 1)
}

/** The story's longest template with the arguments known without running it filled in. */
function filledTemplate(source: Source, meta: ts.ObjectLiteralExpression, annotations: ts.ObjectLiteralExpression | undefined, render: FunctionLike) {
	const template = longestTemplate(render)
	if (!template) {
		return undefined
	}

	const args = new Map([
		...propertiesOf(objectLiteral(property(meta, 'args'), source), source),
		...propertiesOf(objectLiteral(property(annotations, 'args'), source), source),
	])
	const argument = (name: string, fallback?: ts.Expression): Resolved => args.has(name) ? literalOf(args.get(name), source)
		: fallback ? literalOf(fallback, source)
			: { value: undefined }
	const parameter = render.parameters[0]?.name
	const resolve = (node: ts.Expression): Resolved => {
		const expression = unwrap(node)!
		if (ts.isCallExpression(expression) && ts.isIdentifier(expression.expression) && expression.expression.text === 'ifDefined' && expression.arguments.length === 1) {
			return resolve(expression.arguments[0]!)
		}
		if (ts.isBinaryExpression(expression) && [ts.SyntaxKind.QuestionQuestionToken, ts.SyntaxKind.BarBarToken].includes(expression.operatorToken.kind)) {
			const left = resolve(expression.left)
			const fallback = !left ? undefined : expression.operatorToken.kind === ts.SyntaxKind.BarBarToken ? !left.value : left.value === null || left.value === undefined
			return fallback ? literalOf(expression.right, source) : left
		}
		if (parameter && ts.isObjectBindingPattern(parameter) && ts.isIdentifier(expression)) {
			const element = parameter.elements.find(e => !e.dotDotDotToken && ts.isIdentifier(e.name) && e.name.text === expression.text)
			const name = element && nameOf(element.propertyName ?? element.name)
			return name === undefined ? undefined : argument(name, element?.initializer)
		}
		return parameter && ts.isIdentifier(parameter) && ts.isPropertyAccessExpression(expression) && ts.isIdentifier(expression.expression) && expression.expression.text === parameter.text
			? argument(expression.name.text)
			: undefined
	}

	const literal = template.template
	const start = literal.getStart(source.file) + 1
	const bindings = !ts.isTemplateExpression(literal) ? [] : literal.templateSpans.map((span, index, spans) => ({
		start: (index === 0 ? literal.head.end : spans[index - 1]!.literal.end) - 2 - start,
		end: span.literal.getStart(source.file) + 1 - start,
		resolved: resolve(span.expression),
	}))
	return fill(source.file.text.slice(start, literal.end - 1), bindings)
}

/** The longest `html` template of a render function that is not nested inside another one. */
function longestTemplate(render: FunctionLike) {
	let longest: ts.TaggedTemplateExpression | undefined
	const visit = (node: ts.Node) => {
		if (ts.isTaggedTemplateExpression(node) && ts.isIdentifier(node.tag) && node.tag.text === 'html') {
			if (!longest || node.template.end - node.template.pos > longest.template.end - longest.template.pos) {
				longest = node
			}
		} else {
			ts.forEachChild(node, visit)
		}
	}
	if (render.body) {
		visit(render.body)
	}
	return longest
}

function literalOf(node: ts.Node | undefined, source: Source, depth = 0): Resolved {
	const expression = unwrap(node)
	if (!expression || depth > 5) {
		return undefined
	}
	if (ts.isStringLiteral(expression) || ts.isNoSubstitutionTemplateLiteral(expression)) {
		return { value: expression.text }
	}
	if (ts.isNumericLiteral(expression)) {
		return { value: Number(expression.text) }
	}
	if (ts.isPrefixUnaryExpression(expression) && expression.operator === ts.SyntaxKind.MinusToken && ts.isNumericLiteral(expression.operand)) {
		return { value: -Number(expression.operand.text) }
	}
	if (expression.kind === ts.SyntaxKind.TrueKeyword || expression.kind === ts.SyntaxKind.FalseKeyword || expression.kind === ts.SyntaxKind.NullKeyword) {
		return { value: expression.kind === ts.SyntaxKind.NullKeyword ? null : expression.kind === ts.SyntaxKind.TrueKeyword }
	}
	if (ts.isIdentifier(expression)) {
		return expression.text === 'undefined' ? { value: undefined } : literalOf(constInitializer(source, expression.text), source, depth + 1)
	}
	return ts.isPropertyAccessExpression(expression) && ts.isIdentifier(expression.expression)
		? enumMember(source, expression.expression.text, expression.name.text)
		: undefined
}

/** The value of an enum member, the enum being declared in the file or imported from a module of the package. */
function enumMember(source: Source, enumName: string, memberName: string, depth = 0): Resolved {
	const declaration = source.file.statements.find((s): s is ts.EnumDeclaration => ts.isEnumDeclaration(s) && s.name.text === enumName)
	if (declaration) {
		let next = 0
		for (const member of declaration.members) {
			const resolved = member.initializer ? literalOf(member.initializer, source) : { value: next }
			if (typeof resolved?.value === 'number') {
				next = resolved.value + 1
			}
			if (nameOf(member.name) === memberName) {
				return resolved
			}
		}
		return undefined
	}
	for (const statement of depth > 5 ? [] : source.file.statements) {
		const specifier = (ts.isImportDeclaration(statement) || ts.isExportDeclaration(statement)) && statement.moduleSpecifier && ts.isStringLiteral(statement.moduleSpecifier)
			? statement.moduleSpecifier.text
			: undefined
		const bindings = ts.isImportDeclaration(statement) ? statement.importClause?.namedBindings : ts.isExportDeclaration(statement) ? statement.exportClause : undefined
		const element = !bindings || ts.isNamespaceImport(bindings) || ts.isNamespaceExport(bindings) ? undefined
			: (bindings.elements as ReadonlyArray<ts.ImportSpecifier | ts.ExportSpecifier>).find(e => e.name.text === enumName)
		const reexportsAll = ts.isExportDeclaration(statement) && !statement.exportClause
		const target = !specifier || !element && !reexportsAll ? undefined
			: specifier.startsWith('.') ? ModuleExports.resolve(source.path, specifier)
				: entryOf(specifier)
		const resolved = !target ? undefined : enumMember(parse(target), element?.propertyName?.text ?? enumName, memberName, depth + 1)
		if (resolved) {
			return resolved
		}
	}
	return undefined
}

/** The source entry of one of the repository's packages. */
function entryOf(packageName: string) {
	const p = Package.all.find(p => p.name === packageName)
	const entry = p && Path.resolve(p.path, 'index.ts')
	return entry && FileSystem.existsSync(entry) ? entry : undefined
}

/**
 * Fills in the bindings of known values as Lit renders them: attributes take the value, boolean attributes appear or
 * disappear and text is inserted - except that an attribute without a value is left out. Everything else stays as
 * written, and is masked in the second text returned, as its code may hold anything, even a `>`.
 */
function fill(content: string, bindings: ReadonlyArray<{ readonly start: number, readonly end: number, readonly resolved: Resolved }>) {
	let result = ''
	let masked = ''
	let cursor = 0
	const append = (text: string, mask = text) => {
		result += text
		masked += mask
	}
	const keep = (expression: string) => append(expression, '\u0001'.repeat(expression.length))
	const shortened = new Set<number>()

	for (const { start, end, resolved } of bindings) {
		append(content.slice(cursor, start))
		cursor = end
		const expression = content.slice(start, end)
		const tagStart = masked.lastIndexOf('<')
		if (!resolved) {
			keep(expression)
		} else if (tagStart <= masked.lastIndexOf('>')) {
			append(resolved.value === null || resolved.value === undefined ? '' : String(resolved.value).replace(/&/g, '&amp;').replace(/</g, '&lt;'))
		} else {
			const tag = masked.slice(tagStart)
			const [whole = '', space = '', prefix = '', name = '', quote = ''] = tag.match(/(\s+)([.?@]?)([^\s=<>'"/]+)=(['"]?)$/) ?? []
			const valueQuote = tag.match(/\s[.?@]?[^\s=<>'"/]+=(['"])(?:(?!\1)[^])*$/)?.[1]
			const { value } = resolved
			if (whole && (!quote || content[cursor] === quote)) {
				if (prefix === '@' || prefix === '.' && value === undefined) {
					keep(expression)
				} else if (prefix === '.') {
					append(`\${${javaScript(value)}}`)
				} else {
					result = result.slice(0, -whole.length)
					masked = masked.slice(0, -whole.length)
					cursor += quote.length
					const attribute = prefix === '?' ? !value ? '' : space + name
						: value === null || value === undefined || value === '' ? ''
							: `${space}${name}=${quoted(String(value))}`
					append(attribute)
					if (!attribute) {
						shortened.add(tagStart)
					}
				}
			} else if (valueQuote) {
				append(value === null || value === undefined ? '' : String(value).replaceAll(valueQuote, valueQuote === '\'' ? '&#39;' : '&quot;'))
			} else {
				keep(expression)
			}
		}
	}
	append(content.slice(cursor))

	// A tag spread over lines for its attributes goes back onto one line if dropping some left it short enough:
	for (const start of [...shortened].sort((a, b) => b - a)) {
		const end = masked.indexOf('>', start) + 1
		const tag = result.slice(start, end)
		const maskedTag = masked.slice(start, end)
		const join = (text: string) => text.replace(/\s*\n\s*/g, ' ').replace(/\s+(\/?>)$/, '$1')
		const breaksCode = [...tag].some((char, index) => char === '\n' && maskedTag[index] === '\u0001')
		if (end && tag.includes('\n') && !breaksCode && join(tag).length <= 80) {
			result = result.slice(0, start) + join(tag) + result.slice(end)
			masked = masked.slice(0, start) + join(maskedTag) + masked.slice(end)
		}
	}
	return { result, masked }
}

function quoted(value: string) {
	return !value.includes('\'') ? `'${value}'`
		: !value.includes('"') ? `"${value}"`
			: `'${value.replace(/'/g, '&#39;')}'`
}

function javaScript(value: Literal) {
	return typeof value !== 'string' ? String(value) : `'${value.replace(/\\/g, '\\\\').replace(/'/g, '\\\'').replace(/\n/g, '\\n')}'`
}

/** Removes the common indentation, ignoring a first line that starts right after the opening backtick. */
function dedent(code: string) {
	const lines = code.replace(/^[ \t]*\n/, '').replace(/\n\s*$/, '').split('\n')
	const hanging = lines.length > 1 && /^\S/.test(lines[0]!)
	const indents = lines.slice(hanging ? 1 : 0).filter(line => line.trim()).map(line => line.match(/^\s*/)![0].length)
	const width = indents.length ? Math.min(...indents) : 0
	return lines.map((line, index) => hanging && index === 0 ? line : line.slice(Math.min(width, line.match(/^\s*/)![0].length))).join('\n')
}
