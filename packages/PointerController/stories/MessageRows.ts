import { Component, component, css, ElementRef, html, state } from '@a11d/lit'
import { PointerDragController } from '@3mo/pointer-controller'

/** Rows which swipe sideways to reveal an action, in a list which scrolls up and down. */
@component('story-message-rows')
export class MessageRows extends Component {
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
		const start = this.revealed === row ? -MessageRows.actionWidth : 0
		this.swiping = { row, offset: Math.min(0, Math.max(-MessageRows.actionWidth, start + deltaX)) }
	}

	private settle() {
		const swiping = this.swiping
		this.swiping = undefined
		if (swiping) {
			this.revealed = swiping.offset < -MessageRows.actionWidth / 2 ? swiping.row : undefined
		}
	}

	static override get styles() {
		return css`
			:host {
				display: flex;
				flex-direction: column;
				gap: 0.75rem;
			}

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
				inline-size: ${MessageRows.actionWidth}px;
				border: none;
				background: var(--mo-color-red);
				color: white;
				font: inherit;
				cursor: pointer;
			}

			small {
				color: var(--mo-color-gray);
				font-variant-numeric: tabular-nums;
			}
		`
	}

	protected override get template() {
		return html`
			<div class='list' ${this.list.ref()}>
				${this.rows.map(row => {
					const offset = this.swiping?.row === row ? this.swiping.offset : this.revealed === row ? -MessageRows.actionWidth : 0
					return html`
						<div class='row' data-row=${row}>
							<button class='action' tabindex=${this.revealed === row ? 0 : -1} @click=${() => this.deleted = [...this.deleted, row]}>Delete</button>
							<div class='content' ?data-swiping=${this.swiping?.row === row} style='translate: ${offset}px 0'>Message ${row}</div>
						</div>
					`
				})}
			</div>
			<small>Left to scrolling ${this.leftToScrolling} times</small>
		`
	}
}
