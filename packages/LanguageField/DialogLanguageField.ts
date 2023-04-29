import { component, css, html, ifDefined } from '@a11d/lit'
import { DialogComponent } from '@a11d/lit-application'
import type { LanguageField, Language } from './index.js'

@component('mo-dialog-language-field')
export class DialogLanguageField<TValue, TLanguage extends Language> extends DialogComponent<{ readonly languageField: LanguageField<TValue, TLanguage> }> {
	static override get styles() {
		return css`
			mo-flex { padding: 6px 0; }
			img { padding-inline-end: 6px; }
		`
	}

	protected override get template() {
		return html`
			<mo-dialog heading=${this.parameters.languageField.label} primaryButtonText=${t('Apply')}>
				<mo-flex gap='4px'>
					${this.parameters.languageField.languages.map(language => html`
						<mo-grid columns='auto 1fr' alignItems='center' gap='4px'>
							<img src=${ifDefined(language?.flagImageSource)} style='width: 30px'>
							${this.parameters.languageField.getFieldTemplateByLanguage(language)}
						</mo-grid>
					`)}
				</mo-flex>
			</mo-dialog>
		`
	}

	protected override primaryAction() { }
}