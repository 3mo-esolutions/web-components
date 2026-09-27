import { Component, component, css, html, repeat, state } from '@a11d/lit'
import { ReorderabilityController } from '@3mo/reorderability'
import '@3mo/checkbox'
import '@3mo/icon-button'

type Task = { readonly label: string, readonly pinned: boolean, readonly done: boolean }

/** Rows that drag from anywhere but their own controls, which `excluded` keeps out of the drag. */
@component('story-task-list')
export class TaskList extends Component {
	@state() private tasks: ReadonlyArray<Task> = [
		{ label: 'Write the spec', pinned: true, done: false },
		{ label: 'Sketch the flow', pinned: false, done: true },
		{ label: 'Extract the package', pinned: false, done: false },
		{ label: 'Measure the cadence', pinned: false, done: false },
		{ label: 'Ship the stories', pinned: false, done: false },
	]

	readonly reorderability = new ReorderabilityController(this, {
		handleReorder: (source, destination) => {
			const tasks = [...this.tasks]
			tasks.splice(destination, 0, ...tasks.splice(source, 1))
			this.tasks = tasks
		},
	})

	private toggle(task: Task, key: 'pinned' | 'done') {
		this.tasks = this.tasks.map(t => t !== task ? t : { ...t, [key]: !t[key] })
	}

	static override get styles() {
		return css`
			:host { display: flex; flex-direction: column; gap: 0.5rem; max-inline-size: 24rem; }
			.row {
				display: flex; align-items: center; padding: 0.75rem 0.5rem 0.75rem 1rem;
				border-radius: var(--mo-border-radius); background: var(--mo-color-transparent-gray-3); cursor: grab; user-select: none;
			}
			.row[data-done] { text-decoration: line-through; }
			.row[data-reorderability=dragging] { background: var(--mo-color-accent); color: var(--mo-color-on-accent); z-index: 1; cursor: grabbing; }
			.actions { display: flex; align-items: center; gap: 0.25rem; margin-inline-start: auto; }
			mo-icon-button { font-size: 20px; color: var(--mo-color-gray); }
			mo-icon-button[data-pinned] { color: var(--mo-color-accent); }
			.row[data-reorderability=dragging] mo-icon-button { color: var(--mo-color-on-accent); }
			:host([data-reordering]) .row:not([data-reorderability=dragging]) { transition: transform 0.15s ease; }
		`
	}

	protected override get template() {
		return html`
			${repeat(this.tasks, task => task.label, (task, index) => html`
				<div class='row' ?data-done=${task.done} ${this.reorderability.item({ index, excluded: '.actions' })}>
					${task.label}
					<div class='actions'>
						<mo-icon-button dense icon='push_pin' title='Pin' ?data-pinned=${task.pinned} @click=${() => this.toggle(task, 'pinned')}></mo-icon-button>
						<mo-checkbox title='Done' ?selected=${task.done} @change=${() => this.toggle(task, 'done')}></mo-checkbox>
					</div>
				</div>
			`)}
		`
	}
}