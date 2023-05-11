import { html, css, property, TemplateResult, style } from '@a11d/lit'
import { PageComponent, PageParameters, RouterController } from '@a11d/lit-application'
import { Localizer, LanguageCode } from '@3mo/localization'

Localizer.register(LanguageCode.German, {
	'Select a page': 'Wählen Sie eine Seite'
})

export abstract class PageSettingsHost<T extends PageParameters = void> extends PageComponent<T> {
	readonly router = new RouterController(this, [], {
		fallback: {
			render: () => html`
				<mo-empty-state icon='touch_app'>
					${t('Select a page')}
				</mo-empty-state>
			`
		}
	})

	static override get styles() {
		return css`
			lit-page-host *::part(pageHeader) {
				display: none;
			}

			lit-page-host {
				padding: 0 var(--mo-thickness-xl);
			}

			lit-page-host::part(pageHolder) {
				min-height: 100%;
			}

			mo-grid {
				grid-template-columns: var(--mo-page-settings-host-sidebar-width, clamp(200px, 30%, 500px)) 1fr;
			}

			#contentToolbar {
				display: none;
				margin-inline-start: -12px;
				padding-bottom: 0px;
			}

			@media (max-width: 900px) {
				mo-grid {
					grid-template-columns: 1fr;
				}

				:host([isContentOpen]) #settings {
					display: none;
				}

				:host(:not([isContentOpen])) #content {
					display: none;
				}

				#contentToolbar {
					display: flex;
				}
			}
		`
	}

	protected abstract get heading(): string

	protected abstract get settingsTemplate(): TemplateResult

	@property({ type: Boolean, reflect: true }) isContentOpen = false

	@property({
		updated(this: PageSettingsHost<any>) {
			if (this.contentPageHeading) {
				this.isContentOpen = true
			}
		}
	}) contentPageHeading?: string

	protected override get template() {
		return html`
			<mo-page heading=${this.heading} fullHeight>
				<mo-grid ${style({ height: '100%' })}>
					<mo-flex id='settings'>${this.settingsTemplate}</mo-flex>
					<mo-flex id='content'>${this.contentTemplate}</mo-flex>
				</mo-grid>
			</mo-page>
		`
	}

	protected get contentTemplate() {
		return html`
			<mo-flex gap='6px' ${style({ height: '*' })}>
				${this.contentToolbarTemplate}
				<lit-page-host ${style({ height: '*' })} @pageHeadingChange=${(e: CustomEvent<string>) => this.contentPageHeading = e.detail}>
					${this.router.outlet()}
				</lit-page-host>
			</mo-flex>
		`
	}

	private get contentToolbarTemplate() {
		const icon = getComputedStyle(this).direction === 'rtl' ? 'arrow_forward' : 'arrow_back'
		return html`
			<mo-flex id='contentToolbar' gap='6px' alignItems='center' direction='horizontal'>
				<mo-icon-button icon=${icon} @click=${() => new (this.constructor as any)().navigate()}></mo-icon-button>
				<mo-heading typography='heading4'>${this.contentPageHeading}</mo-heading>
			</mo-flex>
		`
	}
}