import { bind, Component, component, css, event, html, property, query, queryAssignedElements, type PropertyValues } from '@a11d/lit'
import { type TabBar } from './TabBar.js'
import { TabPanel } from './TabPanel.js'

/**
 * A tabbed interface: a bar of tabs and the panels they reveal, of which one is shown at a time.
 *
 * Each `mo-tab-panel` is paired with the tab of the same `value`, and the two are linked for assistive technologies.
 *
 * @element mo-tabs
 *
 * @attr value - The `value` of the active tab, and therefore of the panel being shown
 *
 * @slot - The `mo-tab` elements
 * @slot panel - The panels; a `mo-tab-panel` assigns itself to it
 *
 * @csspart bar - The tab bar
 *
 * @fires change - Dispatched with the new value whenever the tabs change it themselves, as opposed to a `value` set from outside
 *
 * @accessibility
 * The bar is a `tablist` and each tab a `tab` with `aria-selected`; every tab is linked to the panel of the same `value` through `aria-controls` and `aria-labelledby`, with made-up ids. A panel is a focusable `tabpanel`, unless it has a `tabindex` of its own.
 * Focus roves, and the tab that receives focus is activated at once.
 *
 * | Key | Does |
 * | --- | --- |
 * | `ArrowRight` `ArrowLeft` | Activates the next or previous tab, wrapping. |
 * | `Home` `End` | Activates the first or last tab. |
 *
 * Give a tab with only an icon an `aria-label`.
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
