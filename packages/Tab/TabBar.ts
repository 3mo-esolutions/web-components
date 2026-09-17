import { component, property, event, Component, html, css, query } from '@a11d/lit'
import { type MdTabs } from '@material/web/tabs/tabs.js'
import { Tab } from './Tab.js'

/**
 * @element mo-tab-bar
 *
 * @ssr true
 *
 * @attr value
 *
 * @slot - Default slot for tab elements
 *
 * @fires change
 */
@component('mo-tab-bar')
export class TabBar extends Component {
	@event() readonly change!: EventDispatcher<string | undefined>

	@property({
		bindingDefault: true,
		updated(this: TabBar) {
			this.syncActiveTab()
		}
	}) value?: string

	@query('md-tabs') private readonly tabsElement!: MdTabs

	protected override initialized() {
		// This is needed as updated callback is not called on first render only in SSR
		this.syncActiveTab()
	}

	get tabs() {
		// Flattened, so that a bar which is handed its tabs through a slot of its own - as "mo-tabs" does - sees them too.
		const slot = this.shadowRoot?.querySelector('slot')
		const elements = slot ? slot.assignedElements({ flatten: true }) : [...this.children]
		return elements.filter((c): c is Tab => c instanceof Tab)
	}

	static override get styles() {
		return css`
			:host {
				display: block;
			}

			md-tabs {
				height: inherit;
				--md-divider-color: var(--mo-tab-divider-color, var(--mo-color-transparent-gray-3));
			}
		`
	}

	protected override get template() {
		return html`
			<md-tabs autoActivate @change=${() => this.dispatchChange()}>
				<slot @slotchange=${this.slotChange}></slot>
			</md-tabs>
		`
	}

	private get activeTab() { return this.tabs.find(tab => tab.value === this.value) }

	private slotChange = async () => {
		await Promise.all([
			this.updateComplete,
			this.tabsElement.updateComplete,
			...this.tabs.map(tab => tab.updateComplete)
		])
		// Every change counts, as a slot fills one tab at a time while the markup around it is parsed.
		this.syncActiveTab()
		// A bar which was given a value keeps it, as the tab it names may still be on its way in.
		if (this.value === undefined) {
			this.dispatchChange()
		}
	}

	private syncActiveTab() {
		if (this.activeTab) {
			this.tabsElement.activeTab = this.activeTab
		}
	}

	private dispatchChange() {
		const activeTab = this.tabsElement.activeTab as Tab | null
		if (!activeTab || activeTab.value === this.value) {
			return
		}

		this.value = activeTab.value
		this.change.dispatch(this.value)
	}
}

declare global {
	interface HTMLElementTagNameMap {
		'mo-tab-bar': TabBar
	}
}