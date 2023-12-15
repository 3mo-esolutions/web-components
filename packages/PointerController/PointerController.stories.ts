import { story, meta } from '../../.storybook/story.js'
import { Component, css, html } from '@a11d/lit'
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

	protected override get template() {
		return html`
			<mo-button type='raised'>
				Content ${!this.pointerController.hover ? '' : '(Hovered)'} ${!this.pointerController.press ? '' : '(Pressed)'}
			</mo-button>
		`
	}
}

customElements.define('story-pointer-controller', StoryPointerController)

export const PointerController = story({
	render: () => html`<story-pointer-controller></story-pointer-controller>`
})