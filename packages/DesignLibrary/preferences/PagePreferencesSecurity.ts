import { html, component } from '@a11d/lit'
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
			<mo-page heading='Sicherheit' headerHidden>
				<mo-flex gap='6px'>
					<mo-checkbox-list-item
						?selected=${DialogDeletion.deletionConfirmation.value}
						@change=${(e: CustomEvent<boolean>) => DialogDeletion.deletionConfirmation.value = e.detail}
					>Vor dem Löschen bestätigen</mo-checkbox-list-item>

					<mo-checkbox-list-item
						?selected=${BusinessSuiteDialogAuthenticator.shallRememberStorage.value}
						@change=${(e: CustomEvent<boolean>) => BusinessSuiteDialogAuthenticator.shallRememberStorage.value = e.detail}
					>Passwort merken & eingeloggt bleiben</mo-checkbox-list-item>

					${!Authentication.hasAuthenticator() ? html.nothing : html`
						<mo-list-item @click=${() => Authentication['authenticator']?.resetPassword()}>Passwort ändern</mo-list-item>
					`}
				</mo-flex>
			</mo-page>
		`
	}
}