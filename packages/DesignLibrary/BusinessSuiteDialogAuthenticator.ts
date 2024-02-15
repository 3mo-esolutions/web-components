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
	'Show Password': 'Passwort anzeigen',
	'Reset Password': 'Passwort zurücksetzen',
	'Welcome': 'Willkommen',
	'Login': 'Anmelden'
})

export type User = {
	name?: string
	email?: string
}

const isMobileOrTablet = () => {
	return /(android|bb\d+|meego).+mobile|avantgo|bada\/|blackberry|blazer|compal|elaine|fennec|hiptop|iemobile|ip(hone|od)|iris|kindle|lge |maemo|midp|mmp|mobile.+firefox|netfront|opera m(ob|in)i|palm( os)?|phone|p(ixi|re)\/|plucker|pocket|psp|series(4|6)0|symbian|treo|up\.(browser|link)|vodafone|wap|windows ce|xda|xiino|android|ipad|playbook|silk/i.test(navigator.userAgent)
  	|| /1207|6310|6590|3gso|4thp|50[1-6]i|770s|802s|a wa|abac|ac(er|oo|s\-)|ai(ko|rn)|al(av|ca|co)|amoi|an(ex|ny|yw)|aptu|ar(ch|go)|as(te|us)|attw|au(di|\-m|r |s )|avan|be(ck|ll|nq)|bi(lb|rd)|bl(ac|az)|br(e|v)w|bumb|bw\-(n|u)|c55\/|capi|ccwa|cdm\-|cell|chtm|cldc|cmd\-|co(mp|nd)|craw|da(it|ll|ng)|dbte|dc\-s|devi|dica|dmob|do(c|p)o|ds(12|\-d)|el(49|ai)|em(l2|ul)|er(ic|k0)|esl8|ez([4-7]0|os|wa|ze)|fetc|fly(\-|_)|g1 u|g560|gene|gf\-5|g\-mo|go(\.w|od)|gr(ad|un)|haie|hcit|hd\-(m|p|t)|hei\-|hi(pt|ta)|hp( i|ip)|hs\-c|ht(c(\-| |_|a|g|p|s|t)|tp)|hu(aw|tc)|i\-(20|go|ma)|i230|iac( |\-|\/)|ibro|idea|ig01|ikom|im1k|inno|ipaq|iris|ja(t|v)a|jbro|jemu|jigs|kddi|keji|kgt( |\/)|klon|kpt |kwc\-|kyo(c|k)|le(no|xi)|lg( g|\/(k|l|u)|50|54|\-[a-w])|libw|lynx|m1\-w|m3ga|m50\/|ma(te|ui|xo)|mc(01|21|ca)|m\-cr|me(rc|ri)|mi(o8|oa|ts)|mmef|mo(01|02|bi|de|do|t(\-| |o|v)|zz)|mt(50|p1|v )|mwbp|mywa|n10[0-2]|n20[2-3]|n30(0|2)|n50(0|2|5)|n7(0(0|1)|10)|ne((c|m)\-|on|tf|wf|wg|wt)|nok(6|i)|nzph|o2im|op(ti|wv)|oran|owg1|p800|pan(a|d|t)|pdxg|pg(13|\-([1-8]|c))|phil|pire|pl(ay|uc)|pn\-2|po(ck|rt|se)|prox|psio|pt\-g|qa\-a|qc(07|12|21|32|60|\-[2-7]|i\-)|qtek|r380|r600|raks|rim9|ro(ve|zo)|s55\/|sa(ge|ma|mm|ms|ny|va)|sc(01|h\-|oo|p\-)|sdk\/|se(c(\-|0|1)|47|mc|nd|ri)|sgh\-|shar|sie(\-|m)|sk\-0|sl(45|id)|sm(al|ar|b3|it|t5)|so(ft|ny)|sp(01|h\-|v\-|v )|sy(01|mb)|t2(18|50)|t6(00|10|18)|ta(gt|lk)|tcl\-|tdg\-|tel(i|m)|tim\-|t\-mo|to(pl|sh)|ts(70|m\-|m3|m5)|tx\-9|up(\.b|g1|si)|utst|v400|v750|veri|vi(rg|te)|vk(40|5[0-3]|\-v)|vm40|voda|vulc|vx(52|53|60|61|70|80|81|83|85|98)|w3c(\-| )|webc|whit|wi(g |nc|nw)|wmlb|wonu|x700|yas\-|your|zeto|zte\-/i.test(navigator.userAgent.slice(0, 4))
}

export abstract class BusinessSuiteDialogAuthenticator extends DialogAuthenticatorBase<User> {
	static readonly authenticatedUserStorage = new LocalStorage<object | undefined>('DialogAuthenticator.User', undefined)

	protected abstract requestPasswordReset(): Promise<void>

	@state() primaryButtonText = t('Login')

	@state() previewPassword = isMobileOrTablet()

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
			<mo-application-logo tabindex='-1'
				${style({ height: '100px', maxWidth: '75%', padding: '15px 0 0 0', pointerEvents: 'none' })}
			></mo-application-logo>
		`
	}

	protected get contentTemplate() {
		return html`
			<mo-flex gap='var(--mo-thickness-l)' ${style({ flex: '1', width: '100%', paddingBottom: '25px' })}>
				<mo-field-text data-focus
					label=${t('Username')}
					.value=${this.username}
					@input=${(e: CustomEvent<string>) => this.username = e.detail}
				></mo-field-text>

				<mo-field-password
					label=${t('Password')}
					.value=${this.password}
					?preview=${this.previewPassword}
					@input=${(e: CustomEvent<string>) => this.password = e.detail}
				></mo-field-password>

				<mo-checkbox label=${t('Show Password')}
					?selected=${this.previewPassword}
					@change=${(e: CustomEvent<boolean>) => this.previewPassword = e.detail}
				></mo-checkbox>

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