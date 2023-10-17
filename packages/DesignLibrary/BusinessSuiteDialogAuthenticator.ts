import { html, state, style } from '@a11d/lit'
import { DialogAuthenticator as DialogAuthenticatorBase } from '@a11d/lit-application-authentication'
import { Localizer } from '@3mo/localization'
import { LocalStorage } from '@a11d/local-storage'
import { NotificationComponent } from '@a11d/lit-application'

Localizer.register('de', {
	'Authenticated successfully': 'Erfolgreich authentifiziert',
	'Incorrect Credentials': 'Ungültige Anmeldeinformationen',
	'Password reset instructions have been sent to your email address': 'Anweisungen zum Zurücksetzen des Passworts wurden an Ihre E-Mail-Adresse gesendet',
	'Password could not be reset': 'Passwort konnte nicht zurückgesetzt werden',
	'Something went wrong. Try again.': 'Etwas ist schief gelaufen. Versuche nochmal.',
	'Username': 'Benutzer',
	'Password': 'Passwort',
	'Remember Password': 'Passwort merken',
	'Reset Password': 'Passwort zurücksetzen',
	'Welcome': 'Willkommen',
	'Login': 'Anmelden'
})

export type User = {
	name?: string
	email?: string
}

export abstract class BusinessSuiteDialogAuthenticator extends DialogAuthenticatorBase<User> {
	static readonly authenticatedUserStorage = new LocalStorage<object | undefined>('DialogAuthenticator.User', undefined)

	protected abstract requestPasswordReset(): Promise<void>

	@state() primaryButtonText = t('Login')

	protected override get template() {
		return html`
			<mo-dialog blocking primaryOnEnter ${style({ '--mdc-dialog-scrim-color': 'var(--mo-color-background)' })}>
				<mo-loading-button slot='primaryAction' type='raised'>${this.primaryButtonText}</mo-loading-button>
				${this.additionalTemplate}
				<mo-flex alignItems='center' gap='40px'>
					${this.logoTemplate}
					${this.applicationInfoTemplate}
					${this.contentTemplate}
				</mo-flex>
			</mo-dialog>
		`
	}

	protected get additionalTemplate() {
		return html.nothing
	}

	protected get applicationInfoTemplate() {
		return !manifest ? html.nothing : html`
			<mo-heading typography='subtitle1' ${style({ color: 'var(--mo-color-gray)' })}>
				${manifest.name} ${!manifest.version ? html.nothing : html`v${manifest.version}`}
			</mo-heading>
		`
	}

	protected get logoTemplate() {
		return html`
			<mo-application-logo ${style({ height: '100px', maxWidth: '75%', padding: '15px 0 0 0' })}></mo-application-logo>
		`
	}

	protected get contentTemplate() {
		return html`
			<mo-flex gap='var(--mo-thickness-l)' ${style({ height: '*', width: '100%', paddingBottom: '25px' })}>
				<mo-field-text data-focus
					label=${t('Username')}
					.value=${this.username}
					@input=${(e: CustomEvent<string>) => this.username = e.detail}
				></mo-field-text>

				<mo-field-password
					label=${t('Password')}
					.value=${this.password}
					@input=${(e: CustomEvent<string>) => this.password = e.detail}
				></mo-field-password>

				<mo-flex direction='horizontal' justifyContent='space-between' alignItems='center' wrap='wrap-reverse'>
					<mo-checkbox
						label=${t('Remember Password')}
						?selected=${this.shallRememberPassword}
						@change=${(e: CustomEvent<boolean>) => this.shallRememberPassword = e.detail}
					></mo-checkbox>

					<mo-anchor ${style({ fontSize: 'small' })} @click=${() => this.resetPassword()}>${t('Reset Password')}</mo-anchor>
				</mo-flex>
			</mo-flex>
		`
	}

	async resetPassword() {
		try {
			await this.requestPasswordReset()
			NotificationComponent.notifyInfo('Password reset instructions have been sent to your email address')
		} catch (error: any) {
			NotificationComponent.notifyError(error.message ?? 'Password could not be reset')
			throw error
		}
	}

	override async authenticate() {
		const user = await super.authenticate()
		BusinessSuiteDialogAuthenticator.authenticatedUserStorage.value = user
		return user
	}

	override async unauthenticate() {
		await super.unauthenticate()
		BusinessSuiteDialogAuthenticator.authenticatedUserStorage.value = undefined
	}
}