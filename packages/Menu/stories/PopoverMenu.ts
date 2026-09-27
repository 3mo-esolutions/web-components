import { Component, component, css, event, html, property, query, state } from '@a11d/lit'
import { MenuController } from '@3mo/menu'
import type { Selectability } from '@3mo/selectability'

/** A menu from the controller alone, shown in the browser's own popover and opened by the element whose id is its `target`. */
@component('story-popover-menu')
export class PopoverMenu extends Component {
	@event() readonly change!: EventDispatcher<Array<number>>

	@property() target = ''
	@property() selectability?: Selectability

	@state() private open = false
	@state() private value = new Array<number>()

	@query('[popover]') private readonly popup!: HTMLElement

	readonly menu = new MenuController(this, host => {
		const menu = host as PopoverMenu
		return {
			get items() { return [...menu.children] as Array<HTMLElement> },
			get expanded() { return menu.open },
			handleExpandedChange: open => menu.open = open,
			get selectability() { return menu.selectability },
			get value() { return menu.value },
			handleChange: value => {
				menu.value = value
				menu.change.dispatch(value)
			},
		}
	})

	private trigger?: HTMLElement

	/** Read as the press starts, as the popover's light dismissal closes the menu before the click arrives. */
	private openBeforePress?: boolean

	private readonly handleTriggerPointerDown = () => this.openBeforePress = this.open

	private readonly handleTriggerClick = () => {
		this.open = !(this.openBeforePress ?? this.open)
		this.openBeforePress = undefined
	}

	protected override willUpdate() {
		const trigger = (this.getRootNode() as Document | ShadowRoot).getElementById(this.target) ?? undefined
		if (trigger !== this.trigger) {
			this.trigger?.removeEventListener('pointerdown', this.handleTriggerPointerDown)
			this.trigger?.removeEventListener('click', this.handleTriggerClick)
			trigger?.addEventListener('pointerdown', this.handleTriggerPointerDown)
			trigger?.addEventListener('click', this.handleTriggerClick)
			this.trigger = trigger
			this.menu.trigger.set(trigger)
		}
	}

	protected override updated() {
		if (this.open === this.popup.matches(':popover-open')) {
			return
		}
		if (this.open) {
			const { left, bottom } = this.trigger?.getBoundingClientRect() ?? { left: 0, bottom: 0 }
			Object.assign(this.popup.style, { left: `${left}px`, top: `${bottom + 4}px` })
			this.popup.showPopover()
		} else {
			this.popup.hidePopover()
		}
	}

	static override get styles() {
		return css`
			[popover] {
				inset: auto; margin: 0; padding: 4px; min-inline-size: 12rem;
				border: 1px solid var(--mo-color-transparent-gray-3); border-radius: var(--mo-border-radius);
				background: var(--mo-color-surface); color: var(--mo-color-foreground); box-shadow: 0 4px 12px rgb(0 0 0 / 0.12);
			}
			[popover]:popover-open { display: flex; flex-direction: column; gap: 2px; }
			::slotted(div) { padding: 0.45rem 0.75rem; border-radius: var(--mo-border-radius); cursor: default; user-select: none; outline: none; }
			::slotted(div:hover) { background: var(--mo-color-transparent-gray-1); }
			::slotted(div:focus) { background: color-mix(in srgb, var(--mo-color-accent), transparent 82%); }
			::slotted([disabled]) { opacity: 0.45; }
		`
	}

	protected override get template() {
		return html`
			<div .popover=${'auto'} ${this.menu.menu.ref()} @toggle=${(event: ToggleEvent) => this.open = event.newState === 'open'}>
				<slot @slotchange=${() => this.menu.handleItemsChange()}></slot>
			</div>
		`
	}
}