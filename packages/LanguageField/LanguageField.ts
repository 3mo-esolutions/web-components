import { Component, event, html, ifDefined, property, css, style, type HTMLTemplateResult, state, query } from '@a11d/lit'
import { DialogLanguageField, type Language } from './index.js'
import { type DialogSize } from '@3mo/dialog'
import { type FieldPair, FieldPairMode } from '@3mo/field-pair'

export type LanguageFieldTemplateParameter<TValue, TLanguage extends Language = Language> = {
	readonly value: TValue
	readonly handleChange: (value: TValue) => void
	readonly label: string
	readonly language: TLanguage
}

/**
 * @attr mode
 * @attr valueKey
 * @attr label
 * @attr dialogSize
 * @attr dense
 * @attr value
 * @attr selectedLanguage
 * @attr defaultLanguage
 * @attr fieldTemplate
 * @attr optionTemplate
 *
 * @csspart dialog-icon-button - The icon button that opens the language selection dialog.
 *
 * @fires change
 * @fires languageChange
 * @fires languagesFetch
 */
export abstract class LanguageField<TValue, TLanguage extends Language> extends Component {
	static applyDefaultLanguageBehavior = true

	@event() readonly change!: EventDispatcher<Map<TLanguage, TValue | undefined>>
	@event() readonly languageChange!: EventDispatcher<TLanguage>
	@event() readonly languagesFetch!: EventDispatcher<Array<TLanguage>>

	@property() mode = FieldPairMode.Attach
	@property() label!: string
	@property() dialogSize?: DialogSize
	@property({ type: Boolean }) dense = false
	@property({ type: Object, bindingDefault: true }) value = new Map<TLanguage, TValue | undefined>()
	@property({ type: Object, event: 'languageChange' }) selectedLanguage?: TLanguage
	@property({ type: Object }) defaultLanguage?: TLanguage
	@property({ type: Object }) fieldTemplate?: (parameters: LanguageFieldTemplateParameter<TValue, TLanguage>) => HTMLTemplateResult
	@property({ type: Object }) optionTemplate?: (language: TLanguage) => HTMLTemplateResult

	@state() protected _languages = new Array<TLanguage>()
	get languages() { return this._languages }

	@query('mo-field-pair') protected readonly fieldPairElement?: FieldPair

	get fieldElement(): HTMLElement {
		return (this.fieldPairElement ?? this.renderRoot).querySelector(':not([slot])')!
	}

	protected abstract fetch(): Promise<Array<TLanguage>>

	get getFieldTemplate() {
		return this.fieldTemplate
	}

	get getOptionTemplate() {
		return this.optionTemplate
	}

	protected override initialized() {
		this.fetchLanguages()
	}

	protected async fetchLanguages() {
		this._languages = await this.fetch()
		this.languagesFetch.dispatch(this._languages)
		if (!this.selectedLanguage) {
			const languageToSelect = this.getLanguageToSelectOnFirstFetch(this._languages)
			this.handleLanguageChange(languageToSelect)
		}
		this.defaultLanguage ??= this._languages[0]
	}

	protected getLanguageToSelectOnFirstFetch(languages: Array<TLanguage>) {
		return languages[0] as TLanguage
	}

	protected handleFieldChange(language: TLanguage, value: TValue) {
		this.value.set(language, value)
		this.change.dispatch(this.value)

		if (LanguageField.applyDefaultLanguageBehavior) {
			if (!!value &&
				language === this.defaultLanguage &&
				[...this.value].filter(([language]) => language !== this.defaultLanguage).every(v => v === undefined)
			) {
				this._languages.forEach(lang => this.value.set(lang, value))
			}
		}
	}

	override focus(...parameters: Parameters<HTMLElement['focus']>) {
		super.focus(...parameters)
		this.fieldElement?.focus(...parameters)
	}

	static override get styles() {
		return css`
			mo-field-select {
				background-color: color-mix(in srgb, var(--mo-color-gray) 10%, transparent);
			}

			mo-field-select::part(container) {
				display: none;
			}

			:host([single]) mo-field-select::part(dropDownIcon) {
				display: none;
			}

			mo-field-pair {
				--mo-field-pair-attachment-width: 110px;
			}

			:host([single]) mo-field-pair {
				--mo-field-pair-attachment-width: 50px;
			}

			:host([single]) mo-field-select {
				pointer-events: none
			}
		`
	}

	protected override get template() {
		const single = this._languages.length === 1
		this.toggleAttribute('single', single)
		switch (true) {
			case !this.selectedLanguage:
				return html.nothing
			case single:
				return this.getFieldTemplateByLanguage(this.selectedLanguage)
			default:
				return html`
					<mo-field-pair mode=${this.mode} ${style({ height: '100%' })}>
						${this.getFieldTemplateByLanguage(this.selectedLanguage)}
						${this.languageSelectorTemplate}
					</mo-field-pair>
				`
		}
	}

	getFieldTemplateByLanguage(language: TLanguage) {
		return !this.getFieldTemplate ? html.nothing : this.getFieldTemplate({
			value: this.value.get(language)!,
			handleChange: value => this.handleFieldChange(language, value),
			label: this.label,
			language,
		})
	}

	async openDialog() {
		await new DialogLanguageField({ languageField: this }).confirm()
		this.requestUpdate()
	}

	protected get languageSelectorTemplate() {
		return html`
			${this._languages.length === 0 ? html.nothing : html`
				<mo-field-select slot='attachment' label='' menuAlignment='end'
					.data=${this.selectedLanguage}
					@dataChange=${(e: CustomEvent<TLanguage>) => this.handleLanguageChange(e.detail)}
				>
					<mo-flex slot='start' direction='horizontal' gap='4px'>
						${this.languageSelectorStartTemplate}
					</mo-flex>

					${this._languages.map(language => html`
						<mo-option .data=${language}>
							${this.getOptionTemplate ? this.getOptionTemplate(language) : html`
								${language.name}
								<img src=${ifDefined(language?.flagImageSource)} style='width: 30px'>
							`}
						</mo-option>
					`)}
				</mo-field-select>
			`}
		`
	}

	protected get languageSelectorStartTemplate() {
		return html`
			${this.dialogIconButtonTemplate}
			${this.flagTemplate}
		`
	}

	protected get dialogIconButtonTemplate() {
		return this._languages.length === 1 ? html.nothing : html`
			<mo-icon-button icon='launch' part='dialog-icon-button' ${style({ display: 'flex', alignItems: 'center' })}
				@click=${(e: PointerEvent) => { e.stopPropagation(); this.openDialog() }}
			></mo-icon-button>
		`
	}

	protected get flagTemplate() {
		return !this.selectedLanguage?.flagImageSource ? html.nothing : html`
			<img src=${ifDefined(this.selectedLanguage.flagImageSource)} ${style({ width: '30px', marginInlineStart: this._languages.length < 2 ? '10px' : '0px' })}>
		`
	}

	protected handleLanguageChange(language: TLanguage) {
		this.selectedLanguage = language
		this.languageChange.dispatch(language)
	}
}