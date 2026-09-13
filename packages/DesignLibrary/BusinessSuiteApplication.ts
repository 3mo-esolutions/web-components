import { css, html, ifDefined, type HTMLTemplateResult } from '@a11d/lit'
import { Application, PwaHelper } from '@a11d/lit-application'
import { Localizer } from '@3mo/localization'
import { Icon, IconVariant } from '@3mo/icon'
import { Authentication, BusinessSuiteAuthenticationDialogComponent, type INavigation, type NavigationPresentation, type User } from './index.js'

Icon.defaultVariant = IconVariant.Sharp

Localizer.dictionaries.add('de', {
	'Close': 'Schließen',
	'Open as Tab': 'Als Tab öffnen',
	'Cancel': 'Abbrechen',
	'Expand': 'Erweitern',
	'Collapse': 'Reduzieren',
	'Loading': 'Lädt',
	'Navigation': 'Navigation',
})

export abstract class BusinessSuiteApplication extends Application {
	protected abstract get navigations(): Array<INavigation>

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
			${this.topLayerTemplate}
		`
	}

	/** Whether the application is presented with its navigation around the page, rather than with the page alone. */
	protected get navigationShown() {
		return window.locationbar.visible
	}

	/** Which presentations the navigation may take, most preferred first. */
	protected get navigationPresentations(): Array<NavigationPresentation> {
		return ['bar', 'drawer']
	}

	protected get navigationHeading(): string | HTMLTemplateResult | undefined {
		return manifest?.short_name
	}

	protected get navigationTemplate() {
		return !this.navigationShown ? this.pageHostTemplate : html`
			<mo-navigation
				.navigations=${this.navigations}
				.presentations=${this.navigationPresentations}
				.heading=${this.navigationHeading}
			>
				<mo-application-logo slot='logo'></mo-application-logo>
				${this.navigationContentTemplate}
				${this.pageHostTemplate}
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
			<mo-user-avatar slot='end'
				name=${ifDefined((BusinessSuiteAuthenticationDialogComponent.authenticatedUserStorage.value as User)?.name)}
				email=${ifDefined((BusinessSuiteAuthenticationDialogComponent.authenticatedUserStorage.value as User)?.email)}
				style='color: var(--mo-color-on-accent); margin-inline-end: 0.875rem'
			>
				${this.userAvatarMenuItemsTemplate}
			</mo-user-avatar>
		`
	}

	protected get userAvatarMenuItemsTemplate() {
		return html.nothing
	}
}