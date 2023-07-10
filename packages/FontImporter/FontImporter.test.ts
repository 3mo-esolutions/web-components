import { FontImporter } from './FontImporter.js'

describe('FontImporter', () => {
	const getStylesContent = () => [...document.head.querySelectorAll('style')].map(style => style.textContent).join('\n')

	it('should import the font', () => {
		const fontUrl = 'https://fonts.googleapis.com/css2?family=Roboto:wght@100&display=swap'

		expect(getStylesContent()).not.toContain(fontUrl)

		FontImporter.import(fontUrl)
		expect(getStylesContent()).toContain(fontUrl)
	})
})