import { fileURLToPath } from 'node:url'
import { dirname, resolve } from 'path'
import { readFileSync, readdirSync, existsSync } from 'fs'
import { defaultClientConditions, mergeConfig, type ViteDevServer } from 'vite'
import type { StorybookConfig } from '@storybook/web-components-vite'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

export default {
	stories: [
		'./docs/**/*.mdx',
		'../packages/**/*.mdx',
		'../packages/**/*.stories.ts',
		'../samples/**/*.stories.ts',
	],

	staticDirs: ['./public'],

	addons: [
		getAbsolutePath('@storybook/addon-docs'),
		getAbsolutePath('@storybook/addon-links'),
	],

	framework: {
		name: '@storybook/web-components-vite',
		options: {},
	},

	docs: {
		defaultName: 'Overview',
	},

	core: {
		disableWhatsNewNotifications: true,
	},

	features: {
		sidebarOnboardingChecklist: false,
		interactions: false,
	},

	viteFinal(config) {
		const packagesPath = resolve(__dirname, '../packages')
		const packageFolders = readdirSync(packagesPath)

		const packageAliases = packageFolders.flatMap(pkg => {
			const pkgJsonPath = resolve(packagesPath, pkg, 'package.json')
			const entryPoint = resolve(packagesPath, pkg, 'index.ts')
			if (!existsSync(pkgJsonPath) || !existsSync(entryPoint)) {
				return []
			}
			// Exact, so that subpaths resolve through the "source" condition of the package's exports.
			return [{ find: new RegExp(`^${JSON.parse(readFileSync(pkgJsonPath, 'utf8')).name}$`), replacement: entryPoint }]
		})

		return mergeConfig(config, {
			resolve: {
				alias: packageAliases,
				conditions: ['source', ...defaultClientConditions],
			},
			plugins: [{
				// Custom elements cannot be redefined, so hot-replacing a module that registers one throws.
				name: 'full-reload',
				handleHotUpdate({ server }: { server: ViteDevServer }) {
					server.ws.send({ type: 'full-reload' })
					return []
				},
			}, {
				// What the documentation build writes for language models, rendered on request here instead.
				name: 'llms',
				configureServer(server: ViteDevServer) {
					server.middlewares.use(async (request, response, next) => {
						const path = request.url?.split('?')[0]?.replace(/^\//, '') ?? ''
						if (!/^(llms(-full)?\.txt|docs\/[\w-]+\.md)$/.test(path)) {
							return next()
						}
						const { LlmsText } = await import('../scripts/util/LlmsText.ts')
						const index = await fetch(`http://${request.headers.host}/index.json`).then(response => response.json())
						const manifest = JSON.parse(readFileSync(resolve(__dirname, '../custom-elements.json'), 'utf8'))
						const content = LlmsText.files(index, manifest).get(path)
						if (content === undefined) {
							return next()
						}
						response.setHeader('Content-Type', `${path.endsWith('.md') ? 'text/markdown' : 'text/plain'}; charset=utf-8`)
						response.end(content)
					})
				},
			}],
		})
	},
} as StorybookConfig

function getAbsolutePath(value: string): any {
	return dirname(fileURLToPath(import.meta.resolve(`${value}/package.json`)))
}
