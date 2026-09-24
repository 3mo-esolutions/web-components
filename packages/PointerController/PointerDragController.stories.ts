import type { Meta, StoryObj } from '@storybook/web-components-vite'
import { Component, component, css, ElementRef, html, state, style } from '@a11d/lit'
import p from './package.json'
import { PointerDragController } from './PointerDragController.js'

export default {
	title: 'Utilities / Pointer Drag Controller',
	package: p,
} as Meta

const storyStyles = css`
	:host { display: flex; gap: 2.5rem; flex-wrap: wrap; align-items: flex-start; }
	.panel { display: flex; flex-direction: column; gap: 0.75rem; }
	h4 { margin: 0; color: var(--mo-color-gray); font-size: small; text-transform: uppercase; letter-spacing: 0.05em; }
	.hint { margin: 0; color: var(--mo-color-gray); font-size: small; line-height: 1.6; max-inline-size: 30rem; }
	code { color: var(--mo-color-accent); }
	.readout { font-variant-numeric: tabular-nums; color: var(--mo-color-gray); font-size: small; }
`

/** A card which is a button until a press has travelled four pixels, and follows the pointer from there. */
@component('story-pointer-drag-card')
class StoryPointerDragCard extends Component {
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
			${storyStyles}

			.stage {
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
			<div class='panel'>
				<h4>drag or click</h4>
				<div class='stage'>
					<button ${this.card.ref()} ?data-dragging=${this.dragging} ${style({ translate: `${x}px ${y}px` })}
						@click=${() => this.clicks++}
					>Drag me</button>
				</div>
				<div class='readout'>
					${this.dragging ? `dragging by ${this.offset.x}, ${this.offset.y}` : 'at rest'} · clicked ${this.clicks} times
				</div>
			</div>
			<p class='hint'>
				A press becomes a drag once it has travelled <code>4px</code>, so a click still counts as
				one. The click that follows a drag is swallowed: dropping the card never clicks it.
			</p>
		`
	}
}

StoryPointerDragCard

export const DragOrClick: StoryObj = {
	render: () => html`<story-pointer-drag-card></story-pointer-drag-card>`
}

/** A handle which resizes a panel from the very press, as there is no click on it to tell apart. */
@component('story-pointer-drag-handle')
class StoryPointerDragHandle extends Component {
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
		this.width = Math.min(StoryPointerDragHandle.maximum, Math.max(StoryPointerDragHandle.minimum, this.startWidth + inline))
		this.resizing = resizing
	}

	static override get styles() {
		return css`
			${storyStyles}

			.frame {
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
			<div class='panel'>
				<h4>resize handle</h4>
				<div class='frame'>
					<div class='side' ${style({ inlineSize: `${this.width}px` })}>${Math.round(this.width)}px</div>
					<div class='handle' ${this.handle.ref()} ?data-resizing=${this.resizing}></div>
					<div class='main'>Content</div>
				</div>
			</div>
			<p class='hint'>
				With <code>threshold: 0</code> the press itself is the drag: the handle lights up and captures
				the pointer at once, so it keeps following when you leave the frame or the window. A drag the
				browser takes over puts the panel back where it was.
			</p>
		`
	}
}

StoryPointerDragHandle

export const ResizeHandle: StoryObj = {
	render: () => html`<story-pointer-drag-handle></story-pointer-drag-handle>`
}

/** Rows which swipe sideways to reveal an action, in a list which scrolls up and down. */
@component('story-pointer-drag-rows')
class StoryPointerDragRows extends Component {
	private static readonly actionWidth = 88

	@state() private revealed?: number
	@state() private swiping?: { readonly row: number, readonly offset: number }
	@state() private deleted = new Array<number>()
	@state() private leftToScrolling = 0

	private pressed?: number

	private readonly list = new ElementRef<HTMLElement>()

	readonly pointerDrag = new PointerDragController(this, host => ({
		get target() { return host.list.value },
		handlePress: event => host.press(event),
		isDrag: (deltaX, deltaY) => host.isSideways(deltaX, deltaY),
		handleDrag: ({ deltaX }) => host.swipe(deltaX),
		handleDragEnd: () => host.settle(),
		handleDragCancel: () => host.swiping = undefined,
	}))

	private get rows() {
		return Array.from({ length: 30 }, (_, index) => index + 1).filter(row => !this.deleted.includes(row))
	}

	private press(event: PointerEvent) {
		const row = event.composedPath().find((target): target is HTMLElement => target instanceof HTMLElement && !!target.dataset.row)
		this.pressed = row ? Number(row.dataset.row) : undefined
		return this.pressed !== undefined
	}

	private isSideways(deltaX: number, deltaY: number) {
		const sideways = Math.abs(deltaX) > Math.abs(deltaY)
		if (!sideways) {
			this.leftToScrolling++
		}
		return sideways
	}

	private swipe(deltaX: number) {
		const row = this.pressed!
		const start = this.revealed === row ? -StoryPointerDragRows.actionWidth : 0
		this.swiping = { row, offset: Math.min(0, Math.max(-StoryPointerDragRows.actionWidth, start + deltaX)) }
	}

	private settle() {
		const swiping = this.swiping
		this.swiping = undefined
		if (swiping) {
			this.revealed = swiping.offset < -StoryPointerDragRows.actionWidth / 2 ? swiping.row : undefined
		}
	}

	static override get styles() {
		return css`
			${storyStyles}

			.list {
				inline-size: 22rem;
				block-size: 18rem;
				overflow-y: auto;
				border: 1px solid var(--mo-color-transparent-gray-3);
				border-radius: var(--mo-border-radius);
				touch-action: pan-y;
			}

			.row {
				position: relative;
				overflow: hidden;
				border-block-end: 1px solid var(--mo-color-transparent-gray-3);
			}

			.content {
				position: relative;
				z-index: 1;
				padding: 0.9rem 1rem;
				background: var(--mo-color-surface);
				user-select: none;
				transition: translate var(--mo-duration-quick, 150ms) ease;

				&[data-swiping] {
					transition: none;
				}
			}

			.action {
				position: absolute;
				inset-block: 0;
				inset-inline-end: 0;
				inline-size: ${StoryPointerDragRows.actionWidth}px;
				border: none;
				background: var(--mo-color-red);
				color: white;
				font: inherit;
				cursor: pointer;
			}
		`
	}

	protected override get template() {
		return html`
			<div class='panel'>
				<h4>along one axis</h4>
				<div class='list' ${this.list.ref()}>
					${this.rows.map(row => {
						const offset = this.swiping?.row === row ? this.swiping.offset : this.revealed === row ? -StoryPointerDragRows.actionWidth : 0
						return html`
							<div class='row' data-row=${row}>
								<button class='action' tabindex=${this.revealed === row ? 0 : -1} @click=${() => this.deleted = [...this.deleted, row]}>Delete</button>
								<div class='content' ?data-swiping=${this.swiping?.row === row} ${style({ translate: `${offset}px 0` })}>Message ${row}</div>
							</div>
						`
					})}
				</div>
				<div class='readout'>left to scrolling ${this.leftToScrolling} times</div>
			</div>
			<p class='hint'>
				<code>isDrag</code> is asked on a press's first movement. Sideways, the row slides open to its
				action; up or down, the controller steps aside, so a finger scrolls the list as usual.
			</p>
		`
	}
}

StoryPointerDragRows

export const AlongOneAxis: StoryObj = {
	render: () => html`<story-pointer-drag-rows></story-pointer-drag-rows>`
}