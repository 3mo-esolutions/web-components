import { ComponentTestFixture } from '@a11d/lit-testing'
import { html } from '@a11d/lit'
import { type Key } from './Key.js'
// eslint-disable-next-line no-duplicate-imports
import './Key.js'

describe('Key', () => {
	const displayedKeysOf = (component: Key) => [...component.renderRoot.querySelectorAll('kbd')].map(kbd => kbd.textContent?.trim())
	const separatorsOf = (component: Key) => [...component.renderRoot.querySelectorAll('.separator')].map(separator => separator.textContent?.trim())

	describe('on apple platforms', () => {
		const fixture = new ComponentTestFixture<Key>(html`<mo-key platform='apple'>Shift+Meta+P</mo-key>`)

		it('should render symbols ordered by the platform convention without separators', () => {
			expect(displayedKeysOf(fixture.component)).toEqual(['⇧', '⌘', 'P'])
			expect(separatorsOf(fixture.component)).toEqual([])
		})

		it('should provide a speakable label', () => {
			expect(fixture.component.label).toBe('Shift Command P')
		})
	})

	describe('on other platforms', () => {
		const fixture = new ComponentTestFixture<Key>(html`<mo-key platform='other'>Shift+Meta+P</mo-key>`)

		it('should render the primary modifier as "Ctrl" ordered by the platform convention with "+" separators', () => {
			expect(displayedKeysOf(fixture.component)).toEqual(['Ctrl', 'Shift', 'P'])
			expect(separatorsOf(fixture.component)).toEqual(['+', '+'])
		})

		it('should provide a speakable label', () => {
			expect(fixture.component.label).toBe('Control Shift P')
		})
	})

	describe('content grammar', () => {
		const whitespaceChordFixture = new ComponentTestFixture<Key>(html`<mo-key platform='other'>Meta + K</mo-key>`)
		const independentKeysFixture = new ComponentTestFixture<Key>(html`<mo-key platform='other'>ArrowUp ArrowDown</mo-key>`)
		const lowercaseFixture = new ComponentTestFixture<Key>(html`<mo-key platform='other'>Meta+k</mo-key>`)
		const unknownKeyFixture = new ComponentTestFixture<Key>(html`<mo-key platform='other'>F5</mo-key>`)

		it('should forgive whitespace around "+"', () => {
			expect(whitespaceChordFixture.component.renderRoot.querySelectorAll('.chord').length).toBe(1)
			expect(displayedKeysOf(whitespaceChordFixture.component)).toEqual(['Ctrl', 'K'])
		})

		it('should render whitespace-separated keys as independent chords', () => {
			expect(independentKeysFixture.component.renderRoot.querySelectorAll('.chord').length).toBe(2)
			expect(displayedKeysOf(independentKeysFixture.component)).toEqual(['↑', '↓'])
			expect(separatorsOf(independentKeysFixture.component)).toEqual([])
		})

		it('should uppercase single characters', () => {
			expect(displayedKeysOf(lowercaseFixture.component)).toEqual(['Ctrl', 'K'])
		})

		it('should pass unknown keys through verbatim', () => {
			expect(displayedKeysOf(unknownKeyFixture.component)).toEqual(['F5'])
		})
	})

	describe('property "separator"', () => {
		const fixture = new ComponentTestFixture<Key>(html`<mo-key platform='apple' separator='+'>Meta+K</mo-key>`)

		it('should override the platform convention', () => {
			expect(separatorsOf(fixture.component)).toEqual(['+'])
		})
	})

	describe('keycaps', () => {
		const fixture = new ComponentTestFixture<Key>(html`<mo-key platform='other'>ArrowUp Backspace P</mo-key>`)

		it('should set the legends in the theme\'s monospace font, which draws arrows and symbols as proper glyphs', () => {
			const kbd = fixture.component.renderRoot.querySelector('kbd')!
			expect(getComputedStyle(fixture.component).getPropertyValue('--mo-key-font-family')).toContain('monospace')
			expect(getComputedStyle(kbd).fontFamily).toContain('monospace')
		})

		it('should lay the keycaps out as equally sized plates', () => {
			const [first, second] = [...fixture.component.renderRoot.querySelectorAll('kbd')]
			expect(first!.getBoundingClientRect().height).toBe(second!.getBoundingClientRect().height)
			expect(first!.getBoundingClientRect().top).toBe(second!.getBoundingClientRect().top)
		})
	})

	describe('content changes', () => {
		const fixture = new ComponentTestFixture<Key>(html`<mo-key platform='other'>Meta+K</mo-key>`)

		it('should re-render when the content changes', async () => {
			fixture.component.textContent = 'Alt+F4'
			await new Promise(resolve => setTimeout(resolve))
			await fixture.updateComplete
			expect(displayedKeysOf(fixture.component)).toEqual(['Alt', 'F4'])
		})
	})
})