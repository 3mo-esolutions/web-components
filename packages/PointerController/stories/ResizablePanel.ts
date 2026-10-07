import { Component, component, css, ElementRef, html, state } from '@a11d/lit'
import { PointerDragController } from '@3mo/pointer-controller'

/** A side panel with a handle that resizes it from the very press, as there is no click on it to tell apart. */
@component('story-resizable-panel')
export class ResizablePanel extends Component {
	private static readonly minimum = 120
	private static readonly maximum = 480

	@state() private width = 240
	@state() private resizing = false

	private startWidth = this.width

	private readonly handle = new ElementRef<HTMLElement>()

	readonly pointerDrag = new PointerDragController(this, host => ({
		get target() { return host.handle.value },
		threshold: 0,
		handleDragStart: () => host.startResizing(),
		handleDrag: ({ deltaX }) => host.resize(deltaX),
		handleDragEnd: () => host.resizing = false,
		handleDragCancel: () => host.resize(0, false),
	}))

	private startResizing() {
		this.startWidth = this.width
		this.resizing = true
	}

	private resize(deltaX: number, resizing = true) {
		const inline = getComputedStyle(this).direction === 'rtl' ? -deltaX : deltaX
		this.width = Math.min(ResizablePanel.maximum, Math.max(ResizablePanel.minimum, this.startWidth + inline))
		this.resizing = resizing
	}

	static override get styles() {
		return css`
			:host {
				display: flex;
				inline-size: 36rem;
				block-size: 12rem;
				border: 1px solid var(--mo-color-transparent-gray-3);
				border-radius: var(--mo-border-radius);
				overflow: hidden;
			}

			.side {
				flex: none;
				display: grid;
				place-content: center;
				background: var(--mo-color-transparent-gray-1);
				font-variant-numeric: tabular-nums;
			}

			.handle {
				flex: none;
				inline-size: 0.5rem;
				cursor: col-resize;
				touch-action: none;
				background: var(--mo-color-transparent-gray-3);
				transition: background var(--mo-duration-quick, 150ms);

				&:hover, &[data-resizing] {
					background: var(--mo-color-accent);
				}
			}

			.main {
				flex: 1;
				display: grid;
				place-content: center;
				color: var(--mo-color-gray);
			}
		`
	}

	protected override get template() {
		return html`
			<div class='side' style='inline-size: ${this.width}px'>${Math.round(this.width)}px</div>
			<div class='handle' ${this.handle.ref()} ?data-resizing=${this.resizing}></div>
			<div class='main'>Content</div>
		`
	}
}
