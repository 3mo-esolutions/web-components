import type { Meta, StoryObj } from '@storybook/web-components-vite'
import { Component, component, css, html, property, query, state } from '@a11d/lit'
import p from './package.json'
import { MenuController } from './MenuController.js'

export default {
	title: 'Utilities / Menu Controller',
	package: p,
} as Meta

const storyStyles = css`
	h4 { margin: 0; color: var(--mo-color-gray); font-size: small; text-transform: uppercase; letter-spacing: 0.05em; }
	.hint { margin: 0; color: var(--mo-color-gray); font-size: small; line-height: 1.7; max-inline-size: 26rem; }
	code { color: var(--mo-color-accent); }
	kbd { font: inherit; padding: 0 0.3em; border: 1px solid var(--mo-color-transparent-gray-3); border-radius: 3px; white-space: nowrap; }
`

/**
 * A menu from the controller alone, shown in the browser's own popover, which dismisses it on a press outside.
 * Its items are the plain elements slotted into it; the trigger is any element outside it, handed over as `trigger`.
 */
@component('story-menu')
class StoryMenu extends Component {
	@property({ type: Object }) trigger?: HTMLElement
	@state() open = false

	@query('[popover]') private readonly popup!: HTMLElement

	readonly menu = new MenuController(this, host => {
		const menu = host as StoryMenu
		return {
			get items() { return [...menu.children] as Array<HTMLElement> },
			get expanded() { return menu.open },
			handleExpandedChange: open => menu.open = open,
		}
	})

	protected override willUpdate() {
		this.menu.trigger.set(this.trigger)
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
			::slotted(*) { padding: 0.45rem 0.75rem; border-radius: var(--mo-border-radius); cursor: default; user-select: none; outline: none; }
			::slotted(:hover) { background: var(--mo-color-transparent-gray-1); }
			::slotted(:focus) { background: color-mix(in srgb, var(--mo-color-accent), transparent 82%); }
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

StoryMenu

/** Reads what the markup says to assistive technology off the stamped attributes, not off the controller. */
@component('story-menu-button-readout')
class StoryMenuButtonReadout extends Component {
	@property({ type: Object }) trigger?: HTMLElement
	@property({ type: Object }) menu?: HTMLElement

	private readonly observer = new MutationObserver(() => this.requestUpdate())

	protected override updated(changed: Map<PropertyKey, unknown>) {
		if ((changed.has('trigger') || changed.has('menu')) && this.trigger && this.menu) {
			this.observer.disconnect()
			this.observer.observe(this.trigger, { attributes: true })
			this.observer.observe(this.menu, { subtree: true, attributes: true })
		}
	}

	private readonly handleFocusChange = () => this.requestUpdate()

	override connectedCallback() {
		super.connectedCallback()
		document.addEventListener('focusin', this.handleFocusChange)
	}

	override disconnectedCallback() {
		super.disconnectedCallback()
		document.removeEventListener('focusin', this.handleFocusChange)
		this.observer.disconnect()
	}

	static override get styles() {
		return css`
			${storyStyles}
			:host { display: flex; flex-direction: column; gap: 0.75rem; min-inline-size: 20rem; font-size: small; }
			.phrase { margin: 0; padding: 0.6rem 0.75rem; border-radius: var(--mo-border-radius); background: var(--mo-color-transparent-gray-1); color: var(--mo-color-foreground); font-size: medium; }
			table { border-collapse: collapse; }
			th { text-align: start; font-weight: normal; color: var(--mo-color-gray); }
			th, td { padding: 0.2rem 0.75rem 0.2rem 0; }
		`
	}

	/** Roughly what a screen reader says for whatever holds focus. */
	private get phrase() {
		let focused = document.activeElement as HTMLElement | null
		while (focused?.shadowRoot?.activeElement) {
			focused = focused.shadowRoot.activeElement as HTMLElement
		}
		const items = [...this.menu?.children ?? []] as Array<HTMLElement>
		if (focused && items.includes(focused)) {
			const available = items.filter(item => !item.hasAttribute('disabled'))
			return `${focused.textContent?.trim()}, ${focused.getAttribute('role')}, ${available.indexOf(focused) + 1} of ${available.length}`
		}
		if (focused === this.trigger) {
			return `${this.trigger.textContent?.trim()}, button, ${this.trigger.getAttribute('aria-expanded') === 'true' ? 'expanded' : 'collapsed'}, has popup menu`
		}
		return 'Nothing in the menu button holds focus'
	}

	protected override get template() {
		const items = [...this.menu?.children ?? []] as Array<HTMLElement>
		return html`
			<h4>What the markup says</h4>
			<p class='phrase'>${this.phrase}</p>
			<table>
				<tbody>
					<tr>
						<th>trigger</th>
						<td><code>aria-haspopup</code> ${this.trigger?.getAttribute('aria-haspopup') ?? '–'}, <code>aria-expanded</code> ${this.trigger?.getAttribute('aria-expanded') ?? '–'}</td>
					</tr>
					<tr>
						<th>menu</th>
						<td><code>role</code> ${this.menu?.shadowRoot?.querySelector('[popover]')?.getAttribute('role') ?? '–'}, named after the trigger</td>
					</tr>
					${items.map(item => html`
						<tr>
							<th>${item.textContent?.trim()}</th>
							<td><code>role</code> ${item.getAttribute('role') ?? '–'}, <code>tabindex</code> ${item.getAttribute('tabindex') ?? '–'}${item.hasAttribute('disabled') ? ', disabled' : ''}</td>
						</tr>
					`)}
				</tbody>
			</table>
		`
	}
}

StoryMenuButtonReadout

@component('story-menu-button')
class StoryMenuButton extends Component {
	@state() private lastAction?: string
	@state() private trigger?: HTMLButtonElement
	@state() private menu?: StoryMenu

	protected override firstUpdated() {
		this.trigger = this.renderRoot.querySelector('button')!
		this.menu = this.renderRoot.querySelector('story-menu')!
	}

	/** Read as the press starts, as the popover's light dismissal closes the menu before the click arrives. */
	private openBeforePress?: boolean

	private readonly toggle = () => {
		if (this.menu) {
			this.menu.open = !(this.openBeforePress ?? this.menu.open)
		}
		this.openBeforePress = undefined
	}

	static override get styles() {
		return css`
			${storyStyles}
			:host { display: flex; gap: 2.5rem; flex-wrap: wrap; align-items: flex-start; }
			.panel { display: flex; flex-direction: column; gap: 0.75rem; }
			.anchor { position: relative; align-self: flex-start; }
			button {
				font: inherit; padding: 0.45rem 0.9rem; cursor: pointer;
				border: 1px solid var(--mo-color-transparent-gray-3); border-radius: var(--mo-border-radius);
				background: var(--mo-color-surface); color: var(--mo-color-foreground);
			}
			button::after { content: ' ▾' / ''; color: var(--mo-color-gray); }
			button[aria-expanded=true] { background: var(--mo-color-transparent-gray-1); }
		`
	}

	protected override get template() {
		const act = (action: string) => () => this.lastAction = action
		return html`
			<div class='panel'>
				<h4>Edit</h4>
				<div class='anchor'>
					<button
						@pointerdown=${() => this.openBeforePress = this.menu?.open}
						@click=${this.toggle}
					>Actions</button>
					<story-menu .trigger=${this.trigger}>
						<div @click=${act('Cut')}>Cut</div>
						<div @click=${act('Copy')}>Copy</div>
						<div @click=${act('Paste')}>Paste</div>
						<div disabled>Paste as plain text</div>
						<div @click=${act('Select all')}>Select all</div>
						<div @click=${act('Find')}>Find</div>
					</story-menu>
				</div>
				<p class='hint'>Last action: <code>${this.lastAction ?? 'none'}</code></p>
				<p class='hint'>
					<kbd>↓</kbd> or <kbd>↑</kbd> on the button opens the menu onto its first or last item, and <kbd>Home</kbd> and
					<kbd>End</kbd> do the same. A click opens it with no item active, and the first arrow picks one. Inside, the
					arrows move with wrapping, typing a name finds it, and <kbd>Enter</kbd>, <kbd>Space</kbd> or a click runs an item
					and closes the menu, as do <kbd>Esc</kbd>, <kbd>Tab</kbd> and focus leaving. The disabled item is skipped. That
					and all ARIA are the controller's. A press outside is the browser's popover's, and the host only toggles on a
					click of the button.
				</p>
				<p class='hint'>
					This shows the controller alone, for a menu that is not <code>mo-menu</code>. A button that opens a menu in an
					app is <code>mo-menu</code> anchored to that button, which does all of this.
				</p>
			</div>
			<story-menu-button-readout .trigger=${this.trigger} .menu=${this.menu}></story-menu-button-readout>
		`
	}
}

StoryMenuButton

export const MenuButton: StoryObj = {
	render: () => html`<story-menu-button></story-menu-button>`,
}