import { existsSync, promises as FileSystem } from 'fs'
import Path from 'path'
import { type CustomElementsManifest, run } from './util/index.ts'
import { LlmsText } from './util/LlmsText.ts'

// Writes into a built Storybook, "docs-dist" unless another directory is given, what a language model reads of it.
// The dev server renders the same files on request.
const directory = process.argv[2] ?? 'docs-dist'

if (!existsSync('./custom-elements.json')) {
	await run('npm run --silent analyze', { reject: true })
}
const manifest = JSON.parse(await FileSystem.readFile('./custom-elements.json', 'utf8')) as CustomElementsManifest
if (!existsSync(Path.join(directory, 'index.json'))) {
	throw new Error(`"${directory}" holds no built Storybook: run "npm run docs:build", or "npx storybook build -o ${directory}" and then this script`)
}
const index = JSON.parse(await FileSystem.readFile(Path.join(directory, 'index.json'), 'utf8'))

await FileSystem.mkdir(Path.join(directory, 'docs'), { recursive: true })
await Promise.all([...LlmsText.files(index, manifest)].map(([path, content]) => FileSystem.writeFile(Path.join(directory, path), content)))