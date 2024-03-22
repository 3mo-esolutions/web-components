/**
 * A simple keyboard controller which tracks the pressed special keys (ctrl, alt, shift, meta).
 *
 * @ssr true
 */
export class KeyboardController {
	private static _ctrl = false
	static get ctrl() { return this._ctrl }

	private static _shift = false
	static get shift() { return this._shift }

	private static _alt = false
	static get alt() { return this._alt }

	private static _meta = false
	static get meta() { return this._meta }

	private static setUsingEvent(e: KeyboardEvent) {
		this._ctrl = e.ctrlKey
		this._shift = e.shiftKey
		this._alt = e.altKey
		this._meta = e.metaKey
	}

	static {
		window?.addEventListener('keydown', e => this.setUsingEvent(e))
		window?.addEventListener('keyup', e => this.setUsingEvent(e))
		window?.addEventListener('blur', () => [this._ctrl, this._shift, this._alt, this._meta] = [false, false, false, false])
	}
}