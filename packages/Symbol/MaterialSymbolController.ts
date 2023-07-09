export const enum SymbolVariant {
	Outlined = 'outlined',
	Sharp = 'sharp',
	Rounded = 'rounded',
}

export class MaterialSymbolController {
	private static readonly fontStyleElement = document.createElement('style')
	private static readonly fontUrls = new Set<string>()
	private static readonly fontUrlByVariant = new Map<SymbolVariant, string>([
		[SymbolVariant.Outlined, 'https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@20..48,100..700,0..1,-50..200'],
		[SymbolVariant.Sharp, 'https://fonts.googleapis.com/css2?family=Material+Symbols+Sharp:opsz,wght,FILL,GRAD@20..48,100..700,0..1,-50..200'],
		[SymbolVariant.Rounded, 'https://fonts.googleapis.com/css2?family=Material+Symbols+Rounded:opsz,wght,FILL,GRAD@20..48,100..700,0..1,-50..200'],
	])

	ensureFontsAvailable(variant: SymbolVariant) {
		const fontUrl = MaterialSymbolController.fontUrlByVariant.get(variant)
		const fontName = `Material Symbols ${variant}`
		if (fontUrl) {
			const fontAvailable = document.fonts.check(`0 ${fontName}`)
			if (!fontAvailable) {
				MaterialSymbolController.fontUrls.add(fontUrl)
				MaterialSymbolController.fontStyleElement.innerHTML = [...MaterialSymbolController.fontUrls].map(url => `@import '${url}';`).join('\n')
				document.head.appendChild(MaterialSymbolController.fontStyleElement)
			}
		}
	}
}