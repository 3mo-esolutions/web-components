import { Component, component, css, html, property, repeat, state } from '@a11d/lit'
import { ReorderabilityController } from '@3mo/reorderability'
import '@3mo/icon'
import { photos, type Photo } from '../../../stories/index.js'

/** Tiles of one size in as many columns as fit, such as the images of a product; the first one is the cover and stays in place. */
@component('story-photo-grid')
export class PhotoGrid extends Component {
	@property({ type: Number }) count = 9

	@state() private photos = new Array<Photo>()

	private readonly reorderability = new ReorderabilityController(this, {
		handleReorder: (source, destination) => {
			const photos = [...this.photos]
			photos.splice(destination, 0, ...photos.splice(source, 1))
			this.photos = photos
		},
	})

	protected override willUpdate() {
		if (this.photos.length !== this.count) {
			this.photos = photos.slice(0, this.count)
		}
	}

	static override get styles() {
		return css`
			.grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(8rem, 1fr)); grid-auto-rows: 8rem; gap: 0.5rem; }
			.tile { position: relative; border-radius: var(--mo-border-radius); overflow: hidden; cursor: grab; user-select: none; }
			.tile img { inline-size: 100%; block-size: 100%; object-fit: cover; pointer-events: none; }
			.tile mo-icon { position: absolute; inset-block-start: 0.25rem; inset-inline-start: 0.25rem; color: white; }
			.tile[aria-disabled=true] { cursor: not-allowed; }
			.tile[data-reorderability=dragging] { opacity: 0.4; cursor: grabbing; }
			:host([data-reordering]) .tile:not([data-reorderability=dragging]) { transition: transform 0.15s ease; }
		`
	}

	protected override get template() {
		return html`
			<div class='grid'>
				${repeat(this.photos, photo => photo.id, (photo, index) => html`
					<div class='tile' aria-disabled=${index === 0} ${this.reorderability.item({ index, disabled: index === 0 })}>
						<img src=${photo.thumbnailUrl} alt=${photo.title} draggable='false'>
						${index !== 0 ? html.nothing : html`<mo-icon icon='star'></mo-icon>`}
					</div>
				`)}
			</div>
		`
	}
}
