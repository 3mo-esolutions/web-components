import { component, css, Component, html, property, unsafeCSS } from '@a11d/lit'
import { SlotController } from '@3mo/slot-controller'
import { Button, ButtonType } from '@3mo/button'
import type { Flex } from '@3mo/flex'

/**
 * @element mo-button-group
 *
 * @ssr true - In SSR all buttons should get their type explicitly.
 *
 * @attr direction - The direction of the buttons.
 * @attr type - The type of the buttons which will be passed down to all buttons.
 *
 * @cssprop --mo-button-group-border-radius - The border radius of the buttons.
 * @cssprop --mo-button-group-separator-color - The color of the separator between buttons.
 *
 * @slot - The content of the which should be buttons of type mo-button
 */
@component('mo-button-group')
export class ButtonGroup extends Component {
	@property({ reflect: true }) direction: Flex['direction'] = 'horizontal'
	@property({ reflect: true }) type: Exclude<ButtonType, ButtonType.Elevated> = ButtonType.Text

	static override get styles() {
		const text = unsafeCSS(ButtonType.Text)
		const outlined = unsafeCSS(ButtonType.Outlined)
		const filled = unsafeCSS(ButtonType.Filled)
		return css`
			:host {
				display: inline-block;
			}

			/* Border Radius */
			::slotted([instanceof*=mo-button]) {
				position: relative;
				border-radius: 0px;
			}

			:host([direction=vertical]) {
				::slotted([instanceof*=mo-button][data-mo-button-group-first]) {
					border-start-start-radius: var(--mo-button-group-border-radius, var(--mo-border-radius));
					border-start-end-radius: var(--mo-button-group-border-radius, var(--mo-border-radius));
				}

				::slotted([instanceof*=mo-button][data-mo-button-group-last]) {
					border-end-end-radius: var(--mo-button-group-border-radius, var(--mo-border-radius));
					border-end-start-radius: var(--mo-button-group-border-radius, var(--mo-border-radius));
				}
			}

			:host([direction=vertical-reversed]) {
				::slotted([instanceof*=mo-button][data-mo-button-group-first]) {
					border-end-end-radius: var(--mo-button-group-border-radius, var(--mo-border-radius));
					border-end-start-radius: var(--mo-button-group-border-radius, var(--mo-border-radius));
				}

				::slotted([instanceof*=mo-button][data-mo-button-group-last]) {
					border-start-start-radius: var(--mo-button-group-border-radius, var(--mo-border-radius));
					border-start-end-radius: var(--mo-button-group-border-radius, var(--mo-border-radius));
				}
			}

			:host([direction=horizontal]) {
				::slotted([instanceof*=mo-button][data-mo-button-group-first]) {
					border-start-start-radius: var(--mo-button-group-border-radius, var(--mo-border-radius));
					border-end-start-radius: var(--mo-button-group-border-radius, var(--mo-border-radius));
				}

				::slotted([instanceof*=mo-button][data-mo-button-group-last]) {
					border-start-end-radius: var(--mo-button-group-border-radius, var(--mo-border-radius));
					border-end-end-radius: var(--mo-button-group-border-radius, var(--mo-border-radius));
				}
			}

			:host([direction=horizontal-reversed]) {
				::slotted([instanceof*=mo-button][data-mo-button-group-first]) {
					border-start-end-radius: var(--mo-button-group-border-radius, var(--mo-border-radius));
					border-end-end-radius: var(--mo-button-group-border-radius, var(--mo-border-radius));
				}

				::slotted([instanceof*=mo-button][data-mo-button-group-last]) {
					border-start-start-radius: var(--mo-button-group-border-radius, var(--mo-border-radius));
					border-end-start-radius: var(--mo-button-group-border-radius, var(--mo-border-radius));
				}
			}

			/* Separator */
			:host(:not([type=${outlined}])) ::slotted([instanceof*=mo-button]:not([data-mo-button-group-last]))::after {
				content: '';
				position: absolute;
			}

			:host([type=${text}]) ::slotted([instanceof*=mo-button]:not([data-mo-button-group-last]))::after {
				background: var(--mo-button-group-separator-color, color-mix(in srgb, currentColor, transparent 70%));
			}

			:host([type=${filled}]) {
				::slotted([instanceof*=mo-button]:not([data-mo-button-group-last]))::after {
					background: var(--mo-button-group-separator-color, color-mix(in srgb, var(--mo-color-on-accent), transparent 70%));
				}
			}

			:host([direction=vertical]:not([type=${outlined}])), :host([direction=vertical-reversed]:not([type=${filled}])) {
				::slotted([instanceof*=mo-button]:not([data-mo-button-group-last]))::after {
					inset-inline-end: 15%;
					inset-inline-start: 15%;
					width: 70%;
					height: 1px;
				}
			}

			:host([direction=vertical]:not([type=${outlined}])) ::slotted([instanceof*=mo-button]:not([data-mo-button-group-last]))::after {
				bottom: 0px;
			}

			:host([direction=vertical-reversed]:not([type=${outlined}])) ::slotted([instanceof*=mo-button]:not([data-mo-button-group-last]))::after {
				top: 0px;
			}

			:host([direction=horizontal]:not([type=${outlined}])), :host([direction=horizontal-reversed]:not([type=${outlined}])) {
				::slotted([instanceof*=mo-button]:not([data-mo-button-group-last]))::after {
					top: 15%;
					bottom: 15%;
					height: 70%;
					width: 1px;
				}
			}

			:host([direction=horizontal]:not([type=${outlined}])) ::slotted([instanceof*=mo-button]:not([data-mo-button-group-last]))::after {
				inset-inline-end: 0px;
			}

			:host([direction=horizontal-reversed]:not([type=${outlined}])) ::slotted([instanceof*=mo-button]:not([data-mo-button-group-last]))::after {
				inset-inline-start: 0px;
			}

			/* The following 4 rules won't work due to ::part selector and ::slotted selectors cannot be used together. https://github.com/w3c/csswg-drafts/issues/3896 */
			:host([direction=vertical][type=${outlined}]) ::slotted([instanceof*=mo-button]:not([data-mo-button-group-last]))::part(button) {
				border-block-end-width: 0px;
			}

			:host([direction=vertical-reversed][type=${outlined}]) ::slotted([instanceof*=mo-button]:not([data-mo-button-group-last]))::part(button) {
				border-block-start-width: 0px;
			}

			:host([direction=horizontal][type=${outlined}]) ::slotted([instanceof*=mo-button]:not([data-mo-button-group-last]))::part(button) {
				border-inline-end-width: 0px;
			}

			:host([direction=horizontal-reversed][type=${outlined}]) ::slotted([instanceof*=mo-button]:not([data-mo-button-group-last]))::part(button) {
				border-inline-start-width: 0px;
			}
		`
	}

	protected readonly slotController = new SlotController(this)

	protected override updated(...parameters: Parameters<Component['updated']>) {
		super.updated(...parameters)
		this.updateButtons()
	}

	protected override get template() {
		return html`
			<mo-flex direction=${this.direction}>
				<slot @slotchange=${this.updateButtons.bind(this)}></slot>
			</mo-flex>
		`
	}

	protected updateButtons() {
		this.slotController.getAssignedElements('')
			.filter((e): e is Button => e instanceof Button)
			.forEach((button, index, buttons) => {
				button.type = this.type
				button.toggleAttribute('data-mo-button-group-first', index === 0)
				button.toggleAttribute('data-mo-button-group-last', index === buttons.length - 1)
			})
	}
}

declare global {
	interface HTMLElementTagNameMap {
		'mo-button-group': ButtonGroup
	}
}