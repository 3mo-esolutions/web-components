import { resolve } from 'path'
import TsconfigPathsPlugin from 'tsconfig-paths-webpack-plugin'
import TerserPlugin from 'terser-webpack-plugin'
import ResolveTypeScriptPlugin from 'resolve-typescript-plugin'

export default () => ({
	mode: 'production',
	entry: './index.ts',
	output: {
		path: resolve('dist'),
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
				loader: 'minify-html-literals-loader',
				exclude: [
					/PageDialog.js/,
					/PageError.js/,
					/DataGrid.ts/,
					/TooltipHost.ts/,
					/Snackbar.ts/,
					/ThemeHelper.ts/,
				],
			}
		]
	},
	resolve: {
		extensions: ['.ts', '.js'],
		plugins: [
			new ResolveTypeScriptPlugin(),
			new TsconfigPathsPlugin({ configFile: './tsconfig.json' })
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
})