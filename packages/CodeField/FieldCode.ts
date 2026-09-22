import { component, css, html, property } from '@a11d/lit'
import { FieldComponent } from '@3mo/field'
import { Localizer } from '@3mo/localization'
import { SegmentedDisplayController } from '@3mo/segmented-input'

Localizer.dictionaries.add('de', {
	'Code': 'Code',
})

export type FieldCodeType = 'numeric' | 'alphanumeric' | 'alphabetic'

const patternsByType: Record<FieldCodeType, RegExp> = {
	numeric: /\d/u,
	alphanumeric: /[\p{L}\d]/u,
	alphabetic: /\p{L}/u,
}

/**
 * A short code entered one character per cell — a verification code, a one-time password, a PIN.
 *
 * The cells are a drawing: the value lives in one real input behind them, which is what lets a phone
 * offer the code it has just received, a password manager fill an authenticator code, and a pasted
 * code land in one go. A screen reader is handed that one input, named by the field's label, rather
 * than as many controls as there are characters.
 *
 * `input` follows every character. `change` reports the code once it settles, which for a value of a
 * known length is the moment its last character lands rather than the moment the field is left.
 *
 * @element mo-field-code
 *
 * @attr value - The characters entered so far
 * @attr length - How many characters the code has. Defaults to six.
 * @attr type - What the code is made of: "numeric" (default), "alphanumeric" or "alphabetic"
 * @attr pattern - A regular expression a character must match, in place of `type`
 * @attr separators - The positions a separator follows, e.g. "2" for "123-456"
 * @attr separator - The separator itself
 * @attr mask - Shown in place of every entered character, e.g. "•" for a PIN
 * @attr autoComplete - Defaults to "one-time-code". Set "off" for a code no phone should offer.
 *
 * @csspart label - The field's label
 * @csspart group - The row of cells
 * @csspart input - The input holding the value
 * @csspart cell - One character's cell
 * @csspart separator - A separator between two cells
 *
 * @i18n "Code"
 */
@component('mo-field-code')
export class FieldCode extends FieldComponent<string> {
	@property() override label = t('Code')
	@property() value?: string
	@property({ type: Number }) length = 6
	@property() type: FieldCodeType = 'numeric'
	@property() pattern?: string
	@property({ type: Array }) separators?: Array<number>
	@property() separator?: string
	@property() mask?: string
	@property() autoComplete?: string

	readonly display = new SegmentedDisplayController(this, host => ({
		get value() { return host.code },
		get length() { return host.length },
		get label() { return host._label },
		get mask() { return host.mask },
		get separators() { return host.separators },
		get separator() { return host.separator },
		get autocomplete() { return host.autoComplete },
		get inputMode() { return host.type === 'numeric' ? 'numeric' : 'text' },
		get disabled() { return host.disabled },
		get readonly() { return host.readonly },
		get required() { return host.required },
		get invalid() { return host.invalid },
		accept: character => host.accepts(character) ? character : undefined,
		handleInput: value => host.handleInput(value),
		handleChange: value => host.handleSettledValue(value),
	}))

	/** Completing the code and then leaving it settle the same value; only the first of them is a change. */
	private handleSettledValue(value: string) {
		if (value !== this.value) {
			this.handleChange(value)
		}
	}

	private accepts(character: string) {
		const pattern = this.pattern ? new RegExp(this.pattern, 'u') : patternsByType[this.type]
		return pattern.test(character)
	}

	/** What the cells draw: the code being typed, or else the committed one. */
	private get code() {
		return this.inputValue ?? this.value ?? ''
	}

	override get isPopulated() {
		return !!this.code
	}

	override focus() {
		this.display.focus()
	}

	private customValidity = ''

	override setCustomValidity(error: string) {
		this.customValidity = error
	}

	override async checkValidity() {
		await this.updateComplete
		return !this.customValidity && (!this.required || this.code.length === this.length)
	}

	override reportValidity() {
		this.focus()
	}

	static override get styles() {
		return css`
			:host {
				display: inline-flex;
				flex-direction: column;
				gap: 0.375rem;
			}

			[part=label] {
				color: var(--mo-color-gray);
				font-size: 0.875rem;
				user-select: none;

				&[data-invalid] {
					color: var(--mo-color-red);
				}

				&[data-disabled] {
					opacity: 0.5;
					pointer-events: none;
				}
			}

			[part=group] {
				position: relative;
				display: flex;
				align-items: center;
				gap: var(--mo-field-code-gap, 0.5rem);

				&[data-disabled] {
					opacity: 0.5;
					pointer-events: none;
				}
			}

			/* The input covers the cells so that every native gesture — caret, selection, paste, the
			   long-press menu — still lands on it, while what is seen is drawn behind. It stays visible
			   and merely colorless: a hidden input is not offered a code by the operating system. Its
			   selection is colorless too, or a selected code would show through the cells, which mark
			   the selected range themselves. */
			[part=input] {
				position: absolute;
				inset: 0;
				width: 100%;
				height: 100%;
				margin: 0;
				padding: 0;
				border: none;
				outline: none;
				background: transparent;
				color: transparent;
				caret-color: transparent;
				font: inherit;
				text-align: center;
				letter-spacing: 1em;

				&::selection {
					background: transparent;
					color: transparent;
				}

				&:disabled {
					cursor: not-allowed;
				}
			}

			[part=cell] {
				box-sizing: border-box;
				display: flex;
				align-items: center;
				justify-content: center;
				width: var(--mo-field-code-cell-width, 2.75rem);
				height: var(--mo-field-code-cell-height, 3.25rem);
				border: 1px solid var(--mo-color-gray-transparent);
				border-radius: var(--mo-border-radius);
				background: var(--mo-field-background, transparent);
				font-size: 1.5rem;
				user-select: none;
				transition: border-color 0.15s, box-shadow 0.15s;

				&[data-placeholder] {
					color: var(--mo-color-gray-transparent);
				}

				&[data-active] {
					border-color: var(--mo-color-accent);
					box-shadow: 0 0 0 1px var(--mo-color-accent);
				}

				&[data-invalid] {
					border-color: var(--mo-color-red);
				}
			}

			[part=separator] {
				color: var(--mo-color-gray-transparent);
				user-select: none;
			}
		`
	}

	protected override get template() {
		return html`
			${!this._label ? html.nothing : html`
				<span part='label' ?data-invalid=${this.invalid} ?data-disabled=${this.disabled} @click=${() => this.focus()}>${this._label}${this.required ? ' *' : ''}</span>
			`}
			${this.inputTemplate}
		`
	}

	protected override get inputTemplate() {
		return html`
			<div part='group' ?data-disabled=${this.disabled} ${this.display.group.ref()}>
				<input part='input' ${this.display.input.ref()}>
				${this.display.segments.map(segment => html`
					<span part=${segment.editable ? 'cell' : 'separator'} ?data-invalid=${segment.editable && this.invalid} ${this.display.segment.ref(segment)}></span>
				`)}
			</div>
		`
	}
}

declare global {
	interface HTMLElementTagNameMap {
		'mo-field-code': FieldCode
	}
}