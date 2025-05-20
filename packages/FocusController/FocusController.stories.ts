import type { Meta, StoryObj } from '@storybook/web-components'
import { Component, css, html, state, style } from '@a11d/lit'
import p from './package.json'
import { FocusController as FocusC } from './FocusController.js'

export default {
	title: 'Utilities / Focus Controller',
	package: p,
} as Meta

class StoryFocusController extends Component {
	@state() protected focused = false
	@state() protected bubbled = false
	@state() protected method = ''

	protected readonly focusController = new FocusC(this, {
		handleChange: (focused, bubbled, method) => [this.focused, this.bubbled, this.method] = [focused, bubbled, method],
	})

	static override get styles() {
		return css`
			:host {
				display: inline-block;
			}
		`
	}

	protected override get template() {
		const focusText = this.focused ? 'focused' : 'not focused'
		const bubbleText = this.bubbled ? '(bubbled)' : ''
		const methodText = this.focused && this.method ? `using method "${this.method}"` : ''
		return html`
			<mo-flex direction='horizontal' ${style({ position: 'relative', border: !this.focused ? '2px dashed var(--mo-color-red)' : '2px dashed var(--mo-color-green)', padding: '50px' })}>
				<mo-flex gap='10px' style='width: 300px'>
					<mo-button type='outlined'>Focusable element 1</mo-button>
					<div type='outlined' style='border: 2px dashed var(--mo-color-gray); padding: 10px; width: 100%; box-sizing: border-box;'>Non focusable element</div>
					<div tabindex='0' type='outlined' style='border: 2px dashed var(--mo-color-accent); padding: 10px; width: 100%; box-sizing: border-box;'>Focusable element 2</div>
				</mo-flex>
				<span ${style({ position: 'absolute', color: !this.focused ? 'var(--mo-color-red)' : 'var(--mo-color-green)', right: '8px', bottom: '8px' })}>${focusText} ${bubbleText} ${methodText}</span>
			</mo-flex>
		`
	}
}

customElements.define('story-focus-controller', StoryFocusController)

export const FocusController: StoryObj = {
	render: () => html`
		<div>
			<story-focus-controller></story-focus-controller>
			<mo-button type='outline' style='width: auto'>Outside</mo-button>
		</div>
	`
}