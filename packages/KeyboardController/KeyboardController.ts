export class KeyboardController {
	private static _ctrl = false
	static get ctrl() { return this._ctrl }

	private static _shift = false
	static get shift() { return this._shift }

	private static _alt = false
	static get alt() { return this._alt }

	private static _meta = false
	static get meta() { return this._meta }

	static {
		window.addEventListener('keydown', e => {
			KeyboardController._ctrl = e.ctrlKey
			KeyboardController._shift = e.shiftKey
			KeyboardController._alt = e.altKey
			KeyboardController._meta = e.metaKey
		})

		window.addEventListener('keyup', e => {
			KeyboardController._ctrl = e.ctrlKey
			KeyboardController._shift = e.shiftKey
			KeyboardController._alt = e.altKey
			KeyboardController._meta = e.metaKey
		})

		window.addEventListener('blur', () => {
			KeyboardController._ctrl = false
			KeyboardController._shift = false
			KeyboardController._alt = false
			KeyboardController._meta = false
		})
	}
}