export class FontImporter {
	private static readonly styleElement = document.createElement('style')

	static { document.head.appendChild(FontImporter.styleElement) }

	private static readonly urls = new Set<string>()

	/** Imports a font from a URL if it hasn't been imported yet. */
	static import(fontUrl: string) {
		FontImporter.urls.add(fontUrl)

		const importStatements = [...FontImporter.urls].map(url => `@import '${url}';`)

		if (importStatements.some(statement => FontImporter.styleElement.innerText.includes(statement) === false)) {
			FontImporter.styleElement.innerHTML = importStatements.join('\n')
		}
	}
}