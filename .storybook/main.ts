import { fileURLToPath } from 'node:url'
import { dirname, resolve } from 'path'
import { readFileSync, readdirSync, existsSync } from 'fs'
import { mergeConfig } from 'vite'
import type { StorybookConfig } from '@storybook/web-components-vite'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)


export default {
	stories: [
		'../packages/**/*.stories.ts',
		'../samples/**/*.stories.ts',
	],

	staticDirs: ['./public'],

	addons: [
		getAbsolutePath('@storybook/addon-docs'),
		getAbsolutePath('@storybook/addon-links'),
		getAbsolutePath('@vueless/storybook-dark-mode')
	],

	framework: {
		name: getAbsolutePath('@storybook/web-components-vite'),
		options: {}
	},

	viteFinal(config) {
		const packagesPath = resolve(__dirname, '../packages')
		const packageFolders = readdirSync(packagesPath)

		const packageAliases = packageFolders.reduce((aliases, pkg) => {
			// Read the package.json to get the correct package name
			const pkgJsonPath = resolve(packagesPath, pkg, 'package.json')
			if (existsSync(pkgJsonPath)) {
				const pkgJson = JSON.parse(readFileSync(pkgJsonPath, 'utf8'))
				const packageName = pkgJson.name

				// Point the package name to its source entry file
				// Make sure this path is correct for your structure (e.g., src/index.ts)
				const entryPoint = resolve(packagesPath, pkg, 'index.ts')
				if (existsSync(entryPoint)) {
					aliases[packageName] = entryPoint
				}
			}
			return aliases
		}, {} as Record<string, string>)

		return mergeConfig(config, {
			resolve: {
				alias: packageAliases,
			}
		})
	}
} as StorybookConfig

function getAbsolutePath(value: string): any {
	return dirname(fileURLToPath(import.meta.resolve(`${value}/package.json`)))
}