import { Component, component, css, event, html, property, repeat, state } from '@a11d/lit'
import { ExpandabilityController } from '@3mo/expandability'
import { departments, respond, type Department } from '../../../stories/index.js'
import '@3mo/icon'

/** What a refetch hands back: equal departments as new objects. */
const fetchDepartments = () => structuredClone(departments) as ReadonlyArray<Department>

/** Rows that draw themselves and ask the controller only whether each is open. */
@component('story-department-tree')
export class DepartmentTree extends Component {
	@event() readonly change!: EventDispatcher<ReadonlyArray<string>>

	@property({ type: Boolean }) single = false
	@property({ type: Boolean }) lazy = false

	@state() private data = fetchDepartments()
	@state() private expanded = new Array<Department>()

	readonly expandability = new ExpandabilityController<Department, DepartmentTree>(this, host => ({
		get items() { return host.all },
		key: department => department.id,
		isExpandable: department => !!department.teams?.length,
		get multiple() { return !host.single },
		get expanded() { return host.expanded },
		ancestorsOf: department => host.ancestorsOf(department),
		get load() { return !host.lazy ? undefined : () => respond(undefined, 700) },
		handleChange: ({ expanded }) => {
			host.expanded = [...expanded]
			host.change.dispatch(expanded.map(department => department.name))
		},
	}))

	/** Every department and team in pre-order, so that expanding all of them means all of them. */
	private get all(): Array<Department> {
		const flatten = (departments: ReadonlyArray<Department>): Array<Department> => departments.flatMap(department => [department, ...flatten(department.teams ?? [])])
		return flatten(this.data)
	}

	private ancestorsOf(department: Department): Array<Department> {
		const path = (departments: ReadonlyArray<Department>, trail: Array<Department>): Array<Department> | undefined => {
			for (const candidate of departments) {
				const found = candidate.id === department.id ? trail : path(candidate.teams ?? [], [...trail, candidate])
				if (found) {
					return found
				}
			}
			return undefined
		}
		return path(this.data, []) ?? []
	}

	private refetch() {
		this.data = fetchDepartments()
		this.expandability.handleItemsChange()
	}

	static override get styles() {
		return css`
			:host { display: flex; flex-direction: column; gap: 2px; inline-size: 22rem; }
			.toolbar { display: flex; gap: 1rem; padding-block-end: 0.5rem; }
			button { background: none; border: none; padding: 0.35rem 0; cursor: pointer; color: var(--mo-color-accent); font: inherit; }
			/* A fixed height, as an interpolated auto height inside a flex column does not move monotonically. */
			.row {
				display: flex; align-items: center; gap: 0.5rem; block-size: 2.5rem;
				padding-inline: calc(0.75rem + var(--level) * 1.5rem) 0.75rem;
				border-radius: var(--mo-border-radius); background: var(--mo-color-transparent-gray-1);
				cursor: default; user-select: none; transition: opacity 200ms;
			}
			.row[data-nested] { @starting-style { opacity: 0; } }
			mo-icon { transition: rotate 200ms; }
			mo-icon[data-leaf] { visibility: hidden; }
			small { margin-inline-start: auto; color: var(--mo-color-gray); }
			.row[data-expandability=expanded] mo-icon { rotate: 90deg; }
			.row[data-expandability=loading] mo-icon { animation: spin 1s linear infinite; }
			@keyframes spin { to { rotate: 360deg; } }
			@media (prefers-reduced-motion: reduce) { .row, mo-icon { transition: none; } }
		`
	}

	protected override get template() {
		const visible = this.all.filter(department => this.ancestorsOf(department).every(ancestor => this.expandability.isExpanded(ancestor)))
		return html`
			<div class='toolbar'>
				<button @click=${() => this.expandability.toggleAll()}>${this.expandability.allState === 'none' ? 'Expand all' : 'Collapse all'}</button>
				<button @click=${() => this.refetch()}>Refetch</button>
			</div>
			${repeat(visible, department => department.id, (department, index) => html`
				<div class='row' style='--level: ${this.ancestorsOf(department).length}' ?data-nested=${this.ancestorsOf(department).length > 0}
					${this.expandability.item({ index, data: department })}
					@click=${() => this.expandability.toggle(department)}
				>
					<mo-icon ?data-leaf=${!this.expandability.isExpandable(department)} icon=${this.expandability.isLoading(department) ? 'sync' : 'chevron_right'}></mo-icon>
					${department.name}
					<small>${department.headcount}</small>
				</div>
			`)}
		`
	}
}