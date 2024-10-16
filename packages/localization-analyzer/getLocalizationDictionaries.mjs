// @ts-check
import puppeteer from 'puppeteer'

/**
 * Gets the localization dictionaries from a running application server.
 * @param {string} url - The URL of the server to get the localization dictionaries from
 * @returns {Promise<Map<string, Map<string, string>>>} - The localization dictionaries by language code
 */
export async function getLocalizationDictionaries(url) {
	const browser = await puppeteer.launch({
		headless: true,
		args: [
			'--ignore-certificate-errors',
			'--allow-insecure-localhost',
			'--no-sandbox',
			'--disable-setuid-sandbox',
			'--disable-gpu',
			'--disable-software-rasterizer',
		]
	})
	const page = await browser.newPage()
	await page.goto(url)
	await page.waitForFunction('globalThis.Localizer')
	// @ts-ignore
	const mapAsArray = await page.evaluate(() => [...globalThis.Localizer.dictionaries.byLanguageCode].map(([language, dictionary]) => ({ language, dictionary: [...dictionary] })))
	await browser.close()

	/** @type {Map<string, Map<string, string>>} */
	const result = new Map()
	for (const { language, dictionary } of mapAsArray) {
		const dictionaryMap = new Map()
		for (const [key, value] of dictionary) {
			dictionaryMap.set(key, value)
		}
		result.set(language, dictionaryMap)
	}
	return result
}