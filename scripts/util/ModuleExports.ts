import ts from 'typescript'
import FileSystem from 'fs'
import Path from 'path'

export type ExportKind = 'class' | 'function' | 'enum' | 'const' | 'variable' | 'namespace' | 'interface' | 'type'

export interface ModuleExport {
	readonly name: string
	readonly kind: ExportKind
	readonly typeOnly: boolean
	readonly description?: string
	/** The declaration's `@accessibility` JSDoc section: its roles, states and keys, in Markdown. */
	readonly accessibility?: string
}

const kindOrder: Array<ExportKind> = ['class', 'function', 'enum', 'const', 'variable', 'namespace', 'interface', 'type']

/**
 * The named exports of a module and of every relative module it re-exports, read syntactically,
 * so that no program has to be built and nothing outside the package has to resolve.
 */
export class ModuleExports {
	static of(path: string) {
		return [...new ModuleExports().collect(Path.resolve(path)).values()]
			.sort((a, b) => kindOrder.indexOf(a.kind) - kindOrder.indexOf(b.kind))
	}

	private readonly visited = new Map<string, Map<string, ModuleExport>>()

	private collect(path: string): Map<string, ModuleExport> {
		const cached = this.visited.get(path)
		if (cached) {
			return cached
		}
		const exports = new Map<string, ModuleExport>()
		this.visited.set(path, exports)

		const sourceFile = ts.createSourceFile(path, FileSystem.readFileSync(path, 'utf8'), ts.ScriptTarget.Latest, true)
		const local = ModuleExports.localDeclarations(sourceFile)
		const add = (entry: ModuleExport) => {
			const existing = exports.get(entry.name)
			exports.set(entry.name, !existing ? entry : {
				name: entry.name,
				kind: kindOrder.indexOf(entry.kind) < kindOrder.indexOf(existing.kind) ? entry.kind : existing.kind,
				typeOnly: existing.typeOnly && entry.typeOnly,
				description: existing.description ?? entry.description,
				accessibility: existing.accessibility ?? entry.accessibility,
			})
		}

		for (const statement of sourceFile.statements) {
			if (ts.isExportDeclaration(statement)) {
				const target = !statement.moduleSpecifier || !ts.isStringLiteral(statement.moduleSpecifier)
					? undefined
					: ModuleExports.resolve(path, statement.moduleSpecifier.text)
				const targetExports = target ? this.collect(target) : undefined
				const clause = statement.exportClause
				if (!clause) {
					for (const entry of targetExports?.values() ?? []) {
						add(statement.isTypeOnly ? { ...entry, typeOnly: true } : entry)
					}
				} else if (ts.isNamespaceExport(clause)) {
					add({ name: clause.name.text, kind: 'namespace', typeOnly: statement.isTypeOnly })
				} else {
					for (const element of clause.elements) {
						const originalName = (element.propertyName ?? element.name).text
						const original = statement.moduleSpecifier ? targetExports?.get(originalName) : local.get(originalName)
						if (original || !statement.moduleSpecifier) {
							const typeOnly = statement.isTypeOnly || element.isTypeOnly || !!original?.typeOnly
							add({ name: element.name.text, kind: original?.kind ?? 'const', typeOnly, description: original?.description, accessibility: original?.accessibility })
						}
					}
				}
			} else if (ModuleExports.isExported(statement)) {
				for (const name of ModuleExports.declaredNames(statement)) {
					const entry = local.get(name)
					if (entry) {
						add(entry)
					}
				}
			}
		}
		return exports
	}

	/** The source file of a relative module specifier, which names the emitted `.js` file. */
	static resolve(from: string, specifier: string) {
		if (!specifier.startsWith('.')) {
			return undefined
		}
		const base = Path.resolve(Path.dirname(from), specifier)
		return [base.replace(/\.js$/, '.ts'), base.replace(/\.mjs$/, '.mts'), base, `${base}.ts`, Path.join(base, 'index.ts')]
			.find(candidate => FileSystem.existsSync(candidate) && FileSystem.statSync(candidate).isFile())
	}

	private static isExported(statement: ts.Statement) {
		return ts.canHaveModifiers(statement)
			&& !!ts.getModifiers(statement)?.some(modifier => modifier.kind === ts.SyntaxKind.ExportKeyword)
			&& !ts.getModifiers(statement)?.some(modifier => modifier.kind === ts.SyntaxKind.DefaultKeyword)
	}

	private static declaredNames(statement: ts.Statement) {
		const name = (statement as ts.DeclarationStatement).name
		return ts.isVariableStatement(statement)
			? statement.declarationList.declarations.flatMap(declaration => ts.isIdentifier(declaration.name) ? [declaration.name.text] : [])
			: name && ts.isIdentifier(name) ? [name.text] : []
	}

	/** Every top-level declaration of a file by name, exported or not, as `export { x }` may refer to either. */
	private static localDeclarations(sourceFile: ts.SourceFile) {
		const declarations = new Map<string, ModuleExport>()
		const add = (name: string, kind: ExportKind, node: ts.Node) => {
			const existing = declarations.get(name)
			const typeOnly = kind === 'interface' || kind === 'type'
			const description = ModuleExports.descriptionOf(node)
			const accessibility = ModuleExports.accessibilityOf(node)
			declarations.set(name, !existing ? { name, kind, typeOnly, description, accessibility } : {
				name,
				kind: kindOrder.indexOf(kind) < kindOrder.indexOf(existing.kind) ? kind : existing.kind,
				typeOnly: existing.typeOnly && typeOnly,
				description: existing.description ?? description,
				accessibility: existing.accessibility ?? accessibility,
			})
		}
		for (const statement of sourceFile.statements) {
			if (ts.isClassDeclaration(statement) && statement.name) {
				add(statement.name.text, 'class', statement)
			} else if (ts.isFunctionDeclaration(statement) && statement.name) {
				add(statement.name.text, 'function', statement)
			} else if (ts.isEnumDeclaration(statement)) {
				add(statement.name.text, 'enum', statement)
			} else if (ts.isInterfaceDeclaration(statement)) {
				add(statement.name.text, 'interface', statement)
			} else if (ts.isTypeAliasDeclaration(statement)) {
				add(statement.name.text, 'type', statement)
			} else if (ts.isModuleDeclaration(statement) && ts.isIdentifier(statement.name)) {
				add(statement.name.text, 'namespace', statement)
			} else if (ts.isVariableStatement(statement)) {
				const kind = statement.declarationList.flags & ts.NodeFlags.Const ? 'const' : 'variable'
				for (const declaration of statement.declarationList.declarations) {
					if (ts.isIdentifier(declaration.name)) {
						add(declaration.name.text, kind, declaration)
					}
				}
			}
		}
		return declarations
	}

	static accessibilityOf(node: ts.Node) {
		const tag = ts.getJSDocTags(node).find(tag => tag.tagName.text === 'accessibility')
		return ts.getTextOfJSDocComment(tag?.comment)?.trim() || undefined
	}

	private static descriptionOf(node: ts.Node) {
		const text = ts.getJSDocCommentsAndTags(node)
			.filter(ts.isJSDoc)
			.map(jsDoc => ts.getTextOfJSDocComment(jsDoc.comment)?.trim())
			.find(Boolean)
		return text || undefined
	}
}
