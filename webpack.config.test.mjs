import { resolve } from 'path'
import glob from 'glob'
import TsconfigPathsPlugin from 'tsconfig-paths-webpack-plugin'
import ResolveTypeScriptPlugin from 'resolve-typescript-plugin'

export default () => ({
	mode: 'development',
	stats: 'minimal',
	entry: glob.sync('./**/*.test.ts').filter(path => path.includes('node_modules') === false),
	devtool: false,
	output: {
		path: resolve('dist'),
		filename: 'test.js'
	},
	module: {
		rules: [
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
						preserveValueImports: true,
					}
				}
			}
		]
	},
	resolve: {
		extensions: ['.ts', '.js'],
		plugins: [
			new TsconfigPathsPlugin({ configFile: './tsconfig.json' }),
			new ResolveTypeScriptPlugin(),
		]
	}
})