import { Component, event, html, ifDefined, property, css, nothing, style, HTMLTemplateResult, state } from '@a11d/lit'
import { DialogLanguageField, type Language } from './index.js'
import { FieldPairMode } from '@3mo/field-pair'

/**
 * @attr mode
 * @attr valueKey
 * @attr label
 * @attr value
 * @attr selectedLanguage
 * @attr defaultLanguage
 * @attr fieldTemplate
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
	@property({ type: Object }) value = new Map<TLanguage[keyof TLanguage], TValue | undefined>()
	@property({ type: Object }) selectedLanguage?: TLanguage
	@property({ type: Object }) defaultLanguage?: TLanguage
	@property({ type: Object }) fieldTemplate?: (value: TValue, handleChange: (value: TValue) => void, label: string, language: TLanguage) => HTMLTemplateResult

	@state() protected _languages = new Array<TLanguage>()
	get languages() { return this._languages }

	protected abstract fetch(): Promise<Array<TLanguage>>

	get getFieldTemplate() {
		return this.fieldTemplate
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
		`
	}

	protected override get template() {
		const single = this._languages.length === 1
		this.toggleAttribute('single', single)
		return !this.selectedLanguage ? nothing : html`
			<mo-field-pair mode=${this.mode} ${style({ height: '100%' })}>
				${this.getFieldTemplateByLanguage(this.selectedLanguage)}
				${this.languageSelectorTemplate}
			</mo-field-pair>
		`
	}

	getFieldTemplateByLanguage(language: TLanguage) {
		return !this.getFieldTemplate ? nothing : this.getFieldTemplate(
			this.value.get(language?.[this.valueKey]!)!,
			value => this.handleFieldChange(language, value),
			this.label,
			language
		)
	}

	protected get languageSelectorTemplate() {
		return html`
			${!this._languages.length ? nothing : html`
				<mo-field-select slot='attachment' label=''
					value=${ifDefined(this.selectedLanguage?.[this.valueKey])}
					@change=${(e: CustomEvent<TLanguage[keyof TLanguage]>) => this.handleLanguageChange(this._languages.find(l => l[this.valueKey] === e.detail) as TLanguage)}
				>
					<mo-flex slot='start' direction='horizontal' gap='4px'>
						${this.languageSelectorStartTemplate}
					</mo-flex>

					${this._languages.map(language => html`
						<mo-option value=${language[this.valueKey]} .data=${language}>
							<img src=${ifDefined(language?.flagImageSource)} style='width: 30px'>
							${language.name}
						</mo-option>
					`)}
				</mo-field-select>
			`}
		`
	}

	protected get languageSelectorStartTemplate() {
		return html`
			${this._languages.length === 1 ? nothing : html`
				<mo-icon-button icon='launch' ${style({ display: 'flex', alignItems: 'center' })} @click=${() => this.openDialog()}></mo-icon-button>
			`}
			${this.flagTemplate}
		`
	}

	protected get flagTemplate() {
		return !this.selectedLanguage?.flagImageSource ? nothing : html`
			<img src=${ifDefined(this.selectedLanguage.flagImageSource)} style='width: 30px'>
		`
	}

	protected handleLanguageChange(language: TLanguage) {
		this.selectedLanguage = language
		this.languageChange.dispatch(language)
	}

	protected async openDialog() {
		await new DialogLanguageField({ languageField: this }).confirm()
		this.requestUpdate()
	}
}