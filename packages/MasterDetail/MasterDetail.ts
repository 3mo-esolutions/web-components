import { Component, component, css, event, eventListener, html, property } from '@a11d/lit'
import { type Flex } from '@3mo/flex'
import '@3mo/splitter'

/**
 * @element mo-master-detail
 *
 * @attr direction - The direction in which the panes are laid out. Defaults to 'vertical', which places the detail pane below the master pane.
 * @attr masterSize - The size of the master pane while both panes share the available space.
 * @attr minSize - The minimum size of either pane while both panes share the available space.
 * @attr collapsed - Whether the detail pane is collapsed to the size of its own content, leaving the rest to the master pane.
 * @attr open - Whether the detail pane has content. Derived from the 'detail' slot and therefore read-only.
 *
 * @slot master - The pane which is always visible. Usually a list or a data-grid, but anything whose state the detail pane depends on.
 * @slot detail - The pane which details the current state of the master pane. Absent as long as it has no content.
 *
 * @csspart resizer-host - The element between both panes which resizes them.
 *
 * @fires openChange - Dispatched when the detail pane appears or disappears.
 */
@component('mo-master-detail')
export class MasterDetail extends Component {
	@event() readonly openChange!: EventDispatcher<boolean>

	@property() direction: Flex['direction'] = 'vertical'
	@property() masterSize = '50%'
	@property() minSize = '300px'
	@property({ type: Boolean, reflect: true }) collapsed = false
	@property({ type: Boolean, reflect: true }) open = false

	/** Whether both panes share the available space and can therefore be resized against each other. */
	private get split() {
		return this.open && !this.collapsed
	}

	static override get styles() {
		return css`
			:host {
				display: block;
				height: 100%;
			}

			mo-splitter {
				height: 100%;
			}

			::slotted(*) {
				height: 100%;
				width: 100%;
			}

			/*
				A collapsed detail pane has no boundary left to drag, but the resizer keeps its place so
				that collapsing does not pull the two panes flush against each other. Its own transition
				fades it out.
			*/
			:host([collapsed]) mo-splitter::part(resizer-host) {
				pointer-events: none;
				opacity: 0;
			}

			/* Without any detail content there is no gap to preserve either, so the resizer gives up its space. */
			:host(:not([open])) mo-splitter::part(resizer-host) {
				display: none;
			}
		`
	}

	protected override get template() {
		return html`
			<mo-splitter exportparts='resizer-host' direction=${this.direction}>
				<mo-splitter-item .size=${this.split ? this.masterSize : undefined} .min=${this.split ? this.minSize : undefined}>
					<slot name='master'></slot>
				</mo-splitter-item>

				<mo-splitter-item .min=${this.split ? this.minSize : undefined} ?collapsed=${!this.split}>
					<slot name='detail' @slotchange=${this.handleDetailSlotChange}></slot>
				</mo-splitter-item>
			</mo-splitter>
		`
	}

	private readonly handleDetailSlotChange = (e: Event) => {
		// "flatten" so that a slot which is forwarded by a consuming component does not count as content of its own.
		const open = (e.target as HTMLSlotElement).assignedElements({ flatten: true }).length > 0
		if (this.open !== open) {
			this.open = open
			this.openChange.dispatch(open)
			if (open) {
				this.revealLastInteraction()
			}
		}
	}

	private lastInteraction?: Element

	@eventListener('pointerdown')
	@eventListener('focusin')
	protected handleInteraction(e: Event) {
		this.lastInteraction = e.composedPath().find((target): target is Element => target instanceof Element)
	}

	/**
	 * Opening the detail pane shrinks the master pane, which can push the very element whose selection
	 * opened it out of the viewport. Keep it in view once the new pane sizes have been laid out.
	 */
	private async revealLastInteraction() {
		await this.updateComplete
		await new Promise(resolve => setTimeout(resolve))
		this.lastInteraction?.scrollIntoView({ block: 'nearest', inline: 'nearest' })
	}
}

declare global {
	interface HTMLElementTagNameMap {
		'mo-master-detail': MasterDetail
	}
}