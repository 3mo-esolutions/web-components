import { bind, html, state, style } from '@a11d/lit'
import { DialogAuthenticator } from '@a11d/lit-application-authentication'
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
	'Show Password': 'Passwort anzeigen',
	'Reset Password': 'Passwort zurücksetzen',
	'Welcome': 'Willkommen',
	'Login': 'Anmelden'
})

export type User = {
	name?: string
	email?: string
}

export abstract class BusinessSuiteAuthenticationDialogComponent extends DialogAuthenticator<User> {
	static readonly authenticatedUserStorage = new LocalStorage<object | undefined>('DialogAuthenticator.User', undefined)

	protected abstract requestPasswordReset(): Promise<void>

	@state() primaryButtonText = t('Login')

	@state() revealPassword = false

	protected override get template() {
		return html`
			<mo-business-suite-authentication-dialog ${style({ '--mdc-dialog-scrim-color': 'var(--mo-color-background)' })}>
				<mo-anchor slot='footer' ${style({ fontSize: 'small' })} @click=${() => this.resetPassword()}>${t('Reset Password')}</mo-anchor>
				<mo-loading-button slot='primaryAction' type='raised'>${this.primaryButtonText}</mo-loading-button>
				${this.additionalTemplate}
				<mo-flex alignItems='center' gap='40px'>
					${this.logoTemplate}
					${this.applicationInfoTemplate}
					${this.contentTemplate}
				</mo-flex>
			</mo-business-suite-authentication-dialog>
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
			<mo-application-logo tabindex='-1'
				${style({ height: '100px', maxWidth: '75%', padding: '15px 0 0 0', pointerEvents: 'none' })}
			></mo-application-logo>
		`
	}

	protected get contentTemplate() {
		return html`
			<mo-flex gap='var(--mo-thickness-l)' ${style({ flex: '1', width: '100%', paddingBottom: '25px' })}>
				<mo-field-text autofocus
					label=${t('Username')}
					${bind(this, 'username', { event: 'input' })}
				></mo-field-text>

				<mo-field-password label=${t('Password')}
					?reveal=${this.revealPassword}
					${bind(this, 'password', { event: 'input' })}
				></mo-field-password>

				<mo-flex direction='horizontal' justifyContent='space-between' alignItems='center' wrap='wrap-reverse'>
					<mo-checkbox label=${t('Remember Password')} ${bind(this, 'shallRememberPassword')}></mo-checkbox>
					<mo-checkbox label=${t('Show Password')} ${bind(this, 'revealPassword')}></mo-checkbox>
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
		BusinessSuiteAuthenticationDialogComponent.authenticatedUserStorage.value = user
		return user
	}

	override async unauthenticate() {
		await super.unauthenticate()
		BusinessSuiteAuthenticationDialogComponent.authenticatedUserStorage.value = undefined
	}
}