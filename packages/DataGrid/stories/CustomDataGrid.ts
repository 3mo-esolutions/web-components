import { Component, component, css, html, state, style, type HTMLTemplateResult } from '@a11d/lit'
import { observeResize } from '@3mo/resize-observer'
import { DataGridColumn, DataGridController, DataGridEditability, DataGridSelectability, type DataRecord } from '@3mo/data-grid'
import { employees, roles, type Employee } from '../../../stories/index.js'

type EditableKey = 'city' | 'age' | 'role'

/** A grid of its own design: a plain `<table>` in the system colors, rendered from a `DataGridController`. */
@component('story-custom-data-grid')
export class CustomDataGrid extends Component {
	@state() data = employees
	@state() selection = new Array<Employee>()
	@state() status = ''
	@state() tree = false
	@state() reorderRows = true
	@state() selectability: DataGridSelectability | undefined = DataGridSelectability.Multiple
	@state() editability = DataGridEditability.Cell

	readonly grid = new DataGridController<Employee, CustomDataGrid>(this, host => ({
		get data() { return host.data },
		columns: [
			CustomDataGrid.column({ heading: 'Name', dataSelector: 'name', sticky: 'start' }),
			host.editableColumn('City', 'city', value => html`<input autofocus .value=${value}>`),
			host.editableColumn('Age', 'age', value => html`<input autofocus type='number' min='0' .value=${String(value)}>`, 'end'),
			host.editableColumn('Role', 'role', value => html`
				<select autofocus>${roles.map(role => html`<option ?selected=${role === value}>${role}</option>`)}</select>
			`),
			CustomDataGrid.column({ heading: 'Email', dataSelector: 'email' }),
		],
		get subDataGridDataSelector() { return host.tree ? 'reports' as const : undefined },
		get selectability() { return host.selectability },
		get selectedData() { return host.selection },
		handleSelectionChange: selection => host.selection = selection,
		isDataSelectable: data => data.role !== 'Trainee',
		multipleDetails: true,
		get editability() { return host.editability },
		get reorderability() { return host.reorderRows },
		handleReorder: (data, [move]) => {
			host.data = data
			host.status = !move ? '' : `${move.record.data.name} moved to row ${move.record.index + 1}`
		},
		handleCopy: text => host.status = `Copied "${text}"`,
		handleCsv: csv => CustomDataGrid.download(csv),
		handleCsvError: error => host.status = error.message,
	}))

	/** A column of text, which exports as it reads. */
	private static column<TValue>(column: Partial<DataGridColumn<Employee, TValue>>) {
		return new DataGridColumn<Employee, TValue>({
			*generateCsvHeading() { yield column.heading ?? '' },
			*generateCsvValue(value) { yield String(value ?? '') },
			...column,
		})
	}

	private editableColumn<TKey extends EditableKey>(heading: string, dataSelector: TKey, editor: (value: Employee[TKey]) => HTMLTemplateResult, alignment?: 'end') {
		return CustomDataGrid.column<Employee[TKey]>({
			heading, dataSelector, alignment, editable: true,
			getEditContentTemplate: (value, data) => html`
				<span @change=${(event: Event) => this.edit(data, dataSelector, (event.target as HTMLInputElement).value)}>${editor(value)}</span>
			`,
		})
	}

	private edit(data: Employee, key: EditableKey, value: string) {
		Object.assign(data, { [key]: key === 'age' ? Number(value) : value })
		this.status = `${data.name}: ${key} is now ${value}`
		this.grid.records.invalidate()
	}

	private static download(csv: string) {
		const url = URL.createObjectURL(new Blob([csv], { type: 'text/csv' }))
		const anchor = Object.assign(document.createElement('a'), { href: url, download: 'employees.csv' })
		anchor.click()
		URL.revokeObjectURL(url)
	}

	/** The host measures what it renders beside the columns; the controller stacks the sticky columns behind it. */
	private measure(column: 'reordering' | 'selection') {
		return observeResize(([entry]) => this.grid.columns.setColumnWidth(column, entry?.borderBoxSize[0]?.inlineSize ?? 0))
	}

	/** The roots, and the sub records of every open record. */
	private get visibleRecords() {
		const { records, details } = this.grid
		return records.records.filter(record => record.node?.ancestors.every(ancestor => details.isOpen(records.recordOf(ancestor))) ?? true)
	}

	private get rowReorderingHint() {
		const { reorderability, sorting } = this.grid
		return !this.reorderRows || reorderability.enabled ? ''
			: !reorderability.visible ? 'Rows reorder only while they have no sub rows.'
				: sorting.enabled ? 'Rows reorder only while nothing is sorted.' : ''
	}

	private setSelectability(value: string) {
		this.selectability = !value ? undefined : value as DataGridSelectability
		this.selection = []
	}

	private handleRowKeyDown(event: KeyboardEvent, record: DataRecord<Employee>) {
		if (event.key === ' ' && !(event.target as Element).closest('input, select')) {
			event.preventDefault()
			this.grid.selection.select(record.data, { event })
		}
	}

	private handleNameKeyDown(event: KeyboardEvent, record: DataRecord<Employee>) {
		if (event.key === 'Enter' && record.hasSubData) {
			event.preventDefault()
			this.grid.details.toggle(record)
		}
	}

	static override get styles() {
		return css`
			:host { display: block; color: CanvasText; }
			fieldset { display: flex; flex-wrap: wrap; align-items: center; gap: 0.25rem 1rem; margin-block-end: 0.5rem; }
			.hint { color: color-mix(in srgb, CanvasText 60%, Canvas); }
			.scroller { overflow: auto; max-inline-size: 42rem; max-block-size: 18rem; margin-block: 0.5rem; }
			table { inline-size: max-content; border-collapse: separate; border-spacing: 0; background: Canvas; }
			th, td { box-sizing: border-box; padding: 2px 6px; white-space: nowrap; overflow: hidden; text-align: start; border: solid color-mix(in srgb, CanvasText 15%, transparent); border-width: 0 1px 1px 0; background: Canvas; }
			th { position: sticky; top: 0; z-index: 4; user-select: none; background: color-mix(in srgb, CanvasText 6%, Canvas); font-weight: 500; }
			[data-sticky], .select, .grip { position: sticky; inset-inline-start: 0; z-index: 1; }
			th[data-sticky], th.select, th.grip { z-index: 5; }
			[data-alignment=end] { text-align: end; }
			th[data-reorderability=drop-before] { border-inline-start: 2px solid Highlight; }
			th[data-reorderability=drop-after] { border-inline-end: 2px solid Highlight; }
			.resizer { position: absolute; inset-block: 0; inset-inline-end: 0; inline-size: 5px; cursor: col-resize; }
			.resizer[data-resizing]::after { content: ''; position: fixed; inset-block: 0; inset-inline-start: var(--mo-data-grid-column-resizer-pointer); border-inline-start: 1px dotted; }
			tr[aria-selected=true] td { background: color-mix(in srgb, Highlight 18%, Canvas); }
			:host([data-reordering]) { user-select: none; }
			:host([data-reordering]) tbody tr:not([data-reorderability=dragging]) { transition: transform 0.15s ease; }
			tr[data-reorderability=dragging] { position: relative; z-index: 3; }
			tr[data-reorderability=dragging] td { background: color-mix(in srgb, Highlight 10%, Canvas); }
			.select, .grip { inline-size: 1.75rem; min-inline-size: 1.75rem; padding: 0; text-align: center; }
			.select label { position: absolute; inset: 0; display: grid; place-items: center; cursor: pointer; }
			.select input { margin: 0; }
			.grip { color: color-mix(in srgb, CanvasText 50%, Canvas); }
			table[data-reorderable-rows] td.grip { cursor: grab; }
			th:not(.select, .grip) { cursor: default; }
			th:not(.select, .grip):hover { background: color-mix(in srgb, CanvasText 10%, Canvas); }
			.expander { display: inline-block; inline-size: 1.25rem; padding: 0; border: none; background: none; color: inherit; font: inherit; cursor: pointer; }
		`
	}

	protected override get template() {
		const { grid } = this
		return html`
			${this.featuresTemplate}
			<fieldset>
				<legend>Columns</legend>
				${[...grid.columns.columns].map(column => html`
					<label>
						<input type='checkbox' .checked=${!column.hidden} ?disabled=${column.dataSelector === 'name'}
							@change=${(event: Event) => column.modify({ hidden: !(event.target as HTMLInputElement).checked })}
						>
						${column.heading}
					</label>
				`)}
			</fieldset>
			<div class='scroller'>
				<table ${grid.root.ref()} ?data-reorderable-rows=${grid.reorderability.enabled}>
					<thead>${this.headerTemplate}</thead>
					<tbody>
						${this.visibleRecords.map(record => this.getRowTemplate(record))}
					</tbody>
				</table>
			</div>
			<p>Selected: ${this.selection.map(employee => employee.name).join(', ') || 'nobody'}</p>
			<p>${this.status || ' '}</p>
		`
	}

	private get featuresTemplate() {
		const { grid } = this
		return html`
			<fieldset>
				<legend>Features</legend>
				<label>
					<input type='checkbox' .checked=${this.tree} @change=${(event: Event) => this.tree = (event.target as HTMLInputElement).checked}>
					Reports as sub rows
				</label>
				<label>
					<input type='checkbox' .checked=${this.reorderRows} @change=${(event: Event) => this.reorderRows = (event.target as HTMLInputElement).checked}>
					Reorder rows
				</label>
				<label>
					Selection
					<select @change=${(event: Event) => this.setSelectability((event.target as HTMLSelectElement).value)}>
						<option value='' ?selected=${this.selectability === undefined}>None</option>
						<option value=${DataGridSelectability.Single} ?selected=${this.selectability === DataGridSelectability.Single}>Single</option>
						<option value=${DataGridSelectability.Multiple} ?selected=${this.selectability === DataGridSelectability.Multiple}>Multiple</option>
					</select>
				</label>
				<label>
					Editing
					<select @change=${(event: Event) => this.editability = (event.target as HTMLSelectElement).value as DataGridEditability}>
						${[DataGridEditability.Never, DataGridEditability.Cell, DataGridEditability.Always].map(editability => html`
							<option value=${editability} ?selected=${this.editability === editability}>${editability[0]!.toUpperCase()}${editability.slice(1)}</option>
						`)}
					</select>
				</label>
				<button ?disabled=${!this.tree} @click=${() => grid.details.openAll()}>Expand all</button>
				<button ?disabled=${!this.tree} @click=${() => grid.details.closeAll()}>Collapse all</button>
				<button ?disabled=${!grid.sorting.enabled} @click=${() => grid.sorting.reset()}>Clear sorting</button>
				<button ?disabled=${grid.csv.isGenerating} @click=${() => grid.csv.generateCsv()}>Export CSV</button>
				<span class='hint'>${this.rowReorderingHint}</span>
			</fieldset>
		`
	}

	private get headerTemplate() {
		const { grid } = this
		const allState = grid.selection.allState
		return html`
			<tr ${grid.header.ref()}>
				${!grid.reorderability.visible ? html.nothing : html`<th class='grip' aria-label='Reorder' ${this.measure('reordering')}></th>`}
				${!grid.selection.hasSelection ? html.nothing : html`
					<th class='select' ${style({ insetInlineStart: grid.columns.getStickyColumnInsetInline('selection') })} ${this.measure('selection')}>
						${grid.selection.selectability !== DataGridSelectability.Multiple ? html.nothing : html`
							<label>
								<input type='checkbox' aria-label='Select all' .checked=${allState === 'all'} .indeterminate=${allState === 'some'}
									@click=${() => grid.selection.toggleAll()}
								>
							</label>
						`}
					</th>
				`}
				${grid.columns.columns.visible.map(column => html`
					<th ${grid.columnHeader(column)} data-alignment=${column.alignment} ${style(this.widthOf(column))}
						@click=${(event: MouseEvent) => column.toggleSort(undefined, event)}
					>
						${column.heading} ${column.sortingDefinition?.strategy === 'ascending' ? '▴' : column.sortingDefinition ? '▾' : ''}
						<span class='resizer' ${grid.columns.resizer(column)}></span>
					</th>
				`)}
			</tr>
		`
	}

	private getRowTemplate(record: DataRecord<Employee>) {
		const { grid } = this
		return html`
			<tr ${grid.row(record)}
				@mousedown=${(event: MouseEvent) => event.shiftKey && event.preventDefault()}
				@click=${(event: MouseEvent) => grid.selection.select(record.data, { event })}
				@keydown=${(event: KeyboardEvent) => this.handleRowKeyDown(event, record)}
			>
				${!grid.reorderability.visible ? html.nothing : html`<td class='grip' role='gridcell'>⠿</td>`}
				${!grid.selection.hasSelection ? html.nothing : html`
					<td class='select' role='gridcell' ${style({ insetInlineStart: grid.columns.getStickyColumnInsetInline('selection') })}
						@click=${(event: MouseEvent) => event.stopPropagation()}
					>
						<label>
							<input type='checkbox' tabindex='-1' aria-label='Select' .checked=${record.isSelected} ?disabled=${!record.isSelectable}
								@click=${(event: MouseEvent) => grid.selection.select(record.data, { preserve: true, selected: (event.target as HTMLInputElement).checked, event })}
							>
						</label>
					</td>
				`}
				${grid.columns.columns.visible.map((column, index) => this.getCellTemplate(record, column, index === 0))}
			</tr>
		`
	}

	private getCellTemplate(record: DataRecord<Employee>, column: DataGridColumn<Employee>, isFirst: boolean) {
		const value = KeyPath.get(record.data, column.dataSelector)
		return html`
			<td ${this.grid.cell(column)} data-alignment=${column.alignment}
				${style({ ...this.widthOf(column), paddingInlineStart: !isFirst ? undefined : `calc(6px + ${record.level} * 1rem)` })}
				@keydown=${(event: KeyboardEvent) => isFirst && this.handleNameKeyDown(event, record)}
			>
				${!isFirst || !this.tree ? html.nothing : !record.hasSubData ? html`<span class='expander'></span>` : html`
					<button class='expander' tabindex='-1' aria-label='Reports'
						@click=${(event: MouseEvent) => { event.stopPropagation(); this.grid.details.toggle(record) }}
					>${record.detailsOpen ? '▾' : '▸'}</button>
				`}
				${this.grid.editability.isEditingAt(record, column) ? column.getEditContentTemplate?.(value, record.data) : value}
			</td>
		`
	}

	/** A width a column was resized to holds it there, instead of its content. */
	private widthOf(column: DataGridColumn<Employee>) {
		const width = column.width === 'max-content' ? undefined : String(column.width)
		return { width, minWidth: width, maxWidth: width }
	}
}
