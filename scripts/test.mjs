/* eslint-disable no-console */
// @ts-check
import FileSystem from 'fs'
import Path from 'path'
import esbuild from 'esbuild'

function getTestFiles(directory) {
	const files = FileSystem.readdirSync(directory)
	// @ts-ignore - filter returns string[] | string[][]
	return files.flatMap(file => {
		const fullPath = Path.resolve(directory, file)
		if (FileSystem.statSync(fullPath)?.isDirectory()) {
			return getTestFiles(fullPath)
		}

		if (fullPath.endsWith('.test.ts') && !fullPath.includes('node_modules')) {
			return fullPath
		}
	}).filter(Boolean)
}

FileSystem.mkdirSync('./dist', { recursive: true })

const fileImports = getTestFiles('./packages').map(file => {
	const relativePath = Path.relative('./dist', file)
	return `import '${relativePath.replace(/\\/g, '/').replace(/\.ts$/, '')}'`
}).join('\n')

const content = `
globalThis.environment = 'test'
${fileImports}`

FileSystem.writeFileSync('./dist/test.ts', content)
await esbuild.build({
	bundle: true,
	outdir: './dist',
	entryPoints: ['./dist/test.ts'],
	tsconfig: './tsconfig.json',
	legalComments: 'none',
})

FileSystem.writeFileSync('./dist/test-ssr-config.js', `
import * as dom from '@lit-labs/ssr-dom-shim'
Object.assign(globalThis, dom);
globalThis.window ??= undefined;
globalThis.document ??= undefined;
globalThis.navigator ??= undefined;
globalThis.location ??= {};
`)

FileSystem.writeFileSync('./dist/test-ssr.ts', `
import './test-ssr-config.js'
import '@lit-labs/ssr'
import '@lit-labs/ssr-client/lit-element-hydrate-support.js'
${content}
`)
await esbuild.build({
	bundle: true,
	outdir: './dist',
	entryPoints: ['./dist/test-ssr.ts'],
	tsconfig: './tsconfig.json',
	legalComments: 'none',
})