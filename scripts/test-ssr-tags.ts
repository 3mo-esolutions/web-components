import FileSystem from 'fs'
import ts from 'typescript'

/** The JSDoc block above the class registering a tag through `@component`, as offsets into its source. */
function jsDocOf(source: string, path: string, tag: string) {
	const sourceFile = ts.createSourceFile(path, source, ts.ScriptTarget.Latest, true)
	const declaration = sourceFile.statements.find((statement): statement is ts.ClassDeclaration => ts.isClassDeclaration(statement)
		&& !!ts.getDecorators(statement)?.some(decorator => ts.isCallExpression(decorator.expression)
			&& ts.isIdentifier(decorator.expression.expression)
			&& decorator.expression.expression.text === 'component'
			&& ts.isStringLiteralLike(decorator.expression.arguments[0]!)
			&& decorator.expression.arguments[0].text === tag))
	if (!declaration) {
		throw new Error(`${path} registers no class as <${tag}>`)
	}
	const jsDoc = ts.getJSDocCommentsAndTags(declaration).filter(ts.isJSDoc).at(-1)
	return { declaration, jsDoc, sourceFile }
}

/** Writes `@ssr true` or `@ssr false` into the JSDoc of the element, keeping the caveat of a claim which still holds. */
export function writeSsrTag(path: string, tag: string, supported: boolean) {
	const source = FileSystem.readFileSync(path, 'utf-8')
	const { declaration, jsDoc, sourceFile } = jsDocOf(source, path, tag)
	let updated: string
	if (!jsDoc) {
		const start = declaration.getStart(sourceFile)
		updated = `${source.slice(0, start)}/**\n * @element ${tag}\n *\n * @ssr ${supported}\n */\n${source.slice(start)}`
	} else {
		const written = source.slice(jsDoc.getStart(sourceFile), jsDoc.end)
		const text = written.includes('\n') ? written : `/**\n * ${written.slice(3, -2).trim()}\n */`
		const line = /^([ \t]*\*[ \t]*)@ssr[ \t]+(true|false)\b([^\n]*)$/m
		const existing = text.match(line)
		const next = existing
			? text.replace(line, (_, prefix: string, claim: string, caveat: string) => `${prefix}@ssr ${supported}${supported && claim === 'true' ? caveat : ''}`)
			: /^[ \t]*\*[ \t]*@element[^\n]*$/m.test(text)
				? text.replace(/^([ \t]*)\*([ \t]*)@element[^\n]*$/m, match => `${match}\n${match.slice(0, match.indexOf('*') + 1)}\n${match.slice(0, match.indexOf('@'))}@ssr ${supported}`)
				: text.replace(/\n([ \t]*)\*\/$/, (_, indentation: string) => `\n${indentation}*\n${indentation}* @ssr ${supported}\n${indentation}*/`)
		updated = source.slice(0, jsDoc.getStart(sourceFile)) + next + source.slice(jsDoc.end)
	}
	if (updated !== source) {
		FileSystem.writeFileSync(path, updated)
	}
	return updated !== source
}