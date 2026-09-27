import type { Meta, StoryObj } from '@storybook/web-components-vite'
import { html } from '@a11d/lit'
import { sourceOf } from '../../.storybook/source.js'
import dismissibleCardSource from './stories/DismissibleCard.ts?raw'
import swipeableRowSource from './stories/SwipeableRow.ts?raw'
import detentPanelSource from './stories/DetentPanel.ts?raw'
import scrollingCardSource from './stories/ScrollingCard.ts?raw'
import pullToRefreshSource from './stories/PullToRefresh.ts?raw'
import './stories/DismissibleCard.js'
import './stories/SwipeableRow.js'
import './stories/DetentPanel.js'
import './stories/ScrollingCard.js'
import './stories/PullToRefresh.js'

export default {
	title: 'Behaviors / Swipeability',
} satisfies Meta

/** Swipe the card towards the end: past a quarter of the way, or with a flick, it settles at the far detent and is gone. */
export const Default: StoryObj = {
	parameters: sourceOf(dismissibleCardSource),
	render: () => html`<story-dismissible-card></story-dismissible-card>`,
}

/** Swipe the row towards the start: it parks at the width of the actions behind it, and swipes back to close. */
export const SwipeToRevealActions: StoryObj = {
	parameters: sourceOf(swipeableRowSource),
	render: () => html`<story-swipeable-row></story-swipeable-row>`,
}

/** Drag the panel up and down: it peeks, half-opens and fills, moving one detent per gesture. */
export const MultipleDetents: StoryObj = {
	parameters: sourceOf(detentPanelSource),
	render: () => html`<story-detent-panel></story-detent-panel>`,
}

/** Drag inside the box and it scrolls instead of the card - until it reaches its top, when the gesture becomes the card's again. */
export const ScrollDeference: StoryObj = {
	parameters: sourceOf(scrollingCardSource),
	render: () => html`<story-scrolling-card></story-scrolling-card>`,
}

/** Reaching a detent need not park the surface there: pulled all the way down, it refreshes and springs back. */
export const PullToAct: StoryObj = {
	parameters: sourceOf(pullToRefreshSource),
	render: () => html`<story-pull-to-refresh></story-pull-to-refresh>`,
}