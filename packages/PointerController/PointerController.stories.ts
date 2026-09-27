import type { Meta, StoryObj } from '@storybook/web-components-vite'
import { html } from '@a11d/lit'
import { sourceOf } from '../../.storybook/source.js'
import pointerAreaSource from './stories/PointerArea.ts?raw'
import hoverBoxSource from './stories/HoverBox.ts?raw'
import './stories/PointerArea.js'
import './stories/HoverBox.js'

export default {
	title: 'Behaviors / Pointer Controller',
} satisfies Meta

/** Hover and press the area with a mouse, a pen or a finger: it reports all three. */
export const Default: StoryObj = {
	parameters: sourceOf(pointerAreaSource),
	render: () => html`<story-pointer-area></story-pointer-area>`,
}

/** Hover follows the boundary events, which also fire when the layout moves the box under a resting pointer - rest it where the box's edge passes. */
export const HoverUnderLayoutShift: StoryObj = {
	parameters: sourceOf(hoverBoxSource),
	render: () => html`
		<style>
			@keyframes story-layout-shift { from { block-size: 0 } to { block-size: 50px } }
		</style>
		<div style='inline-size: 480px'>
			<div style='animation: story-layout-shift 1s ease-in-out infinite alternate'></div>
			<story-hover-box></story-hover-box>
		</div>
	`,
}