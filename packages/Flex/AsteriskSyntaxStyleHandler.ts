import { type StyleEntry, styleHandler, type StyleHandler } from '@a11d/lit'

@styleHandler()
export class AsteriskSyntaxStyleHandler implements StyleHandler {
	private static readonly supportedKeys = new Set<string>(['width', 'height'])

	static readonly regex = /^\s*(0|[1-9][0-9]*)?\s*\*\s*$/
	static getProportion(value: string) {
		return Number(value.replace(AsteriskSyntaxStyleHandler.regex, '$1') || 1)
	}

	handles(_: HTMLElement, [key, value]: StyleEntry) {
		return AsteriskSyntaxStyleHandler.supportedKeys.has(key) && AsteriskSyntaxStyleHandler.regex.test(value)
	}

	apply(element: HTMLElement, [, value]: StyleEntry) {
		const proportion = AsteriskSyntaxStyleHandler.getProportion(value)
		element.style.flexGrow = String(proportion)
	}
}