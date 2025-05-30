import { css, html, ifDefined } from '@a11d/lit'
import { Application, PwaHelper, routerLink } from '@a11d/lit-application'
import { Localizer } from '@3mo/localization'
import { Icon, IconVariant } from '@3mo/icon'
import { Authentication, BusinessSuiteAuthenticationDialogComponent, PagePreferences, type NavigationDefinition, type User } from './index.js'

Icon.defaultVariant = IconVariant.Sharp

Localizer.dictionaries.add('de', {
	'User Settings': 'Benutzereinstellungen',
	'Close': 'Schließen',
	'Open as Tab': 'Als Tab öffnen',
	'Cancel': 'Abbrechen',
	'Expand': 'Erweitern',
	'Collapse': 'Reduzieren',
	'Loading': 'Lädt',
})

export abstract class BusinessSuiteApplication extends Application {
	protected abstract get navigations(): Array<NavigationDefinition>

	constructor() {
		super()
		PwaHelper.registerServiceWorker('/ServiceWorker.js')
	}

	static override get styles() {
		return css`
			@import 'https://fonts.googleapis.com/css2?family=Roboto:wght@400;500;700&display=swap';

			${super.styles}

			* {
				font-weight: 400;
				box-sizing: border-box;
			}

			:root {
				font-family: var(--mo-font-family);
				background-color: var(--mo-color-background);
				color: var(--mo-color-foreground);
			}
		`
	}

	protected override get template() {
		return html`
			${super.template}
			<mo-confetti></mo-confetti>
		`
	}

	protected override get pageLoadingTemplate() {
		return html`
			<mo-circular-progress style='width: 4rem; height: 4rem; margin: auto'></mo-circular-progress>
		`
	}

	protected override get bodyTemplate() {
		return html`
			${this.navigationTemplate}
			${super.bodyTemplate}
		`
	}

	private get navigationTemplate() {
		return !window.locationbar.visible ? html.nothing : html`
			<mo-navigation .navigations=${this.navigations}>
				${this.navigationContentTemplate}
			</mo-navigation>
		`
	}

	protected get navigationContentTemplate() {
		return html`
			${this.userAvatarTemplate}
		`
	}

	private get userAvatarTemplate() {
		return !Authentication.hasAuthenticator() ? html.nothing : html`
			<mo-user-avatar slot='navbar-end'
				name=${ifDefined((BusinessSuiteAuthenticationDialogComponent.authenticatedUserStorage.value as User)?.name)}
				email=${ifDefined((BusinessSuiteAuthenticationDialogComponent.authenticatedUserStorage.value as User)?.email)}
				style='color: var(--mo-color-on-accent); margin-inline-end: 0.875rem'
			>
				${this.userAvatarMenuItemsTemplate}
			</mo-user-avatar>
		`
	}

	protected get userAvatarMenuItemsTemplate() {
		return html`
			<mo-navigation-menu-item icon='manage_accounts'
				${routerLink({ component: new PagePreferences, matchMode: 'ignore-parameters' })}
			>${t('User Settings')}</mo-navigation-menu-item>
		`
	}
}