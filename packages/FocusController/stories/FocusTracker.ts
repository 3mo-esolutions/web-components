import { Component, component, css, html, state } from '@a11d/lit'
import { FocusController, type FocusMethod } from '@3mo/focus-controller'

/** A box that shows whether the focus is within it, how it got there and whether it landed on a descendant. */
@component('story-focus-tracker')
export class FocusTracker extends Component {
	@state() private method?: FocusMethod
	@state() private bubbled = false

	readonly focusController = new FocusController(this, {
		handleChange: (focused, bubbled, method) => {
			this.toggleAttribute('data-focused', focused)
			this.bubbled = bubbled
			this.method = method
		},
	})

	static override get styles() {
		return css`
			:host {
				display: flex;
				flex-direction: column;
				gap: 10px;
				inline-size: 300px;
				padding: 24px;
				border: 2px dashed var(--mo-color-red);
				color: var(--mo-color-red);
			}

			:host([data-focused]) {
				border-color: var(--mo-color-green);
				color: var(--mo-color-green);
			}

			::slotted(div) {
				padding: 10px;
				border: 1px dashed var(--mo-color-gray);
				color: var(--mo-color-foreground);
			}
		`
	}

	protected override get template() {
		return html`
			<slot></slot>
			<small>${!this.focusController.focused ? 'not focused' : ['focused', this.method, this.bubbled ? 'bubbled' : ''].filter(Boolean).join(' · ')}</small>
		`
	}
}