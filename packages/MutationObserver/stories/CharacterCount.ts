import { Component, component, css, html } from '@a11d/lit'
import { MutationController } from '@3mo/mutation-observer'

/** A frame that counts the characters of whatever it holds, even as they are typed into an editable child. */
@component('story-character-count')
export class CharacterCount extends Component {
	readonly mutationController = new MutationController(this, {
		config: { childList: true, characterData: true, subtree: true },
	})

	static override get styles() {
		return css`
			:host { display: flex; flex-direction: column; gap: 0.25rem; inline-size: 20rem; }
			small { align-self: flex-end; color: var(--mo-color-gray); }
		`
	}

	protected override get template() {
		return html`
			<slot></slot>
			<small>${this.textContent?.trim().length ?? 0} characters</small>
		`
	}
}