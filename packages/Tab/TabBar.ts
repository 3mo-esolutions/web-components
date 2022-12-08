import { component, property, event, Component, html, state, ifDefined } from '@a11d/lit'
import '@material/mwc-tab-bar'
import { Tab } from './Tab.js'

/**
 * @element mo-tab-bar
 *
 * @attr value
 *
 * @slot - Default slot for tab elements
 *
 * @fires change {CustomEvent<string | undefined>}
 */
@component('mo-tab-bar')
export class TabBar extends Component {
	@event() readonly change!: EventDispatcher<string | undefined>

	override get template() {
		return html`
			<mwc-tab-bar
				activeIndex=${ifDefined(this.activeIndex)}
				@MDCTabBar:activated=${this.handleTabActivated}
			>
				<slot @slotchange=${() => this.value = this.value}></slot>
			</mwc-tab-bar>
		`
	}

	private _value?: string
	@property()
	get value() { return this._value }
	set value(value) {
		this._value = value
		this.activeIndex = this.tabs.findIndex(tab => tab.value === this.value)
	}

	@state() private activeIndex?: number

	get tabs() {
		return [...this.children].filter((c): c is Tab => c instanceof Tab)
	}

	private readonly handleTabActivated = (e: CustomEvent<{ readonly index: number }>) => {
		this.activeIndex = e.detail.index
		this.change.dispatch(this.tabs.at(this.activeIndex)?.value)
	}
}

declare global {
	interface HTMLElementTagNameMap {
		'mo-tab-bar': TabBar
	}
}