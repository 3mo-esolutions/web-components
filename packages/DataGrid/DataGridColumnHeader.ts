import { bind, Component, component, css, html, join, property, style, unsafeCSS, type HTMLTemplateResult } from '@a11d/lit'
import { tooltip } from '@3mo/tooltip'
import { Localizer } from '@3mo/localization'
import { ResizeController } from '@3mo/resize-observer'
import type { DataGridColumn } from './DataGridColumn.js'
import { DataGridSortingStrategy } from './DataGridSortingController.js'
import { ReorderabilityState } from './DataGridReorderabilityController.js'

Localizer.dictionaries.add('de', {
	'Sorting': 'Sortierung',
	'Sort descending': 'Absteigend sortieren',
	'Sort ascending': 'Aufsteigend sortieren',
	'Stickiness': 'Fixierung',
	'Stick to start': 'Anfang fixieren',
	'Stick to both': 'Beide fixieren',
	'Stick to end': 'Ende fixieren',
	'Hide': 'Ausblenden',
})

@component('mo-data-grid-column-header')
export class DataGridColumnHeader extends Component {
	@property({ type: Object }) column!: DataGridColumn<unknown>
	@property({ type: Boolean, reflect: true }) menuOpen = false

	static override get styles() {
		return css`
			:host {
				display: flex;
				position: relative;
				padding: 0 var(--mo-data-grid-cell-padding);
				transition: background 0.1s;
				anchor-name: --mo-data-grid-column-header;
			}

			:host([data-reorderability=${unsafeCSS(ReorderabilityState.Dragging)}]) {
				opacity: 0.5;
			}

			:host([data-reorderability=${unsafeCSS(ReorderabilityState.DropBefore)}]) {
				border-inline-start: 3px solid var(--mo-color-accent);
			}

			:host([data-reorderability=${unsafeCSS(ReorderabilityState.DropAfter)}]) {
				border-inline-end: 3px solid var(--mo-color-accent);
			}

			:host(:hover) {
				background: color-mix(in srgb, var(--mo-color-surface), var(--mo-color-gray) 8%);
			}

			:host([data-sticky]) {
				position: sticky;
			}

			:host([data-sticky]) /*[data-sticking]*/ {
				z-index: 6;
				background: var(--mo-data-grid-sticky-part-color);
			}

			:host([data-sticky-edge~=end]) {
				border-inline-end: 1px solid var(--mo-color-transparent-gray-3);
				box-shadow: var(--mo-shadow);
				clip-path: inset(0px -15px 0px 0px);
			}

			:host([data-sticky-edge~=start]) {
				border-inline-start: 1px solid var(--mo-color-transparent-gray-3);
				box-shadow: var(--mo-shadow);
				clip-path: inset(0px 0px 0px -15px);
			}

			:host([data-sticky-edge="start end"]) {
				clip-path: inset(0px -15px 0px -15px);
			}

			mo-data-grid-header-separator {
				z-index: 5;
			}

			:host([data-sticky]) /*[data-sticking]*/ mo-data-grid-header-separator {
				z-index: 7;
			}

			#container {
				transition: margin-inline-end 0.1s;
			}

			#content {
				display: inline-block;
				overflow: hidden !important;
				color: var(--mo-color-foreground);
				font-weight: 500;
				line-height: var(--mo-data-grid-header-height);
				white-space: nowrap;
				text-overflow: ellipsis;
				user-select: none;
				width: 100%;
			}

			#sort {
				position: relative;

				&[data-preview] {
					display: none;
				}

				mo-icon-button {
					transition: 0.1s;
					font-size: 20px;
					color: var(--mo-color-accent);
				}

				span {
					position: absolute;
					inset-inline-end: 0;
					inset-block-end: 0;
					color: var(--mo-color-accent);
					border-radius: 50%;
					width: fit-content;
					user-select: none;
					font-size: 0.8rem;
					aspect-ratio: 1 / 1;
					display: flex;
					align-items: center;
					justify-content: center;
				}
			}

			:host(:hover) #sort[data-preview] {
				display: flex;
				mo-icon-button {
					color: var(--mo-color-gray);
					opacity: 0.5;
				}
			}

			#menu-icon {
				position: absolute;
				inset-inline-end: calc(var(--mo-data-grid-cell-padding) - 6px);
				inset-block-start: 2px;
				opacity: 0;
				font-size: 20px;
				transition: 0.1s;
			}

			:host(:hover), :host([menuOpen]) {
				#container {
					margin-inline-end: 20px;
				}

				#menu-icon {
					opacity: 1;
				}
			}

			mo-menu {
				position-anchor: --mo-data-grid-column-header;

				&::part(popover) {
					margin-inline-start: 4px;
				}

				mo-heading {
					padding: 0.5rem 1rem;
					opacity: 0.5;
				}
			}
		`
	}

	readonly resizeController = new ResizeController(this, {
		callback: () => requestIdleCallback(() => this.column.widthInPixels = this.getBoundingClientRect().width)
	})

	override get template() {
		if (this.column.sticky && !this.column.intersecting) {
			this.style.insetInline = this.column.stickyColumnInsetInline
		}

		this.toggleAttribute('data-sticking', this.column.intersecting === false)

		if (!this.column.sticky) {
			this.removeAttribute('data-sticky')
		} else {
			this.setAttribute('data-sticky', this.column.sticky)
		}
		const stickyEdge = this.column.stickyEdge
		stickyEdge ? this.setAttribute('data-sticky-edge', stickyEdge) : this.removeAttribute('data-sticky-edge')

		const direction = this.column.alignment === 'end' ? 'horizontal-reversed' : 'horizontal'

		return html`
			<mo-flex id='container' alignItems='center' gap='0.2rem'
				direction=${direction}
				@click=${() => this.column.toggleSort()}
				@contextmenu=${(e: Event) => { e.preventDefault(); this.menuOpen = true }}
				${style({ flex: '1', overflow: 'hidden' })}
			>
				${this.contentTemplate}
				${this.sortingTemplate}
			</mo-flex>
			${this.menuTemplate}
			${this.separatorTemplate}
		`
	}

	private get contentTemplate() {
		return html`
			<div id='content'
				${style({ textAlign: this.column.alignment })}
				${!this.column.description ? html.nothing : tooltip(this.column.description)}
			>${this.column.heading}</div>
		`
	}

	private get sortingTemplate() {
		const sortingDefinition = this.column.sortingDefinition
		const sortIcon = sortingDefinition?.strategy === DataGridSortingStrategy.Ascending ? 'arrow_upward' : 'arrow_downward'
		const sortingRank = !sortingDefinition || this.column.dataGrid.getSorting().length <= 1 ? undefined : sortingDefinition.rank
		return !this.column.sortable ? html.nothing : html`
			<mo-flex id='sort' direction='horizontal' ?data-preview=${!sortingDefinition?.strategy}>
				<mo-icon-button dense icon=${sortIcon}></mo-icon-button>
				${!sortingRank ? html.nothing : html`<span>${sortingRank}</span>`}
			</mo-flex>
		`
	}

	private get menuTemplate() {
		const additionalItems = this.column.getMenuItemsTemplate?.()
		return html`
			<mo-popover-container placement='block-end' alignment='end' style='display: contents'>
				<mo-icon-button dense id='menu-icon' icon='more_vert'></mo-icon-button>

				<mo-menu slot='popover' .anchor=${this} target='menu-icon' ?open=${bind(this, 'menuOpen')}>
					<mo-line></mo-line>
					${join([
						!this.column.sortable ? undefined : this.getSortingItemsTemplate(additionalItems instanceof Map ? additionalItems.get('sorting') : undefined),
						// Hide stickiness items for now
						true as boolean ? undefined : this.getStickinessItemsTemplate(additionalItems instanceof Map ? additionalItems.get('stickiness') : undefined),
						this.getMoreItemsTemplate(additionalItems instanceof Map ? additionalItems.get('more') : additionalItems),
					].filter(Boolean), html`<mo-line></mo-line>`)}
				</mo-menu>
			</mo-popover-container>
		`
	}

	private getSortingItemsTemplate(additionalItems?: HTMLTemplateResult) {
		return html`
			<mo-heading typography='subtitle2'>${t('Sorting')}</mo-heading>
			<mo-selectable-menu-item icon='arrow_downward'
				?disabled=${this.column.sortable === false}
				?selected=${this.column.sortingDefinition?.strategy === DataGridSortingStrategy.Descending}
				@click=${() => this.column.toggleSort(DataGridSortingStrategy.Descending)}
			>${t('Sort descending')}</mo-selectable-menu-item>
			<mo-selectable-menu-item icon='arrow_upward'
				?disabled=${this.column.sortable === false}
				?selected=${this.column.sortingDefinition?.strategy === DataGridSortingStrategy.Ascending}
				@click=${() => this.column.toggleSort(DataGridSortingStrategy.Ascending)}
			>${t('Sort ascending')}</mo-selectable-menu-item>
			${additionalItems}
		`
	}

	private getStickinessItemsTemplate(additionalItems?: HTMLTemplateResult) {
		return html`
			<mo-heading typography='subtitle2'>${t('Stickiness')}</mo-heading>
			<mo-selectable-menu-item icon='push_pin'
				?selected=${this.column.sticky === 'start'}
				@click=${() => this.column.toggleSticky('start')}
			>${t('Stick to start')}</mo-selectable-menu-item>
			<mo-selectable-menu-item icon='push_pin'
				?selected=${this.column.sticky === 'both'}
				@click=${() => this.column.toggleSticky('both')}
			>${t('Stick to both')}</mo-selectable-menu-item>
			<mo-selectable-menu-item icon='push_pin'
				?selected=${this.column.sticky === 'end'}
				@click=${() => this.column.toggleSticky('end')}
			>${t('Stick to end')}</mo-selectable-menu-item>
			${additionalItems}
		`
	}

	private getMoreItemsTemplate(additionalItems?: HTMLTemplateResult) {
		return html`
			<mo-menu-item icon='visibility_off' @click=${() => this.column.hide()}>
				${t('Hide')}
			</mo-menu-item>
			${additionalItems}
		`
	}

	private get separatorTemplate() {
		if (!this.column.dataGrid) {
			return html.nothing
		}

		const index = this.column.dataGrid.visibleColumns.indexOf(this.column)
		return html`
			<mo-data-grid-header-separator
				?data-last=${this.column.dataGrid.visibleColumns.length - 1 === index}
				.dataGrid=${this.column.dataGrid as any}
				.column=${this.column.dataGrid.visibleColumns[index]}
			></mo-data-grid-header-separator>
		`
	}
}

declare global {
	interface HTMLElementTagNameMap {
		'mo-data-grid-column-header': DataGridColumnHeader
	}
}