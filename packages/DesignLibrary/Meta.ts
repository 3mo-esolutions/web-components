import { component, html, property, Component, style } from  '@a11d/lit'
import type { MaterialIcon } from '@3mo/icon'
import type { Flex } from '@3mo/flex'

/**
 * @slot
 * @slot icon
 */
@component('mo-meta')
export class Meta extends Component {
	@property() heading?: string
	@property() label?: string
	@property() icon?: MaterialIcon
	@property({ reflect: true }) direction: Flex['direction'] = 'vertical'

	protected override get template() {
		return html`
			<style>
				:host {
					display: flex;
					align-items: center;
					--mo-meta-gap: 0px;
				}

				:host([direction=horizontal]), :host([direction=horizontal-reversed]) {
					--mo-meta-gap: 6px;
				}

				mo-heading {
					color: var(--mo-color-gray);
					font-size: small;
					font-weight: 400;
					justify-content: end;
					height: 20px;
					line-height: 20px;
					display: none;
					font-weight: 500;
				}

				:host([heading]) mo-heading {
					display: block;
				}

				:host([icon]) mo-flex {
					padding-inline-start: 6px
				}

				:host([direction=vertical]) mo-flex, :host([direction=vertical-reversed]) mo-flex {
					justify-content: center;
				}

				:host([direction=horizontal]) mo-flex, :host([direction=horizontal-reversed]) mo-flex {
					align-items: center;
				}

				span {
					margin: 0;
					color: var(--mo-color-foreground);
					font-weight: 400;
				}

				span {
					overflow-wrap: anywhere;
				}

				::slotted {
					position: absolute;
					justify-content: center;
					align-items: center;
					inset-inline-end: var(--mo-thickness-xl);
				}
			</style>

			<slot part='icon' name='icon'>
				${this.iconTemplate}
			</slot>

			<mo-flex ${style({ flex: '1' })} gap='var(--mo-meta-gap)' direction=${this.direction}>
				<mo-heading typography='subtitle2' part='heading'>${this.heading}</mo-heading>
				<span>
					<slot></slot>
					${!this.label ? html.nothing : html`<mo-label part='label'>${this.label}</mo-label>`}
				</span>
			</mo-flex>
		`
	}

	private get iconTemplate() {
		return !this.icon ? html.nothing : html`
			<mo-icon part='icon' icon=${this.icon}></mo-icon>
		`
	}
}

declare global {
	interface HTMLElementTagNameMap {
		'mo-meta': Meta
	}
}