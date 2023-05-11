import { html, component, style, nothing } from '@a11d/lit'
import { route, routerLink } from '@a11d/lit-application'
import { DialogReleaseNotes, PagePreferencesSecurity, PagePreferencesUserInterface } from '../index.js'
import { PageSettingsHost } from './PageSettingsHost.js'

@component('mo-page-preferences')
@route('/preferences/:page?')
export class PagePreferences extends PageSettingsHost {
	protected get heading() { return 'Benutzereinstellungen' }

	protected get settingsTemplate() {
		return html`
			<mo-card ${style({ height: '100%', '--mo-card-body-padding': '0px' })}>
				<mo-flex ${style({ height: '100%' })} gap='var(--mo-thickness-xl)' justifyContent='space-between'>
					<mo-list>
						<mo-navigation-list-item icon='palette' ${routerLink(new PagePreferencesUserInterface)}>
							Design & Aussehen
						</mo-navigation-list-item>
						<mo-navigation-list-item icon='security' ${routerLink(new PagePreferencesSecurity)}>
							Sicherheit
						</mo-navigation-list-item>
					</mo-list>

					${!manifest ? nothing : html`
						<mo-flex direction='horizontal' alignItems='center' justifyContent='center' ${style({ color: 'var(--mo-color-gray)', padding: 'var(--mo-thickness-l)' })}>
							<mo-heading typography='heading6'>${manifest.name} v${manifest.version}</mo-heading>
							${!Changelog ? nothing : html`<mo-icon-button dense icon='info' ${style({ color: 'var(--mo-color-accent)' })} @click=${() => new DialogReleaseNotes().confirm()}></mo-icon-button>`}
						</mo-flex>
					`}
				</mo-flex>
			</mo-card>
		`
	}
}