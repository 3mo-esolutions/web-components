import FileSystem from 'fs'
import Path from 'path'
import esbuild from 'esbuild'

function getTestFiles(directory: string): Array<string> {
	const files = FileSystem.readdirSync(directory)
	return files.flatMap(file => {
		const fullPath = Path.resolve(directory, file)
		if (FileSystem.statSync(fullPath)?.isDirectory()) {
			return getTestFiles(fullPath)
		}

		if (fullPath.endsWith('.test.ts') && !fullPath.includes('node_modules')) {
			return fullPath
		}
	}).filter(Boolean) as Array<string>
}

FileSystem.mkdirSync('./dist', { recursive: true })

const testIndexFileContent = `
globalThis.environment = 'test'
${getTestFiles('./packages').map(file => {
	const relativePath = Path.relative('./dist', file)
	return `import '${relativePath.replace(/\\/g, '/').replace(/\.ts$/, '')}'`
}).join('\n')}`
FileSystem.writeFileSync('./dist/test.ts', testIndexFileContent)

await esbuild.build({
	bundle: true,
	outdir: './dist',
	entryPoints: ['./dist/test.ts'],
	tsconfig: './tsconfig.json',
})