const path = require('path')

module.exports = {
	stories: [
		"../packages/**/*.stories.mdx",
		"../packages/**/*.stories.ts"
	],
	addons: [
		"@storybook/addon-links",
		"@storybook/addon-essentials"
	],
	framework: "@storybook/web-components",
	core: {
		builder: "@storybook/builder-webpack5"
	},
	webpackFinal: config => {
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
						allowJs: false,
					}
				}
			},
			...rest
		]
		return config
	},
}