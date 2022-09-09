const path = require('path')
const ResolveTypeScriptPlugin = require('resolve-typescript-plugin')

module.exports = {
	stories: [
		"../packages/**/*.stories.mdx",
		"../packages/**/*.stories.ts"
	],
	addons: [
		"@storybook/addon-links",
		"@storybook/addon-essentials",
		{
			name: "@storybook/addon-docs",
			options: { transcludeMarkdown: true },
		},
	],
	framework: "@storybook/web-components",
	core: {
		builder: "@storybook/builder-webpack5"
	},
	webpackFinal: config => {
		config.mode = 'development'
		const [_babel, ...rest] = config.module.rules
		config.module.rules = [
			{
				test: /\.ts?$/,
				loader: 'ts-loader',
				options: {
					compilerOptions: {
						emitDeclarationOnly: false,
						noImplicitAny: false,
						noUnusedLocals: false,
						declaration: false,
						declarationMap: false,
						allowJs: false,
					}
				}
			},
			...rest
		]
		config.resolve.plugins = [...(config.resolve.plugins ?? []), new ResolveTypeScriptPlugin()]
		return config
	},
}