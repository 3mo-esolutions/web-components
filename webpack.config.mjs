import { resolve, dirname } from 'path'
import { fileURLToPath } from 'url'
import TsconfigPathsPlugin from 'tsconfig-paths-webpack-plugin'
import TerserPlugin from 'terser-webpack-plugin'

export default (moduleUrl) => {
	const directory = dirname(fileURLToPath(moduleUrl))
	return {
		mode: 'production',
		entry: resolve(directory, 'index.ts'),
		output: {
			path: resolve(directory, 'dist'),
			filename: 'bundle.js'
		},
		module: {
			rules: [
				{
					test: /\.ts?$/,
					loader: 'ts-loader',
				},
				{
					test: /\.(js|jsx|ts|tsx)$/,
					loader: 'minify-html-literals-loader'
				}
			]
		},
		resolve: {
			extensions: ['.ts', '.js'],
			plugins: [
				new TsconfigPathsPlugin({ configFile: resolve(directory, 'tsconfig.json') })
			]
		},
		optimization: {
			minimize: true,
			minimizer: [
				new TerserPlugin({
					terserOptions: {
						output: {
							comments: false,
						},
					},
					extractComments: false,
				})
			],
		}
	}
}