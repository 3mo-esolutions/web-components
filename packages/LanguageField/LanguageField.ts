import { Component, event, html, ifDefined, property, css, style, HTMLTemplateResult, state } from '@a11d/lit'
import { DialogLanguageField, type Language } from './index.js'
import { DialogSize } from '@3mo/dialog'
import { FieldPairMode } from '@3mo/field-pair'

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
 * @fires change
 * @fires languageChange
 * @fires languagesFetch
 */
export abstract class LanguageField<TValue, TLanguage extends Language> extends Component {
	static applyDefaultLanguageBehavior = true

	@event() readonly change!: EventDispatcher<Map<TLanguage[keyof TLanguage], TValue | undefined>>
	@event() readonly languageChange!: EventDispatcher<TLanguage>
	@event() readonly languagesFetch!: EventDispatcher<Array<TLanguage>>

	@property() mode = FieldPairMode.Attach
	@property() valueKey: keyof TLanguage = 'id'
	@property() label!: string
	@property() dialogSize?: DialogSize
	@property({ type: Boolean }) dense = false
	@property({ type: Object }) value = new Map<TLanguage[keyof TLanguage], TValue | undefined>()
	@property({ type: Object }) selectedLanguage?: TLanguage
	@property({ type: Object }) defaultLanguage?: TLanguage
	@property({ type: Object }) fieldTemplate?: (value: TValue, handleChange: (value: TValue) => void, label: string, language: TLanguage) => HTMLTemplateResult
	@property({ type: Object }) optionTemplate?: (language: TLanguage) => HTMLTemplateResult

	@state() protected _languages = new Array<TLanguage>()
	get languages() { return this._languages }

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

	handleFieldChange(language: TLanguage, value: TValue) {
		this.value.set(language[this.valueKey], value)
		this.change.dispatch(this.value)

		if (LanguageField.applyDefaultLanguageBehavior) {
			if (!!value &&
				language === this.defaultLanguage &&
				[...this.value].filter(([key]) => key !== this.defaultLanguage?.[this.valueKey]).every(v => v === undefined)
			) {
				this._languages.forEach(lang => this.value.set(lang[this.valueKey], value))
			}
		}
	}

	static override get styles() {
		return css`
			mo-field-select::part(container) {
				display: none;
			}

			:host([single]) mo-field-select::part(dropDownIcon) {
				display: none;
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
		return !this.selectedLanguage ? html.nothing : html`
			<mo-field-pair mode=${this.mode} ${style({ height: '100%' })}>
				${this.getFieldTemplateByLanguage(this.selectedLanguage)}
				${this.languageSelectorTemplate}
			</mo-field-pair>
		`
	}

	getFieldTemplateByLanguage(language: TLanguage) {
		return !this.getFieldTemplate ? html.nothing : this.getFieldTemplate(
			this.value.get(language?.[this.valueKey]!)!,
			value => this.handleFieldChange(language, value),
			this.label,
			language
		)
	}

	async openDialog() {
		await new DialogLanguageField({ languageField: this }).confirm()
		this.requestUpdate()
	}

	protected get languageSelectorTemplate() {
		return html`
			${this._languages.length === 0 ? html.nothing : html`
				<mo-field-select slot='attachment' label='' ?dense=${this.dense} menuAlignment='end'
					value=${ifDefined(this.selectedLanguage?.[this.valueKey])}
					@change=${(e: CustomEvent<TLanguage[keyof TLanguage]>) => this.handleLanguageChange(this._languages.find(l => l[this.valueKey] === e.detail) as TLanguage)}
				>
					<mo-flex slot='start' direction='horizontal' gap='4px'>
						${this.languageSelectorStartTemplate}
					</mo-flex>

					${this._languages.map(language => html`
						<mo-option value=${language[this.valueKey]} .data=${language}>
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
			${this._languages.length === 1 ? html.nothing : html`
				<mo-icon-button icon='launch' ${style({ display: 'flex', alignItems: 'center' })} @click=${(e: PointerEvent) => { e.stopPropagation(); this.openDialog() }}></mo-icon-button>
			`}
			${this.flagTemplate}
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