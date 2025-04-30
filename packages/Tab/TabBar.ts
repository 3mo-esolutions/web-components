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

	get tabs() { return [...this.children].filter((c): c is Tab => c instanceof Tab) }

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

	private slotChangesTimes = 0
	private slotChange = async () => {
		if (this.slotChangesTimes++ === 0) {
			await Promise.all([
				this.updateComplete,
				this.tabsElement.updateComplete,
				...this.tabs.map(tab => tab.updateComplete)
			])
			this.dispatchChange()
		}
	}

	private syncActiveTab() {
		if (this.activeTab) {
			this.tabsElement.activeTab = this.activeTab
		}
	}

	private dispatchChange() {
		this.value = (this.tabsElement.activeTab as Tab | undefined)?.value
		this.change.dispatch(this.activeTab?.value)
	}
}

declare global {
	interface HTMLElementTagNameMap {
		'mo-tab-bar': TabBar
	}
}