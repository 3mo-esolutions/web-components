import { Component, component, css, html, isServer, join, property } from '@a11d/lit'
import { MutationController } from '@3mo/mutation-observer'
import '@3mo/theme'

export type KeyPresentation = Partial<Record<'apple' | 'other', { display: string, label?: string }>>

/**
 * @element mo-key
 *
 * @ssr true
 *
 * A keyboard key visualization. The shortcut is written as content using the `KeyboardEvent.key` vocabulary
 * where `+` combines keys into a chord and whitespace separates independent keys:
 * - `<mo-key>Meta+K</mo-key>` renders as `⌘K` on Apple platforms and `Ctrl + K` elsewhere.
 * - `<mo-key>ArrowUp ArrowDown</mo-key>` renders as two independent `↑` `↓` keys.
 * - `<mo-key>F5</mo-key>` renders verbatim like a native `kbd` element.
 *
 * `Meta` denotes the platform's primary modifier, i.e. `⌘` on Apple platforms and `Ctrl` elsewhere.
 * Modifiers are reordered to match the platform's convention (`⌃ ⌥ ⇧ ⌘` on Apple platforms, `Ctrl + Alt + Shift` elsewhere)
 * regardless of the authored order. Symbols are complemented by a visually hidden speakable label for screen readers.
 *
 * @attr platform - The platform to present the keys for. Defaults to the detected platform; override for previews or tests.
 * @attr separator - The visual separator between the keys of a chord. Defaults to the platform convention, i.e. none on Apple platforms and `+` elsewhere.
 *
 * @slot - The shortcut text.
 *
 * @cssprop --mo-key-color - The foreground color of the keycaps. Defaults to a slightly muted inherited color.
 * @cssprop --mo-key-background - The background color of the keycaps. Defaults to a tint of the inherited color.
 * @cssprop --mo-key-border-color - The border color of the keycaps, which also draws their bottom edge.
 * @cssprop --mo-key-font-family - The font of the legends. Defaults to the theme's `--mo-font-family-mono`.
 */
@component('mo-key')
export class Key extends Component {
	/** Presentations of known keys by their `KeyboardEvent.key` name. Extend or override to customize. */
	static readonly presentations = new Map<string, KeyPresentation>([
		['Meta', { apple: { display: '⌘', label: 'Command' }, other: { display: 'Ctrl', label: 'Control' } }],
		['Control', { apple: { display: '⌃', label: 'Control' }, other: { display: 'Ctrl', label: 'Control' } }],
		['Alt', { apple: { display: '⌥', label: 'Option' }, other: { display: 'Alt' } }],
		['Shift', { apple: { display: '⇧', label: 'Shift' }, other: { display: 'Shift' } }],
		['Enter', { apple: { display: '↵', label: 'Return' }, other: { display: 'Enter' } }],
		['Escape', { other: { display: 'Esc', label: 'Escape' } }],
		['Backspace', { apple: { display: '⌫', label: 'Delete' }, other: { display: 'Backspace' } }],
		['Delete', { apple: { display: '⌦', label: 'Forward Delete' }, other: { display: 'Del', label: 'Delete' } }],
		['Tab', { apple: { display: '⇥', label: 'Tab' }, other: { display: 'Tab' } }],
		['CapsLock', { apple: { display: '⇪', label: 'Caps Lock' }, other: { display: 'Caps Lock' } }],
		['Space', { other: { display: 'Space' } }],
		['ArrowUp', { other: { display: '↑', label: 'Up Arrow' } }],
		['ArrowDown', { other: { display: '↓', label: 'Down Arrow' } }],
		['ArrowLeft', { other: { display: '←', label: 'Left Arrow' } }],
		['ArrowRight', { other: { display: '→', label: 'Right Arrow' } }],
		['PageUp', { apple: { display: '⇞', label: 'Page Up' }, other: { display: 'PgUp', label: 'Page Up' } }],
		['PageDown', { apple: { display: '⇟', label: 'Page Down' }, other: { display: 'PgDn', label: 'Page Down' } }],
		['Home', { apple: { display: '↖', label: 'Home' } }],
		['End', { apple: { display: '↘', label: 'End' } }],
	])

	private static readonly modifiersOrder: Record<'apple' | 'other', Array<string>> = {
		apple: ['Control', 'Alt', 'Shift', 'Meta'],
		other: ['Meta', 'Control', 'Alt', 'Shift'],
	}

	/** The platform all keys are presented for unless overridden per element. Detected from the user agent. */
	static defaultPlatform: 'apple' | 'other' = !isServer && /Mac|iPhone|iPad|iPod/i.test(navigator.platform || navigator.userAgent) ? 'apple' : 'other'

	@property() platform = Key.defaultPlatform
	@property() separator?: string

	protected readonly mutationController = isServer ? undefined : new MutationController(this, {
		config: { characterData: true, childList: true, subtree: true },
	})

	private get chords() {
		const order = Key.modifiersOrder[this.platform]
		const orderOf = (key: string) => order.includes(key) ? order.indexOf(key) : order.length
		return (this.textContent ?? '')
			.trim()
			.replace(/\s*\+\s*/g, '+')
			.split(/\s+/)
			.map(chord => chord.split('+').filter(Boolean).sort((a, b) => orderOf(a) - orderOf(b)))
			.filter(chord => chord.length > 0)
	}

	private getPresentation(key: string) {
		const presentation = Key.presentations.get(key)
		const platformPresentation = presentation?.[this.platform] ?? presentation?.other
		return {
			display: platformPresentation?.display ?? (key.length === 1 ? key.toUpperCase() : key),
			label: platformPresentation?.label ?? platformPresentation?.display ?? key,
		}
	}

	/** The speakable representation announced to screen readers, e.g. "Command K". */
	get label() {
		return this.chords.map(chord => chord.map(key => this.getPresentation(key).label).join(' ')).join(', ')
	}

	static override get styles() {
		return css`
			:host {
				display: inline-flex;
				align-items: center;
				gap: 0.6em;
				vertical-align: middle;

				/* Derived from the inherited color so keys read correctly on any surface, in both light and dark themes. */
				--mo-key-color: color-mix(in srgb, currentColor 80%, transparent);
				--mo-key-background: color-mix(in srgb, currentColor 7%, transparent);
				--mo-key-border-color: color-mix(in srgb, currentColor 12%, transparent);
				--mo-key-font-family: var(--mo-font-family-mono);
			}

			.screen-reader-only {
				position: absolute;
				width: 1px;
				height: 1px;
				overflow: hidden;
				clip-path: inset(50%);
				white-space: nowrap;
			}

			.chord {
				display: inline-flex;
				align-items: center;
				gap: 0.3em;
			}

			kbd {
				display: grid;
				place-items: center;
				box-sizing: border-box;
				min-width: 1.85em;
				height: 1.85em;
				padding-inline: 0.5em;
				white-space: nowrap;
				font-family: var(--mo-key-font-family);
				/* Monochrome presentation, so a glyph resolved from an emoji font does not arrive colored. */
				font-variant-emoji: text;
				font-size: 0.78em;
				/* A legend is engraved, not emphasized, so it stays at a medium weight rather than a bold one. */
				font-weight: 500;
				/* A keycap is a fixed plate, so the legend must not be positioned by the font's line box. */
				line-height: 1;
				color: var(--mo-key-color);
				background: var(--mo-key-background);
				border: 1px solid var(--mo-key-border-color);
				border-radius: var(--mo-border-radius);
			}

			.separator {
				font-size: 0.8em;
				opacity: 0.5;
			}
		`
	}

	protected override get template() {
		const separator = this.separator ?? (this.platform === 'apple' ? '' : '+')
		const separatorTemplate = !separator ? html.nothing : html`<span class='separator'>${separator}</span>`
		return html`
			<slot hidden></slot>
			<span class='screen-reader-only'>${this.label}</span>
			${this.chords.map(chord => html`
				<span class='chord' aria-hidden='true'>
					${join(chord.map(key => html`<kbd>${this.getPresentation(key).display}</kbd>`), separatorTemplate)}
				</span>
			`)}
		`
	}
}

declare global {
	interface HTMLElementTagNameMap {
		'mo-key': Key
	}
}