import { Component, component, css, html, property, state } from '@a11d/lit'
import { IndexabilityController } from '@3mo/indexability'

/** A card in its own shadow root, which registers itself with the registry it is handed. */
@component('story-registry-card')
export class RegistryCard extends Component {
	@property({ type: Object }) registry!: IndexabilityController<string>
	@property({ type: Number }) index = 0
	@property() label = ''

	static override get styles() {
		return css`
			div { padding: 0.6rem 0.75rem; border-radius: var(--mo-border-radius); background: var(--mo-color-transparent-gray-1); cursor: pointer; user-select: none; }
		`
	}

	protected override get template() {
		return html`<div ${this.registry.item({ index: this.index, data: this.label })}>${this.label}</div>`
	}
}

/** Two registries on one host: each knows only its own cards, so a click resolves in exactly one of them. */
@component('story-registry-board')
export class RegistryBoard extends Component {
	private readonly left = new IndexabilityController<string>(this)
	private readonly right = new IndexabilityController<string>(this)

	@state() private hit?: string

	private readonly handleClick = (event: MouseEvent) => {
		const path = event.composedPath()
		const left = this.left.itemAt(path)
		const right = this.right.itemAt(path)
		this.hit = left ? `left → ${left.options.data}` : right ? `right → ${right.options.data}` : 'neither'
	}

	static override get styles() {
		return css`
			:host { display: flex; flex-direction: column; gap: 1rem; }
			.columns { display: flex; gap: 2rem; }
			.column { display: flex; flex-direction: column; gap: 0.5rem; inline-size: 11rem; }
			h4 { margin: 0; color: var(--mo-color-gray); font-size: small; font-weight: normal; }
		`
	}

	protected override get template() {
		return html`
			<div class='columns' @click=${this.handleClick}>
				<div class='column'>
					<h4>Left</h4>
					${['Draft', 'Review', 'Ship'].map((label, index) => html`
						<story-registry-card .registry=${this.left} .index=${index} label=${label}></story-registry-card>
					`)}
				</div>
				<div class='column'>
					<h4>Right</h4>
					${['Spec', 'Build'].map((label, index) => html`
						<story-registry-card .registry=${this.right} .index=${index} label=${label}></story-registry-card>
					`)}
				</div>
			</div>
			<code>${this.hit ?? '–'}</code>
		`
	}
}