import ts from 'typescript'
import Path from 'path'

/** A member together with its source file, which has to be passed explicitly as program nodes carry no parent pointers. */
interface Declaration {
	readonly member: ts.ClassElement
	readonly sourceFile: ts.SourceFile
}

class ClassMembers {
	readonly staticMembers = new Set<string>()
	readonly instanceMembers = new Map<string, Declaration>()
	readonly className: string
	readonly tagName: string | undefined
	readonly baseClassName: string | undefined

	constructor(className: string, tagName: string | undefined, baseClassName: string | undefined) {
		this.className = className
		this.tagName = tagName
		this.baseClassName = baseClassName
	}
}

/**
 * Static class members are not part of an element's DOM API, but the analyzer emits public ones as if they were
 * element properties - and where a static shadows an instance member of the same name, the static even wins the
 * emitted type and default. This resolves the real members of each component class, including inherited ones, so
 * that the manifest can be corrected without having to annotate anything in the components themselves.
 */
export class ComponentMembers {
	private static readonly classesByName = new Map<string, ClassMembers>()
	private static readonly classesByTagName = new Map<string, ClassMembers>()
	private static checker: ts.TypeChecker

	/**
	 * Builds a program from the given entry files and harvests every component class reachable from them, so that
	 * base classes residing in other packages are resolved as well.
	 */
	static collect(entryPaths: Array<string>) {
		const configFile = ts.readConfigFile('./tsconfig.base.json', ts.sys.readFile)
		const config = ts.parseJsonConfigFileContent(configFile.config, ts.sys, '.')
		// Absolute entry paths, as relative ones stay relative in "fileName" while imported files are resolved absolutely:
		const entries = entryPaths.map(p => Path.resolve(p).replace(/\\/g, '/'))
		const program = ts.createProgram(entries, { ...config.options, noEmit: true, incremental: false })
		this.checker = program.getTypeChecker()

		const packagesDirectory = `${Path.resolve('./packages').replace(/\\/g, '/')}/`

		for (const sourceFile of program.getSourceFiles()) {
			const fileName = sourceFile.fileName.replace(/\\/g, '/')
			if (sourceFile.isDeclarationFile || !fileName.startsWith(packagesDirectory) || fileName.includes('/node_modules/')) {
				continue
			}

			for (const statement of sourceFile.statements) {
				if (ts.isClassDeclaration(statement) && statement.name) {
					const classMembers = this.getClassMembers(statement, sourceFile)
					this.classesByName.set(classMembers.className, classMembers)
					if (classMembers.tagName) {
						this.classesByTagName.set(classMembers.tagName, classMembers)
					}
				}
			}
		}
	}

	private static getClassMembers(declaration: ts.ClassDeclaration, sourceFile: ts.SourceFile) {
		const classMembers = new ClassMembers(
			declaration.name!.text,
			this.getTagName(declaration),
			this.getBaseClassName(declaration),
		)

		for (const member of declaration.members) {
			const name = member.name && ts.isIdentifier(member.name) ? member.name.text : undefined
			if (!name || this.getVisibility(member) !== 'public') {
				continue
			}

			if (ts.getCombinedModifierFlags(member as ts.Declaration) & ts.ModifierFlags.Static) {
				classMembers.staticMembers.add(name)
			} else {
				classMembers.instanceMembers.set(name, { member, sourceFile })
			}
		}

		return classMembers
	}

	private static getTagName(declaration: ts.ClassDeclaration) {
		for (const decorator of ts.getDecorators(declaration) ?? []) {
			const expression = decorator.expression
			if (ts.isCallExpression(expression)
				&& ts.isIdentifier(expression.expression)
				&& expression.expression.text === 'component'
				&& expression.arguments[0]
				&& ts.isStringLiteralLike(expression.arguments[0])) {
				return expression.arguments[0].text
			}
		}
		return undefined
	}

	private static getBaseClassName(declaration: ts.ClassDeclaration) {
		const clause = declaration.heritageClauses?.find(c => c.token === ts.SyntaxKind.ExtendsKeyword)
		const expression = clause?.types[0]?.expression
		return expression && ts.isIdentifier(expression) ? expression.text : undefined
	}

	private static getVisibility(member: ts.ClassElement): 'public' | 'protected' | 'private' {
		const flags = ts.getCombinedModifierFlags(member as ts.Declaration)
		return flags & ts.ModifierFlags.Private || member.name && ts.isPrivateIdentifier(member.name) ? 'private'
			: flags & ts.ModifierFlags.Protected ? 'protected'
				: 'public'
	}

	/** The type and default the analyzer should have emitted for an instance member, resolved through the type checker. */
	private static describe({ member, sourceFile }: Declaration) {
		const initializer = ts.isPropertyDeclaration(member) ? member.initializer : undefined
		return {
			type: this.checker.typeToString(this.checker.getTypeAtLocation(member)),
			default: !initializer ? undefined : `"${sourceFile.text.slice(initializer.getStart(sourceFile), initializer.end)}"`,
		}
	}

	/** Resolves the members of the element with the given tag name, including inherited ones. */
	static of(tagName: string) {
		const staticMembers = new Set<string>()
		const instanceMembers = new Map<string, Declaration>()

		let classMembers = this.classesByTagName.get(tagName)
		const visited = new Set<ClassMembers>()
		while (classMembers && !visited.has(classMembers)) {
			visited.add(classMembers)
			for (const name of classMembers.staticMembers) {
				staticMembers.add(name)
			}
			for (const [name, declaration] of classMembers.instanceMembers) {
				// The most derived declaration wins, mirroring how the members are inherited:
				if (!instanceMembers.has(name)) {
					instanceMembers.set(name, declaration)
				}
			}
			classMembers = !classMembers.baseClassName ? undefined : this.classesByName.get(classMembers.baseClassName)
		}

		const shadowed = [...staticMembers].filter(name => instanceMembers.has(name))

		return {
			/** Whether a class declaring this tag name through `@component` was found at all. */
			known: this.classesByTagName.has(tagName),
			/** Static members which do not share their name with an instance member, so they are no element properties at all. */
			staticOnly: new Set([...staticMembers].filter(name => !instanceMembers.has(name))),
			/** Corrections for members whose emitted type and default were taken from a static of the same name. */
			corrections: new Map(shadowed.map(name => [name, this.describe(instanceMembers.get(name)!)])),
		}
	}
}