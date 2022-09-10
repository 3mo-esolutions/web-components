import { component, css, Component, html, property } from '@a11d/lit'
import { SlotController } from '@3mo/slot-controller'
import { Button, ButtonType } from '@3mo/button'
import type { Flex } from '@3mo/flex'

/**
 * @cssprop --mo-button-group-border-radius
 * @cssprop --mo-button-group-separator-color
 *
 * @slot - The content of the which should be buttons of type mo-button
 */
@component('mo-button-group')
export class ButtonGroup extends Component {
	@property({ reflect: true }) direction: Flex['direction'] = 'horizontal'
	@property({ reflect: true, updated(this: ButtonGroup) { this.updateButtons() } }) type = ButtonType.Normal

	static override get styles() {
		return css`
			:host {
				display: inline-block;
			}

			/* Border Radius */
			::slotted([extends*=mo-button]) {
				position: relative;
				border-radius: 0px;
				--mdc-button-raised-box-shadow: none;
			}

			:host([direction=vertical]) ::slotted([extends*=mo-button][data-mo-button-group-first]) {
				border-radius: var(--mo-button-group-border-radius, 4px) var(--mo-button-group-border-radius, 4px) 0px 0px;
			}

			:host([direction=vertical]) ::slotted([extends*=mo-button][data-mo-button-group-last]) {
				border-radius: 0px 0px var(--mo-button-group-border-radius, 4px) var(--mo-button-group-border-radius, 4px);
			}

			:host([direction=vertical-reversed]) ::slotted([extends*=mo-button][data-mo-button-group-first]) {
				border-radius: 0px 0px var(--mo-button-group-border-radius, 4px) var(--mo-button-group-border-radius, 4px);
			}

			:host([direction=vertical-reversed]) ::slotted([extends*=mo-button][data-mo-button-group-last]) {
				border-radius: var(--mo-button-group-border-radius, 4px) var(--mo-button-group-border-radius, 4px) 0px 0px;
			}

			:host([direction=horizontal]) ::slotted([extends*=mo-button][data-mo-button-group-first]) {
				border-radius: var(--mo-button-group-border-radius, 4px) 0px 0px var(--mo-button-group-border-radius, 4px);
			}

			:host([direction=horizontal]) ::slotted([extends*=mo-button][data-mo-button-group-last]) {
				border-radius: 0px var(--mo-button-group-border-radius, 4px) var(--mo-button-group-border-radius, 4px) 0px;
			}

			:host([direction=horizontal-reversed]) ::slotted([extends*=mo-button][data-mo-button-group-first]) {
				border-radius: 0px var(--mo-button-group-border-radius, 4px) var(--mo-button-group-border-radius, 4px) 0px;
			}

			:host([direction=horizontal-reversed]) ::slotted([extends*=mo-button][data-mo-button-group-last]) {
				border-radius: var(--mo-button-group-border-radius, 4px) 0px 0px var(--mo-button-group-border-radius, 4px);
			}

			/* Separator */
			:host(:not([type=outlined])) ::slotted([extends*=mo-button]:not([data-mo-button-group-last]))::after {
				content: '';
				position: absolute;
			}

			:host([type=normal]) ::slotted([extends*=mo-button]:not([data-mo-button-group-last]))::after {
				background: var(--mo-button-group-separator-color, rgba(var(--mo-color-on-background-base, 0, 0, 0), 0.3));
			}

			:host([type=unelevated]) ::slotted([extends*=mo-button]:not([data-mo-button-group-last]))::after,
			:host([type=raised]) ::slotted([extends*=mo-button]:not([data-mo-button-group-last]))::after {
				background: var(--mo-button-group-separator-color, rgba(var(--mo-color-on-primary-base, 255, 255, 255), 0.3));
			}

			:host([direction=vertical]:not([type=outlined])) ::slotted([extends*=mo-button]:not([data-mo-button-group-last]))::after,
			:host([direction=vertical-reversed]:not([type=outlined])) ::slotted([extends*=mo-button]:not([data-mo-button-group-last]))::after {
				right: 15%;
				left: 15%;
				width: 70%;
				height: 1px;
			}

			:host([direction=vertical]:not([type=outlined])) ::slotted([extends*=mo-button]:not([data-mo-button-group-last]))::after {
				bottom: 0px;
			}

			:host([direction=vertical-reversed]:not([type=outlined])) ::slotted([extends*=mo-button]:not([data-mo-button-group-last]))::after {
				top: 0px;
			}

			:host([direction=horizontal]:not([type=outlined])) ::slotted([extends*=mo-button]:not([data-mo-button-group-last]))::after,
			:host([direction=horizontal-reversed]:not([type=outlined])) ::slotted([extends*=mo-button]:not([data-mo-button-group-last]))::after {
				top: 15%;
				bottom: 15%;
				height: 70%;
				width: 1px;
			}

			:host([direction=horizontal]:not([type=outlined])) ::slotted([extends*=mo-button]:not([data-mo-button-group-last]))::after {
				right: 0px;
			}

			:host([direction=horizontal-reversed]:not([type=outlined])) ::slotted([extends*=mo-button]:not([data-mo-button-group-last]))::after {
				left: 0px;
			}

			/* The following 4 rules won't work due to ::part selector and ::slotted selectors cannot be used together. https://github.com/w3c/csswg-drafts/issues/3896 */
			:host([direction=vertical][type=outlined]) ::slotted([extends*=mo-button]:not([data-mo-button-group-last]))::part(button) {
				border-bottom-width: 0px;
			}

			:host([direction=vertical-reversed][type=outlined]) ::slotted([extends*=mo-button]:not([data-mo-button-group-last]))::part(button) {
				border-top-width: 0px;
			}

			:host([direction=horizontal][type=outlined]) ::slotted([extends*=mo-button]:not([data-mo-button-group-last]))::part(button) {
				border-right-width: 0px;
			}

			:host([direction=horizontal-reversed][type=outlined]) ::slotted([extends*=mo-button]:not([data-mo-button-group-last]))::part(button) {
				border-left-width: 0px;
			}
		`
	}

	protected readonly slotController = new SlotController(this, () => this.updateButtons())

	protected get buttonElements() {
		return this.slotController.getAssignedElements('').filter((element): element is Button => element instanceof Button)
	}

	protected updateButtons() {
		for (const [index, button] of this.buttonElements.entries()) {
			button.type = this.type

			if (index === 0) {
				button.setAttribute('data-mo-button-group-first', '')
			} else {
				button.removeAttribute('data-mo-button-group-first')
			}

			if (index === this.buttonElements.length - 1) {
				button.setAttribute('data-mo-button-group-last', '')
			} else {
				button.removeAttribute('data-mo-button-group-last')
			}
		}
	}

	protected override get template() {
		return html`
			<mo-flex direction=${this.direction}>
				<slot></slot>
			</mo-flex>
		`
	}
}

declare global {
	interface HTMLElementTagNameMap {
		'mo-button-group': ButtonGroup
	}
}