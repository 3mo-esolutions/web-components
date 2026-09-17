import { bind, Component, component, css, event, html, property, query, queryAssignedElements, type PropertyValues } from '@a11d/lit'
import { type TabBar } from './TabBar.js'
import { TabPanel } from './TabPanel.js'

/**
 * A tabbed interface: a bar of tabs and the panels they reveal, of which one is shown at a time.
 *
 * It is the whole ARIA tabs pattern in one element. The tabs go into the default slot and are handed on to a
 * "mo-tab-bar", which contributes the "tablist", the arrow-key navigation and the indicator. The panels are
 * "mo-tab-panel" elements which assign themselves to the "panel" slot and, unlike anything a container could
 * render for them, stay in the tree the tabs were written in - the only place a tab can point at, as no
 * element may reference into a shadow root beneath it.
 *
 * What the tabs adds on top of the two is the pairing: each panel is matched with the tab of the same
 * "value", the two are linked both ways so that a tab announces what it controls and a panel is named after
 * its tab, and the panel of the current value is the one shown.
 *
 * Reach for a "mo-tab-bar" on its own where the tabs and the content they switch cannot share a box, such as
 * a bar which belongs into the header slot of a page while its content fills the body.
 *
 * @element mo-tabs
 *
 * @attr value - The "value" of the active tab, and therefore of the panel being shown.
 *
 * @slot - The tabs.
 * @slot panel - The panels. A "mo-tab-panel" assigns itself to it.
 *
 * @csspart bar - The tab bar.
 *
 * @fires change - Dispatched with the new value whenever the tabs arrive at one themselves, as the platform has it for every control which is a choice.
 */
@component('mo-tabs')
export class Tabs extends Component {
	private static idCounter = 0

	@event() readonly change!: EventDispatcher<string | undefined>

	@property({ bindingDefault: true, event: 'change' }) value?: string

	@query('mo-tab-bar') private readonly tabBar?: TabBar

	@queryAssignedElements({ slot: 'panel', flatten: true }) private readonly assignedPanels!: Array<Element>

	get tabs() { return this.tabBar?.tabs ?? [] }

	get panels() {
		return this.assignedPanels.filter((element): element is TabPanel => element instanceof TabPanel)
	}

	static override get styles() {
		return css`
			:host {
				display: flex;
				flex-direction: column;
				min-block-size: 0;
			}
		`
	}

	protected override get template() {
		return html`
			<mo-tab-bar part='bar' ${bind(this, 'value', { sourceUpdated: () => this.change.dispatch(this.value) })}>
				<slot @slotchange=${this.handleSlotChange}></slot>
			</mo-tab-bar>
			<slot name='panel' @slotchange=${this.handleSlotChange}></slot>
		`
	}

	protected override updated(properties: PropertyValues<this>) {
		super.updated(properties)
		this.pair()
	}

	private readonly handleSlotChange = () => this.requestUpdate()

	/** Matches every panel with the tab of its value, links the two and shows the one which is current. */
	private pair() {
		const { tabs, panels } = this

		for (const panel of panels) {
			panel.active = panel.value === this.value
			const tab = tabs.find(tab => tab.value === panel.value)
			if (!tab) {
				panel.removeAttribute('aria-labelledby')
				continue
			}
			tab.id ||= `mo-tab-${++Tabs.idCounter}`
			panel.id ||= `mo-tab-panel-${++Tabs.idCounter}`
			tab.setAttribute('aria-controls', panel.id)
			panel.setAttribute('aria-labelledby', tab.id)
		}

		for (const tab of tabs) {
			if (panels.some(panel => panel.value === tab.value) === false) {
				tab.removeAttribute('aria-controls')
			}
		}
	}
}

declare global {
	interface HTMLElementTagNameMap {
		'mo-tabs': Tabs
	}
}