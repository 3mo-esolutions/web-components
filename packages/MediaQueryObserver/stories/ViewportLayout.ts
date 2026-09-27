import { Component, component, css, html } from '@a11d/lit'
import { MediaQueryController } from '@3mo/media-query-observer'
import '@3mo/flex'

/** A layout that stacks its panes on viewports narrower than 600 pixels. */
@component('story-viewport-layout')
export class ViewportLayout extends Component {
	readonly narrowController = new MediaQueryController(this, '(max-width: 600px)')

	static override get styles() {
		return css`
			:host { display: block; }
			.pane { flex: 1; padding: 1rem; border-radius: var(--mo-border-radius); background: var(--mo-color-transparent-gray-1); }
		`
	}

	protected override get template() {
		return html`
			<mo-flex direction=${this.narrowController.matches ? 'vertical' : 'horizontal'} gap='0.5rem'>
				<div class='pane'>Navigation</div>
				<div class='pane'>Content</div>
			</mo-flex>
		`
	}
}