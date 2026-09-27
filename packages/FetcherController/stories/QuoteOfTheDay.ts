import { Component, component, css, html } from '@a11d/lit'
import { FetcherController } from '@3mo/fetcher-controller'
import '@3mo/button'
import '@3mo/linear-progress'

const quotes = [
	'Simplicity is prerequisite for reliability.',
	'Premature optimization is the root of all evil.',
	'The most dangerous phrase in the language is "We\'ve always done it this way."',
	'Controlling complexity is the essence of computer programming.',
]

/** A quote that loads only when asked to, rendering each state of the fetch with `render()`. */
@component('story-quote-of-the-day')
export class QuoteOfTheDay extends Component {
	readonly fetcherController = new FetcherController(this, {
		autoRun: false,
		fetch: async () => {
			await new Promise(resolve => setTimeout(resolve, 600))
			return quotes[Math.floor(Math.random() * quotes.length)]!
		},
	})

	static override get styles() {
		return css`
			:host { display: flex; flex-direction: column; align-items: flex-start; gap: 1rem; inline-size: 24rem; }
			blockquote { margin: 0; font-style: italic; }
			mo-linear-progress { align-self: stretch; }
		`
	}

	protected override get template() {
		return html`
			<mo-button type='outlined' ?disabled=${this.fetcherController.pending} @click=${() => this.fetcherController.run()}>Load a quote</mo-button>
			${this.fetcherController.render({
				pending: () => html`<mo-linear-progress></mo-linear-progress>`,
				complete: quote => html`<blockquote>${quote}</blockquote>`,
			})}
		`
	}
}