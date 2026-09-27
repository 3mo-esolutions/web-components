import { Component, component, css, html, property, state } from '@a11d/lit'
import { Hierarchy } from '@3mo/hierarchy'
import '@3mo/icon'
import '@3mo/text-fields'

type Folder = { readonly name: string, readonly folders?: ReadonlyArray<Folder> }

const folders: ReadonlyArray<Folder> = [
	{ name: 'Pictures', folders: [{ name: 'Holidays' }, { name: 'Screenshots' }] },
	{ name: 'Documents', folders: [{ name: 'Invoices', folders: [{ name: '2025' }, { name: '2026' }] }, { name: 'Contracts' }] },
	{ name: 'Music' },
]

/** A tree that renders the visible nodes of a hierarchy as a flat list of indented items. */
@component('story-folder-tree')
export class FolderTree extends Component {
	@property({ type: Boolean }) searchable = false

	@state() private expanded = new Set<unknown>(['Documents'])
	@state() private keyword = ''

	private readonly hierarchy = new Hierarchy<Folder>({
		key: folder => folder.name,
		children: folder => folder.folders,
		sort: (a, b) => a.name.localeCompare(b.name),
	})

	constructor() {
		super()
		this.hierarchy.roots = folders
	}

	static override get styles() {
		return css`
			:host { display: flex; flex-direction: column; gap: 0.5rem; inline-size: 18rem; }
			[role=treeitem] { display: flex; align-items: center; gap: 0.25rem; padding-block: 0.25rem; border-radius: var(--mo-border-radius); cursor: pointer; user-select: none; }
			[role=treeitem]:hover { background: var(--mo-color-transparent-gray-1); }
			mo-icon { font-size: 1.25rem; }
			[aria-expanded=true] mo-icon { rotate: 90deg; }
		`
	}

	protected override get template() {
		const matches = this.keyword ? this.hierarchy.filter(folder => folder.name.toLowerCase().includes(this.keyword.toLowerCase())) : undefined
		const nodes = this.hierarchy.visible({
			isExpanded: node => !!matches || this.expanded.has(node.key),
			isIncluded: node => !matches || matches.has(node.key),
		})
		return html`
			${!this.searchable ? html.nothing : html`
				<mo-field-search label='Filter' @input=${(event: CustomEvent<string | undefined>) => this.keyword = event.detail ?? ''}></mo-field-search>
			`}
			<div role='tree'>
				${nodes.map(node => html`
					<div role='treeitem' style='padding-inline-start: ${node.level * 1.5}rem'
						aria-level=${node.level + 1} aria-posinset=${node.position + 1} aria-setsize=${node.setSize}
						aria-expanded=${!node.hasChildren ? html.nothing : !!matches || this.expanded.has(node.key)}
						@click=${() => this.toggle(node.key)}
					>
						<mo-icon icon='chevron_right' style='visibility: ${node.hasChildren ? 'visible' : 'hidden'}'></mo-icon>
						${node.data.name}
					</div>
				`)}
			</div>
		`
	}

	private toggle(key: unknown) {
		const expanded = new Set(this.expanded)
		expanded.has(key) ? expanded.delete(key) : expanded.add(key)
		this.expanded = expanded
	}
}