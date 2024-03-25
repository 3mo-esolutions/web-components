import { dirname, join } from 'path'
import ResolveTypeScriptPlugin from 'resolve-typescript-plugin'
import type { StorybookConfig } from '@storybook/web-components-webpack5'

export default {
	stories: [
		'../packages/**/*.stories.ts',
		'../samples/**/*.stories.ts',
	],

	staticDirs: ['./public'],

	addons: [
		getPackageAbsolutePath('@storybook/addon-links'),
		getPackageAbsolutePath('@storybook/addon-essentials'),
		getPackageAbsolutePath('@storybook/addon-webpack5-compiler-babel'),
		getPackageAbsolutePath('@storybook/addon-storysource'),
		getPackageAbsolutePath('storybook-dark-mode'),
	],

	framework: {
		name: getPackageAbsolutePath('@storybook/web-components-webpack5'),
		options: {}
	},

	webpackFinal: (config: any) => {
		config.mode = 'development'

		config.entry.push(getAbsolutePath('../packages/DesignLibrary/index.ts'))
		config.output.filename = 'main.js'
		config.optimization = {}

		const exceptBabel = config.module.rules.slice(0, -1)
		config.module.rules = [
			{
				test: /\.ts(x)?$/,
				loader: 'ts-loader',
				options: {
					compilerOptions: {
						target: 'ES2020',
						importHelpers: true,
						emitDeclarationOnly: false,
						noImplicitAny: false,
						noUnusedLocals: false,
						declaration: false,
						declarationMap: false,
						allowJs: false,
						jsx: 'react-jsx',
					}
				}
			},
			...exceptBabel
		]
		config.resolve.plugins = [
			...(config.resolve.plugins ?? []),
			new ResolveTypeScriptPlugin(),
		]

		return config
	},

	docs: {
		autodocs: true
	}
} as StorybookConfig

function getAbsolutePath(value: string): any {
	return join(__dirname, value)
}

function getPackageAbsolutePath(value: string): any {
	return dirname(require.resolve(join(value, 'package.json')))
}