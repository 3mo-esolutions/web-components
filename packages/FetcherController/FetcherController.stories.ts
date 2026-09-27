import type { Meta, StoryObj } from '@storybook/web-components-vite'
import { html } from '@a11d/lit'
import { sourceOf } from '../../.storybook/source.js'
import peopleSearchSource from './stories/PeopleSearch.ts?raw'
import quoteOfTheDaySource from './stories/QuoteOfTheDay.ts?raw'
import './stories/PeopleSearch.js'
import './stories/QuoteOfTheDay.js'

export default {
	title: 'Behaviors / Fetcher Controller',
} satisfies Meta

/** The fetch runs whenever `args` changes. `throttle` lets the first keystroke of a burst through at once and the last after half a second of quiet. Type a name. */
export const Default: StoryObj = {
	parameters: sourceOf(peopleSearchSource),
	render: () => html`<story-people-search></story-people-search>`,
}

/** With `autoRun: false` nothing is fetched until `run()` is called, here by the button. */
export const ManualRun: StoryObj = {
	parameters: sourceOf(quoteOfTheDaySource),
	render: () => html`<story-quote-of-the-day></story-quote-of-the-day>`,
}