import { html, component, nothing } from '@a11d/lit'
import { DialogDeletion } from '@3mo/standard-dialogs'
import { PagePreferences, PageSettings } from './index.js'
import { route } from '@a11d/lit-application'
import { Authentication } from '@a11d/lit-application-authentication'
import { BusinessSuiteDialogAuthenticator } from '../BusinessSuiteDialogAuthenticator.js'

@component('mo-page-preferences-security')
@route(PagePreferences, '/preferences/security')
export class PagePreferencesSecurity extends PageSettings {
	protected override get template() {
		return html`
			<mo-page heading='Sicherheit'>
				<mo-flex gap='6px'>
					<mo-checkbox-list-item
						?checked=${DialogDeletion.deletionConfirmation.value}
						@change=${(e: CustomEvent<CheckboxValue>) => DialogDeletion.deletionConfirmation.value = e.detail === 'checked'}
					>Vor dem Löschen bestätigen</mo-checkbox-list-item>

					<mo-checkbox-list-item
						?checked=${BusinessSuiteDialogAuthenticator.shallRememberStorage.value}
						@change=${(e: CustomEvent<CheckboxValue>) => BusinessSuiteDialogAuthenticator.shallRememberStorage.value = e.detail === 'checked'}
					>Passwort merken & eingeloggt bleiben</mo-checkbox-list-item>

					${!Authentication.hasAuthenticator() ? nothing : html`
						<mo-list-item @click=${() => Authentication['authenticator']?.resetPassword()}>Passwort ändern</mo-list-item>
					`}
				</mo-flex>
			</mo-page>
		`
	}
}