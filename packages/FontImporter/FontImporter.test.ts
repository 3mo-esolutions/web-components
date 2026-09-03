import { FontImporter } from './FontImporter.js'

describe('FontImporter', () => {
	const getStylesContent = () => [...document.head.querySelectorAll('style')].map(style => style.textContent).join('\n')

	it('should import the font', () => {
		const fontUrl = 'https://fonts.googleapis.com/css2?family=Roboto:wght@100&display=swap'

		expect(getStylesContent()).not.toContain(fontUrl)

		FontImporter.import(fontUrl)
		expect(getStylesContent()).toContain(fontUrl)
	})

	it('should not duplicate a font that was already imported', () => {
		const fontUrl = 'https://fonts.googleapis.com/css2?family=Dedupe:wght@100&display=swap'
		const occurrences = () => getStylesContent().split(`@import '${fontUrl}';`).length - 1

		FontImporter.import(fontUrl)
		FontImporter.import(fontUrl)
		FontImporter.import(fontUrl)

		expect(occurrences()).toBe(1)
	})

	it('should preserve previously imported fonts when importing another', () => {
		const firstFontUrl = 'https://fonts.googleapis.com/css2?family=First:wght@100&display=swap'
		const secondFontUrl = 'https://fonts.googleapis.com/css2?family=Second:wght@100&display=swap'

		FontImporter.import(firstFontUrl)
		FontImporter.import(secondFontUrl)

		expect(getStylesContent()).toContain(`@import '${firstFontUrl}';`)
		expect(getStylesContent()).toContain(`@import '${secondFontUrl}';`)
	})
})