import { BackgroundStorage } from './Background.js'
import { AccentStorage } from './Accent.js'

/**
 * Utilities to control the theme of the application.
 *
 * @ssr true
 */
export class Theme {
	static readonly background = new BackgroundStorage
	static readonly accent = new AccentStorage
}

globalThis.Theme = Theme

declare global {
	var Theme: typeof import('./Theme.js').Theme
}