import { Component, component, css, ElementRef, html, state } from '@a11d/lit'
import { PointerDragController } from '@3mo/pointer-controller'

/** A card which is a button until a press has travelled four pixels, and follows the pointer from there. */
@component('story-draggable-card')
export class DraggableCard extends Component {
	@state() private position = { x: 0, y: 0 }
	@state() private offset = { x: 0, y: 0 }
	@state() private dragging = false
	@state() private clicks = 0

	private readonly card = new ElementRef<HTMLButtonElement>()

	readonly pointerDrag = new PointerDragController(this, host => ({
		get target() { return host.card.value },
		handleDragStart: () => host.dragging = true,
		handleDrag: ({ deltaX, deltaY }) => host.offset = { x: deltaX, y: deltaY },
		handleDragEnd: ({ deltaX, deltaY }) => host.settle(deltaX, deltaY),
		handleDragCancel: () => host.settle(0, 0),
	}))

	private settle(deltaX: number, deltaY: number) {
		this.position = { x: this.position.x + deltaX, y: this.position.y + deltaY }
		this.offset = { x: 0, y: 0 }
		this.dragging = false
	}

	static override get styles() {
		return css`
			:host {
				display: block;
				position: relative;
				inline-size: 24rem;
				block-size: 14rem;
				border: 1px dashed var(--mo-color-transparent-gray-3);
				border-radius: var(--mo-border-radius);
				overflow: hidden;
			}

			button {
				position: absolute;
				inset-block-start: 1rem;
				inset-inline-start: 1rem;
				padding: 0.75rem 1.25rem;
				border: none;
				border-radius: var(--mo-border-radius);
				background: var(--mo-color-accent);
				color: var(--mo-color-on-accent);
				font: inherit;
				cursor: grab;
				touch-action: none;
				user-select: none;

				&[data-dragging] {
					cursor: grabbing;
					box-shadow: var(--mo-shadow);
				}
			}
		`
	}

	protected override get template() {
		const x = this.position.x + this.offset.x
		const y = this.position.y + this.offset.y
		return html`
			<button ${this.card.ref()} ?data-dragging=${this.dragging} style='translate: ${x}px ${y}px' @click=${() => this.clicks++}>
				Clicked ${this.clicks} times
			</button>
		`
	}
}
