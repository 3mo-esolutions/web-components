import { html, component, Component, css, property, eventListener, style } from '@a11d/lit'
import { Fab } from '@3mo/fab'
import { SlotController } from '@3mo/slot-controller'

@component('mo-fab-group')
export class FabGroup extends Component {
	@property({ type: Boolean, reflect: true, updated(this: FabGroup) { this.updateFabElements() } }) open = false

	static override get styles() {
		return css`
			:host {
				position: relative;
			}

			:host([open]) {
				z-index: 1;
			}

			#fabs {
				margin-bottom: calc(56px + 16px);
				display: block;
			}

			:host(:not([open])) #fabs {
				visibility: collapse;
			}

			mo-fab {
				transition: var(--mo-fab-group-transition-duration, var(--mo-duration-quick, 250ms));
			}

			:host([open]) mo-fab {
				transform: rotate(45deg);
			}

			::slotted([instanceof*=mo-fab]) {
				transition: var(--mo-fab-group-transition-duration, var(--mo-duration-quick, 250ms));
				transform: scale(0);
				opacity: 0;
			}

			:host([open]) ::slotted([instanceof*=mo-fab]) {
				transform: scale(1);
				opacity: 1;
			}
		`
	}

	protected readonly slotController = new SlotController(this)

	@eventListener({ target: window, type: 'click' })
	protected handleWindowClick(e: MouseEvent) {
		if (this.open && !this.contains(e.target as Node)) {
			this.open = false
		}
	}

	get fabElements() {
		return this.slotController.getAssignedElements('').filter((e): e is Fab => e instanceof Fab)
	}

	protected override get template() {
		return html`
			<mo-fab icon='add' @click=${this.handleClick}></mo-fab>
			<div id='fabs' ${style({ position: 'absolute', bottom: '0', right: '0' })}>
				<div ${style({ display: 'flex', flexDirection: 'column-reverse', alignItems: 'end', gap: '8px' })}>
					<slot @slotchange=${() => this.updateFabElements()}></slot>
				</div>
			</div>
		`
	}

	private readonly handleClick = (e: MouseEvent) => {
		e.stopImmediatePropagation()
		this.open = !this.open
	}

	private updateFabElements() {
		for (const [index, fab] of this.fabElements.entries()) {
			fab.iconAtEnd = true
			fab.tabIndex = this.open ? 0 : -1
			const delay = this.open ? index * 25 : 0
			fab.style.transitionDelay = `${delay}ms`
		}
	}
}

declare global {
	interface HTMLElementTagNameMap {
		'mo-fab-group': FabGroup
	}
}