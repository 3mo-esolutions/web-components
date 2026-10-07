import { Component, component, css, html } from '@a11d/lit'
import { ResizeController } from '@3mo/resize-observer'
import '@3mo/flex'

/** A card that stacks its content when it is narrower than 320 pixels, whatever the viewport's width. */
@component('story-responsive-card')
export class ResponsiveCard extends Component {
	readonly resizeController = new ResizeController(this, {
		callback: () => this.getBoundingClientRect().width < 320,
	})

	static override get styles() {
		return css`
			:host {
				display: block; inline-size: 28rem; min-inline-size: 12rem; max-inline-size: 100%; padding: 1rem;
				resize: horizontal; overflow: auto;
				border: 1px solid var(--mo-color-transparent-gray-3); border-radius: var(--mo-border-radius);
			}
			.picture { inline-size: 6rem; block-size: 6rem; border-radius: var(--mo-border-radius); background: var(--mo-color-accent); }
		`
	}

	protected override get template() {
		return html`
			<mo-flex direction=${this.resizeController.value ? 'vertical' : 'horizontal'} gap='1rem'>
				<div class='picture'></div>
				<mo-flex gap='0.25rem'>
					<strong>Ada Lovelace</strong>
					<span>Analyst</span>
				</mo-flex>
			</mo-flex>
		`
	}
}
