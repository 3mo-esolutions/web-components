import { css, property, state, Component, html, query, queryAll, type HTMLTemplateResult, LitElement, live, style, unsafeCSS } from '@a11d/lit'
import { equals } from '@a11d/equals'
import { DirectionsByLanguage, Localizer } from '@3mo/localization'
import { popover } from '@3mo/popover'
import { tooltip } from '@3mo/tooltip'
import { ContextMenu } from '@3mo/context-menu'
import { ReorderabilityState } from '@3mo/reorderability'
import { type DataGridColumn } from '../DataGridColumn.js'
import { type DataGridCell, DataGridPrimaryContextMenuItem, type DataRecord } from '../index.js'

Localizer.dictionaries.add('de', {
	'Reordering is unavailable while the grid is sorted.': 'Die Reihenfolge kann nicht geändert werden, solange die Tabelle sortiert ist.',
	'Clear sorting': 'Sortierung zurücksetzen'
})

export abstract class DataGridRow<TData, TDetailsElement extends Element | undefined = undefined> extends Component {
	@queryAll('mo-data-grid-cell') readonly cells!: Array<DataGridCell<any, TData, TDetailsElement>>
	@queryAll('[mo-data-grid-row]') readonly subRows!: Array<DataGridRow<TData, TDetailsElement>>
	@query('#contentContainer') readonly content!: HTMLElement
	@query('#detailsContainer') private readonly detailsContainer?: HTMLSlotElement

	@property({ type: Boolean }) isIntersecting = true

	@property({ type: Object }) dataRecord!: DataRecord<TData>
	get dataGrid() { return this.dataRecord.dataGrid }
	get data() { return this.dataRecord.data }
	get index() { return this.dataRecord.index }
	get level() { return this.dataRecord.level }
	get selected() { return this.dataRecord.isSelected }
	get detailsOpen() { return this.dataRecord.detailsOpen }

	/**
	 * Whether the details are closed but still rendered, so that they can animate out.
	 * They are dropped afterwards, as details can be arbitrarily expensive to keep alive.
	 */
	@state() private detailsCollapsing = false
	private dataBeforeUpdate?: TData
	private detailsOpenBeforeUpdate = false
	private detailsCollapseKey = 0

	get detailsElement() {
		return this.renderRoot.querySelector('#detailsContainer')?.firstElementChild as TDetailsElement as TDetailsElement | undefined
	}

	getCell(column: DataGridColumn<TData>) {
		return this.cells.find(cell => cell.column[equals](column))
	}

	override connected() {
		if ((this.index ?? 0) < 25) {
			this.isIntersecting = true
		}
	}

	protected override initialized() {
		this.toggleAttribute('mo-data-grid-row', true)
		this.dataGrid.rowIntersectionObserver?.observe(this)
	}

	protected override disconnected() {
		this.dataGrid.rowIntersectionObserver?.unobserve?.(this)
	}

	protected override willUpdate(...parameters: Parameters<Component['willUpdate']>) {
		if (this.hasDetails) {
			// The data instead of the record, as the grid hands out a new record for the same data on every render.
			if (this.data !== this.dataBeforeUpdate) {
				// A recycled row picks up the state of its new data instead of animating out the previous one's details.
				this.detailsCollapseKey++
				this.detailsCollapsing = false
			} else if (this.detailsOpen === false && this.detailsOpenBeforeUpdate === true) {
				this.collapseDetails()
			} else if (this.detailsOpen === true) {
				this.detailsCollapseKey++
				this.detailsCollapsing = false
			}

			this.dataBeforeUpdate = this.data
			this.detailsOpenBeforeUpdate = this.detailsOpen
		}

		super.willUpdate(...parameters)
	}

	private async collapseDetails() {
		const key = ++this.detailsCollapseKey
		this.detailsCollapsing = true
		await this.updateComplete
		const container = this.detailsContainer
		await Promise.race([
			// Rejects when the animation is cancelled, e.g. by the row leaving the viewport, hence "allSettled".
			Promise.allSettled(container?.getAnimations().map(animation => animation.finished) ?? []),
			// An animation which does not run at all - be it a zeroed duration or a tab which is not being painted -
			// shall not keep the details alive either.
			new Promise(resolve => setTimeout(resolve, DataGridRow.getTransitionDuration(container))),
		])
		if (key === this.detailsCollapseKey) {
			this.detailsCollapsing = false
		}
	}

	private static getTransitionDuration(element?: Element) {
		const durations = !element ? [] : getComputedStyle(element).transitionDuration
			.split(',')
			.map(duration => parseFloat(duration) * 1000)
			.filter(duration => !Number.isNaN(duration))
		return Math.max(0, ...durations)
	}

	override updated(...parameters: Parameters<Component['updated']>) {
		this.cells.forEach(cell => cell.requestUpdate())
		this.subRows.forEach(subRow => subRow.requestUpdate())
		if (this.detailsElement instanceof LitElement) {
			this.detailsElement.requestUpdate()
		}
		super.updated(...parameters)
	}

	protected get hasDetails() {
		return this.dataGrid.detailsController.hasDetail(this.dataRecord)
	}

	static override get styles() {
		return css`
			:host {
				display: block;
				position: relative;
				height: auto;
				width: 100%;
				/*
				 * Establish a stacking context per row so the z-index of sticky cells/columns
				 * (e.g. z-index: 6 on sticky columns) stays scoped to the row. Without this, those
				 * z-indices resolve in the shared grid context and paint over the sticky header
				 * (z-index: 4) as rows scroll underneath it. isolation: isolate creates the context
				 * without affecting layout or sticky anchoring (which stays relative to the scroller).
				 */
				isolation: isolate;
			}

			/* Rows reorder in live mode: the grabbed row rides the pointer, so it LIFTS (opaque, over
			   its neighbours) instead of being ghosted in place, and the row order itself shows where
			   the drop lands — the insertion borders below are only reached in indicator mode. */
			:host([data-reorderability=${unsafeCSS(ReorderabilityState.Dragging)}]) {
				z-index: 3;
				background: var(--mo-color-surface);
				box-shadow: var(--mo-shadow);
				cursor: grabbing;
			}

			:host([data-reorderability=${unsafeCSS(ReorderabilityState.DropBefore)}]) {
				border-top: 2px solid var(--mo-color-accent);
			}

			:host([data-reorderability=${unsafeCSS(ReorderabilityState.DropAfter)}]) {
				border-bottom: 2px solid var(--mo-color-accent);
			}

			#reorderability {
				position: sticky;
				z-index: 2;
				width: var(--mo-data-grid-column-reorder-width);
				height: 100%;
				background: var(--mo-data-grid-sticky-part-color);

				mo-icon-button {
					cursor: grab;
					opacity: 0.5;
					&[disabled] {
						/* Keep the disabled handle hoverable so its explanatory tooltip can open. */
						pointer-events: auto;
						cursor: not-allowed;
					}
				}
			}

			#detailsExpanderContainer {
				position: sticky;
				z-index: 2;
				inset-inline-start: 0px;
				background: var(--mo-data-grid-sticky-expander-part-color, var(--mo-data-grid-sticky-part-color));
			}

			#selectionContainer {
				width: var(--mo-data-grid-column-selection-width);
				position: sticky;
				z-index: 2;
				height: 100%;
				background: var(--mo-data-grid-sticky-part-color);
			}

			:host(:hover) {
				#contentContainer {
					--mo-data-grid-sticky-part-color: color-mix(in srgb, var(--mo-color-surface), var(--mo-data-grid-selection-background) 50%) !important;
					color: inherit;
					background: color-mix(in srgb, var(--mo-data-grid-selection-background), transparent 50%) !important;
				}

				#contentContainer, #detailsContainer {
					&::before {
						content: '';
						width: 2px;
						height: 100%;
						top: 0;
						position: absolute;
						background-color: var(--mo-color-accent);
						z-index: 2;
					}
				}
			}

			:host([data-has-alternating-background]) {
				#contentContainer, #detailsContainer:not(:has([instanceof*=mo-data-grid])) {
					background: var(--mo-data-grid-alternating-background);
					--mo-data-grid-sticky-part-color: light-dark(
						color-mix(in srgb, var(--mo-color-surface), black 5%),
						color-mix(in srgb, var(--mo-color-surface), black 20%)
					);
				}
			}

			#contentContainer {
				grid-column: -1 / 1;
				border-block-end: var(--mo-data-grid-border);
			}

			#contextMenuIconButtonContainer {
				height: 100%;
				place-self: end;
				position: sticky;
				inset-inline-end: 0px;
				z-index: 3;
				background: var(--mo-data-grid-sticky-part-color);
			}

			#contextMenuIconButton {
				opacity: 0.5;
				color: var(--mo-color-gray);
			}

			/*
			 * Don't use nested selector such as below to prevent Safari bugs
			 * :host([selected]), :host([data-context-menu-open]) {
			 *   #contentContainer {...}
			 * }
			 */

			:host([selected]) #contentContainer,
			:host([data-context-menu-open]) #contentContainer {
				--mo-data-grid-sticky-part-color: var(--mo-data-grid-selection-background) !important;
				background: var(--mo-data-grid-selection-background) !important;
			}

			:host([selected]) #contextMenuIconButton,
			:host([data-context-menu-open]) #contextMenuIconButton {
				color: currentColor;
				opacity: 1;
			}

			#contentContainer:hover #contextMenuIconButton {
				color: currentColor;
				opacity: 1;
			}

			#detailsExpanderIconButton {
				height: var(--mo-data-grid-row-height);
				transition: transform 250ms;

				&[data-rtl] {
					transform: rotate(180deg);
				}
			}

			:host([detailsOpen]) #detailsExpanderIconButton {
				transform: rotate(90deg);
			}

			#detailsContainer {
				display: grid;
				grid-template-columns: subgrid;
				grid-column: -1 / 1;

				interpolate-size: allow-keywords;
				/*
					"clip" instead of "hidden", as the latter would make this a scroll container, to which the
					sticky cells of nested rows would then anchor instead of to the grid's own scroller.
				*/
				overflow: clip;
				transition:
					height var(--mo-duration-quick, 250ms) ease,
					opacity var(--mo-duration-quick, 250ms) ease,
					content-visibility var(--mo-duration-quick, 250ms) allow-discrete;

				/* The details are rendered only while open, hence they animate in from the state they are inserted with. */
				@starting-style {
					height: 0;
					opacity: 0;
				}

				/* Stays rendered until the animation has run, after which the row drops the details altogether. */
				&[data-collapsed] {
					height: 0;
					opacity: 0;
					content-visibility: hidden;
					pointer-events: none;
				}

				&:empty {
					display: none;
				}

				& > * {
					grid-column: data / -1;
					box-sizing: border-box;
					padding-inline: var(--mo-data-grid-cell-padding);
					padding-block: 1rem;

					&[mo-data-grid-row] {
						grid-column: -1 / 1;
						padding: 0;
					}

					&[instanceof*=mo-data-grid] {
						padding-inline: 0;
						--mo-data-grid-header-background: color-mix(in srgb, var(--mo-color-foreground), transparent 96%);
						--mo-data-grid-alternating-background: transparent;
						--_content-min-height-default: auto;
					}
				}
			}

			mo-data-grid-cell:first-of-type:not([alignment=end]), mo-data-grid-cell[alignment=end]:first-of-type + mo-data-grid-cell {
				margin-inline-start: calc(var(--_level, 0) * var(--mo-data-grid-column-sub-row-indentation, 20px));
			}
		`
	}

	protected override get template() {
		this.style.setProperty('--_level', this.level.toString())
		this.toggleAttribute('selected', this.dataRecord.isSelected)
		this.toggleAttribute('detailsOpen', this.dataRecord.detailsOpen)
		return !this.isIntersecting ? html.nothing : html`
			<mo-grid id='contentContainer' columns='subgrid'
				@click=${(e: MouseEvent) => this.handleContentClick(e)}
				@dblclick=${() => this.handleContentDoubleClick()}
				@auxclick=${(e: PointerEvent) => e.button !== 1 ? void 0 : this.handleContentMiddleClick()}
				${this.contextMenuTemplate === html.nothing ? html.nothing : popover(() => html`
					<mo-context-menu @openChange=${(e: CustomEvent<boolean>) => this.handleContextMenuOpenChange(e.detail)}>
						${this.contextMenuTemplate}
					</mo-context-menu>
				`)}
			>
				${this.rowTemplate}
			</mo-grid>
			<slot id='detailsContainer' ?data-collapsed=${this.hasDetails && !this.detailsOpen}>${this.detailsOpen || this.detailsCollapsing ? this.detailsTemplate : html.nothing}</slot>
		`
	}

	protected abstract get rowTemplate(): HTMLTemplateResult

	protected get reorderabilityTemplate() {
		const reorderability = this.dataGrid.reorderabilityController
		const disabled = !reorderability.enabled
		return !reorderability.visible ? html.nothing : html`
			<mo-flex id='reorderability' justifyContent='center' alignItems='center'
				${style({ insetInlineStart: this.dataGrid.columnsController.getStickyColumnInsetInline('reordering') })}
			>
				<mo-icon-button icon='drag_handle' ?disabled=${disabled}
					${!disabled ? html.nothing : tooltip(() => html`
						<mo-flex gap='0.5rem'>
							${t('Reordering is unavailable while the grid is sorted.')}
							<mo-anchor @click=${(e: Event) => { e.preventDefault(); this.dataGrid.sortingController.reset() }}>
								${t('Clear sorting')}
							</mo-anchor>
						</mo-flex>
					`)}
				></mo-icon-button>
			</mo-flex>
		`
	}

	protected get detailsExpanderTemplate() {
		return this.dataGrid.hasDetails === false ? html.nothing : html`
			<mo-flex id='detailsExpanderContainer' justifyContent='center' alignItems='center'
				${style({ insetInlineStart: this.dataGrid.columnsController.getStickyColumnInsetInline('details') })}
				@click=${(e: Event) => e.stopPropagation()}
				@dblclick=${(e: Event) => e.stopPropagation()}
			>
				${this.hasDetails === false ? html.nothing : html`
					<mo-icon-button id='detailsExpanderIconButton'
						icon='keyboard_arrow_right'
						?data-rtl=${DirectionsByLanguage.get() === 'rtl'}
						@click=${() => this.toggleDetails()}
					></mo-icon-button>
				`}
			</mo-flex>
		`
	}

	protected get selectionTemplate() {
		return !this.dataGrid.hasSelection ? html.nothing : html`
			<mo-flex id='selectionContainer' justifyContent='center' alignItems='center'
				?data-has-details=${this.dataGrid.hasDetails}
				${style({ insetInlineStart: this.dataGrid.columnsController.getStickyColumnInsetInline('selection') })}
				@click=${(e: Event) => e.stopPropagation()}
				@dblclick=${(e: Event) => e.stopPropagation()}
			>
				<mo-checkbox
					tabindex='-1'
					?disabled=${this.dataRecord.isSelectable === false}
					.selected=${live(this.selected)}
					@change=${(e: CustomEvent<boolean>) => this.dataGrid.selectionController.select(this.data, { selected: e.detail, preserve: true, event: e })}
				></mo-checkbox>
			</mo-flex>
		`
	}

	protected getCellTemplate(column: DataGridColumn<TData>) {
		return column.hidden ? html.nothing : html`
			<mo-data-grid-cell
				.row=${this as any}
				.column=${column}
				.value=${KeyPath.get(this.data, column.dataSelector as any)}
				@keydown=${this.delegateToCell('handleKeyDown')}
				@dblclick=${this.delegateToCell('handleDoubleClick')}
			></mo-data-grid-cell>
		`
	}

	private readonly delegateToCell = (method: 'handleDoubleClick' | 'handleKeyDown') => (e: Event) => {
		const target = e.target as DataGridCell<any, TData, TDetailsElement>
		target?.[method]?.(e as any)
	}

	protected get fillerTemplate() {
		return html`<span></span>`
	}

	protected get contextMenuIconButtonTemplate() {
		return this.dataGrid.hasContextMenu === false ? html.nothing : html`
			<mo-flex id='contextMenuIconButtonContainer' justifyContent='center'>
				<mo-icon-button id='contextMenuIconButton' icon='more_vert' dense
					@click=${this.openContextMenu}
					@dblclick=${(e: Event) => e.stopPropagation()}
				></mo-icon-button>
			</mo-flex>
		`
	}

	protected get detailsTemplate() {
		if (!this.hasDetails) {
			return html.nothing
		}

		if (this.dataGrid.getRowDetailsTemplate) {
			return this.dataGrid.getRowDetailsTemplate(this.data)
		}

		return !this.dataRecord.hasSubData ? html.nothing : html`
			${this.dataRecord.getSubDataByLevel(this.level + 1)?.map(data => this.dataGrid.getRowTemplate(data))}
		`
	}

	protected handleContentClick(event?: MouseEvent) {
		if (this.dataGrid.selectOnClick) {
			this.dataGrid.selectionController.select(this.data, { event })
		}

		if (this.dataGrid.detailsOnClick && this.dataGrid.hasDetails) {
			this.toggleDetails()
		}

		this.dataGrid.rowClick.dispatch(this)
	}

	protected async handleContentDoubleClick() {
		await this.clickOnPrimaryContextMenuItemIfApplicable()
		this.dataGrid.rowDoubleClick.dispatch(this)
	}

	protected async handleContentMiddleClick() {
		await this.clickOnPrimaryContextMenuItemIfApplicable()
		this.dataGrid.rowMiddleClick.dispatch(this)
	}

	private async clickOnPrimaryContextMenuItemIfApplicable() {
		if (this.dataGrid.hasContextMenu === true && this.dataGrid.primaryContextMenuItemOnDoubleClick === true) {
			await this.openContextMenu()
			ContextMenu.openInstance?.items.find(item => item instanceof DataGridPrimaryContextMenuItem && !item.disabled)?.click()
			await this.closeContextMenu()
		}
	}

	async openContextMenu(event?: PointerEvent) {
		if (this.dataGrid.hasContextMenu) {
			event?.stopPropagation()
			this.content?.dispatchEvent(new MouseEvent('contextmenu', event))

			// We need this only for testing environments, but should not be necessary.
			this.handleContextMenuOpenChange(true)

			await this.updateComplete
		}
	}

	protected handleContextMenuOpenChange(open: boolean) {
		this.toggleAttribute('data-context-menu-open', open)

		if (this.dataRecord.isSelected === false) {
			this.dataGrid.select([this.data])
		}
	}

	private get contextMenuTemplate() {
		return this.dataGrid.contextMenuController.getMenuContentTemplate(
			!this.dataGrid.selectability || !this.dataGrid.selectedData.length || !this.dataRecord.isSelected
				? [this.data]
				: this.dataGrid.selectedData
		)
	}

	async closeContextMenu() {
		ContextMenu.openInstance?.close()
		await this.updateComplete
	}

	toggleDetails() {
		this.dataGrid.detailsController.toggle(this.dataRecord)
		if (this.dataRecord.detailsOpen) {
			this.dataGrid.rowDetailsOpen.dispatch(this)
		} else {
			this.dataGrid.rowDetailsClose.dispatch(this)
		}
	}
}