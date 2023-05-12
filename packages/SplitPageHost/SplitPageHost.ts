import { html, css, property, style, component, Component } from '@a11d/lit'
import { Localizer, LanguageCode } from '@3mo/localization'

Localizer.register(LanguageCode.German, {
	'Select a page': 'Wählen Sie eine Seite'
})

/**
 * @element mo-split-page-host
 *
 * @attr isContentOpen - Whether the content page is open
 * @attr contentPageHeading - The heading of the content page
 *
 * @slot - The content page
 * @slot sidebar - The sidebar slot
 *
 * @i18n "Select a page"
 */
@component('mo-split-page-host')
export class SplitPageHost extends Component {
	@property({ type: Boolean, reflect: true }) isContentOpen = false

	@property({
		updated(this: SplitPageHost) {
			if (this.contentPageHeading) {
				this.isContentOpen = true
			}
		}
	}) contentPageHeading?: string

	static override get styles() {
		return css`
			lit-page-host *::part(pageHeader) {
				display: none;
			}

			lit-page-host {
				padding: 0 14px;
			}

			lit-page-host::part(pageHolder) {
				min-height: 100%;
			}

			mo-grid {
				width: 100%;
				height: 100%;
				grid-template-columns: var(--mo-split-page-host-sidebar-width, clamp(200px, 30%, 500px)) 1fr;
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

				:host([isContentOpen]) #sidebar {
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

	protected override get template() {
		return html`
			<mo-grid ${style({ height: '100%' })}>
				<mo-flex id='sidebar'>
					<slot name='sidebar'></slot>
				</mo-flex>
				<mo-flex id='content'>${this.contentTemplate}</mo-flex>
			</mo-grid>
		`
	}

	protected get contentTemplate() {
		return html`
			<mo-flex gap='6px' ${style({ flex: '1' })}>
				${this.contentToolbarTemplate}
				<lit-page-host ${style({ flex: '1' })} @pageHeadingChange=${(e: CustomEvent<string>) => this.contentPageHeading = e.detail}>
					<slot></slot>
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

declare global {
	interface HTMLElementTagNameMap {
		'mo-split-page-host': SplitPageHost
	}
}