import { BackgroundStorage } from './Background.js'
import { AccentStorage } from './Accent.js'

export class Theme {
	static readonly background = new BackgroundStorage
	static readonly accent = new AccentStorage
}