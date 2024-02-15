import { html, component, style } from '@a11d/lit'
import { PageComponent, RouterController, route, routerLink } from '@a11d/lit-application'
import { DialogReleaseNotes, PagePreferencesSecurity, PagePreferencesUserInterface } from '../index.js'

@component('mo-page-preferences')
@route('/preferences/:page?')
export class PagePreferences extends PageComponent {
	readonly router = new RouterController(this, [], {
		fallback: {
			render: () => html`
				<mo-empty-state icon='touch_app'>
					${t('Select a page')}
				</mo-empty-state>
			`
		}
	})

	protected override get template() {
		return html`
			<mo-page fullHeight heading='Benutzereinstellungen' headerHidden>
				<mo-split-page-host>
					<mo-card slot='sidebar' ${style({ height: '100%', '--mo-card-body-padding': '0px' })}>
						<mo-flex ${style({ height: '100%' })} gap='var(--mo-thickness-xl)' justifyContent='space-between'>
							<mo-list>
								<mo-navigation-list-item icon='palette' ${routerLink(new PagePreferencesUserInterface)}>
									Design & Aussehen
								</mo-navigation-list-item>
								<mo-navigation-list-item icon='security' ${routerLink(new PagePreferencesSecurity)}>
									Sicherheit
								</mo-navigation-list-item>
							</mo-list>

							${!manifest ? html.nothing : html`
								<mo-flex direction='horizontal' alignItems='center' justifyContent='center' ${style({ color: 'var(--mo-color-gray)', padding: 'var(--mo-thickness-l)' })}>
									<mo-heading typography='heading6'>${manifest.name} v${manifest.version}</mo-heading>
									${!Changelog ? html.nothing : html`<mo-icon-button dense icon='info' ${style({ color: 'var(--mo-color-accent)' })} @click=${() => new DialogReleaseNotes().confirm()}></mo-icon-button>`}
								</mo-flex>
							`}
						</mo-flex>
					</mo-card>
					${this.router.outlet()}
				</mo-split-page-host>
			</mo-page>
		`
	}
}