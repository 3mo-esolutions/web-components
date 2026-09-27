import { html, render } from 'lit'
import type { Decorator } from '@storybook/web-components-vite'

/** Renders its template once it comes near the viewport. */
class StoryWhenVisible extends HTMLElement {
	private visible = false
	private content: unknown
	private readonly observer = new IntersectionObserver(entries => {
		if (entries.some(entry => entry.isIntersecting)) {
			this.observer.disconnect()
			this.visible = true
			this.style.minHeight = ''
			render(this.content, this)
		}
	}, { rootMargin: '600px 0px' })

	set template(value: unknown) {
		this.content = value
		if (this.visible) {
			render(value, this)
		}
	}

	connectedCallback() {
		this.style.display = 'block'
		if (!this.visible) {
			this.style.minHeight = '8rem'
			this.observer.observe(this)
		}
	}

	disconnectedCallback() {
		this.observer.disconnect()
	}
}

customElements.define('story-when-visible', StoryWhenVisible)

/** A docs page renders every story at once, so there each one renders only once it scrolls into reach. */
export const renderWhenVisible: Decorator = (story, { viewMode }) =>
	viewMode !== 'docs' ? story() : html`<story-when-visible .template=${story()}></story-when-visible>`