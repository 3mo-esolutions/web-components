import { isServer } from '@a11d/lit'

/**
 * A utility class for importing fonts globally.
 *
 * @ssr true
 */
export class FontImporter {
	private static readonly styleElement = isServer ? undefined : document.createElement('style')

	static {
		if (FontImporter.styleElement) {
			document.head.appendChild(FontImporter.styleElement)
		}
	}

	private static readonly urls = new Set<string>()

	/** Imports a font from a URL if it hasn't been imported yet. */
	static import(fontUrl: string) {
		if (FontImporter.urls.has(fontUrl)) {
			return
		}

		FontImporter.urls.add(fontUrl)

		const importStatements = [...FontImporter.urls].map(url => `@import '${url}';`)

		if (FontImporter.styleElement) {
			FontImporter.styleElement.innerHTML = importStatements.join('\n')
		}
	}
}