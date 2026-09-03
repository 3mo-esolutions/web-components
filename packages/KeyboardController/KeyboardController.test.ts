import { KeyboardController } from './KeyboardController.js'

describe('KeyboardController', () => {
	const modifiers = [
		{ modifier: 'ctrl', init: { ctrlKey: true } },
		{ modifier: 'shift', init: { shiftKey: true } },
		{ modifier: 'alt', init: { altKey: true } },
		{ modifier: 'meta', init: { metaKey: true } },
	] as const

	beforeEach(() => window.dispatchEvent(new Event('blur')))
	afterEach(() => window.dispatchEvent(new Event('blur')))

	for (const { modifier, init } of modifiers) {
		it(`should report ${modifier} as pressed on keydown`, () => {
			expect(KeyboardController[modifier]).toBeFalse()

			window.dispatchEvent(new KeyboardEvent('keydown', init))

			expect(KeyboardController[modifier]).toBeTrue()
		})
	}

	for (const { modifier, init } of modifiers) {
		it(`should report ${modifier} as released on keyup`, () => {
			window.dispatchEvent(new KeyboardEvent('keydown', init))

			window.dispatchEvent(new KeyboardEvent('keyup'))

			expect(KeyboardController[modifier]).toBeFalse()
		})
	}

	it('should reset all modifiers when the window loses focus', () => {
		window.dispatchEvent(new KeyboardEvent('keydown', { ctrlKey: true, shiftKey: true, altKey: true, metaKey: true }))
		expect([KeyboardController.ctrl, KeyboardController.shift, KeyboardController.alt, KeyboardController.meta]).toEqual([true, true, true, true])

		window.dispatchEvent(new Event('blur'))

		expect([KeyboardController.ctrl, KeyboardController.shift, KeyboardController.alt, KeyboardController.meta]).toEqual([false, false, false, false])
	})
})