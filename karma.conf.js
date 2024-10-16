/* eslint-disable */
module.exports = config => config.set({
	basePath: '.',
	frameworks: ['jasmine'],
	plugins: ['karma-*'],
	files: ['./dist/test.js'],
	reporters: ['helpful'],
	logLevel: 'ERROR',
	port: 9876,
	browsers: ['ChromeOldHeadless', 'FirefoxHeadless'],
	customLaunchers: {
		ChromeOldHeadless: {
			base: 'Chrome',
			flags: ['--headless=old', '--disable-gpu', '--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage'],
		},
	},
	colors: true,
	autoWatch: true,
	singleRun: false,
	concurrency: Infinity,
	crossOriginAttribute: false,
	parallelOptions: {
		executors: 4,
	},
	helpfulReporter: {
		removeTail: true,
		colorBrowser: 205,
		colorConsoleLogs: 45,
		colorPass: 10,
		colorSkip: 11,
		colorFail: 9,
		colorTestName: 250,
		colorFirstLine: 9,
		colorLoggedErrors: 9,
	}
})