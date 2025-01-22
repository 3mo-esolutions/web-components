import { Component, component, event, html, property, css } from '@a11d/lit'
import { tooltip } from '@3mo/tooltip'
import { Localizer } from '@3mo/localization'
import { contextMenu } from '@3mo/context-menu'

Localizer.dictionaries.add('de', {
	'Refetch': 'Neu laden',
	'automatically every ${seconds:string}': 'automatisch alle ${seconds:string}',
	'Off': 'Aus',
})

/**
 * @fires requestFetch
 * @fires autoRefetchChange
 */
@component('mo-fetchable-data-grid-refetch-icon-button')
export class FetchableDataGridRefetchIconButton extends Component {
	private static readonly refetchOptions = [5, 10, 30, 60]

	@event() readonly requestFetch!: EventDispatcher<void>

	@property({ type: Boolean }) fetching = false

	@event() readonly autoRefetchChange!: EventDispatcher<number | undefined>
	@property({ type: Number }) autoRefetch?: number

	static override get styles() {
		return css`
			mo-grid {
				color: var(--mo-color-gray);

				&[data-fetching] {
					color: var(--mo-color-accent);
				}

				mo-icon-button {
					grid-area: 1 / 1;
					&[data-selected] {
						animation: rotate 1500ms ease-in-out infinite;
					}
				}

				span {
					grid-area: 1 / 1;
					place-self: end end;
					font-size: 0.65rem;
					font-weight: 700;
				}
			}

			@keyframes rotate {
				from { transform: rotate(0deg); }
				to { transform: rotate(360deg); }
			}
		`
	}

	override get template() {
		const tooltipText = [
			t('Refetch'),
			!this.autoRefetch ? undefined : t('automatically every ${seconds:string}', { seconds: this.autoRefetch.formatAsUnit('second', { unitDisplay: 'long' }) })
		].filter(Boolean).join(' - ')
		return html`
			<mo-grid ?data-fetching=${this.fetching}>
				<mo-icon-button icon='sync'
					${tooltip(tooltipText)}
					?data-selected=${this.fetching}
					@click=${() => this.requestFetch.dispatch()}
					${contextMenu(() => html`
						<style>
							mo-context-menu-item {
								&::part(icon) {
									font-size: 18px;
									opacity: 0;
								}

								&[data-selected]::part(icon) {
									opacity: 0.75;
								}
							}
						</style>
						${[undefined, ...FetchableDataGridRefetchIconButton.refetchOptions].map(seconds => html`
							<mo-context-menu-item icon='done'
								?data-selected=${this.autoRefetch === seconds}
								@click=${() => { this.autoRefetch = seconds; this.autoRefetchChange.dispatch(seconds) }}
							>
								${seconds?.formatAsUnit('second', { unitDisplay: 'narrow' }) ?? t('Off')}
							</mo-context-menu-item>
						`)}
					`)}
				></mo-icon-button>
				${!this.autoRefetch ? html.nothing : html`
					<span>${this.autoRefetch.format()}</span>
				`}
			</mo-grid>
		`
	}
}

declare global {
	interface HTMLElementTagNameMap {
		'mo-fetchable-data-grid-refetch-icon-button': FetchableDataGridRefetchIconButton
	}
}