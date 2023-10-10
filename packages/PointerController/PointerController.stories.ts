import { story, meta } from '../../.storybook/story.js'
import { Component, css, html, state } from '@a11d/lit'
import p from './package.json'
import { PointerController as PointerC } from './PointerController.js'

export default meta({
	title: 'PointerController',
	parameters: {
		docs: {
			description: {
				component: p.description,
			},
		}
	}
})

class StoryPointerController extends Component {
	protected readonly pointerController = new PointerC(this)

	static override get styles() {
		return css`
			:host {
				display: inline-block;
			}
		`
	}

	@state() toggled = false

	protected override get template() {
		return html`
			<mo-button type='raised' @click=${() => this.toggled = !this.toggled}>
				Content ${!this.pointerController.hover ? html.nothing : '(Hovered)'} ${!this.toggled ? html.nothing : '(Toggle)'}
			</mo-button>
		`
	}
}

customElements.define('story-pointer-controller', StoryPointerController)

export const PointerController = story({
	render: () => html`<story-pointer-controller></story-pointer-controller>`
})