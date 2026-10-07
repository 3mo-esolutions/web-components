import type { Meta, StoryObj } from '@storybook/web-components-vite'
import { html } from '@a11d/lit'
import { dependsOnScreenSize, hideOnScreenSize } from '@3mo/screen-size'

export default {
	title: 'Behaviors / Screen Size',
	decorators: [story => html`<div style='display: flex; flex-direction: column; align-items: flex-start; gap: 8px'>${story()}</div>`],
} satisfies Meta

/** Narrow the viewport: the text follows mobile (up to 640px), tablet (up to 1024px) and desktop. */
export const Default: StoryObj = {
	render: () => html`
		<span>${dependsOnScreenSize({ mobile: 'Mobile', tablet: 'Tablet', desktop: 'Desktop' })}</span>
	`,
}

/** A size left out takes the value of the next larger one: tablet shows the desktop value here. */
export const Fallback: StoryObj = {
	render: () => html`
		<span>${dependsOnScreenSize({ mobile: 'Mobile', desktop: 'Tablet or desktop' })}</span>
	`,
}

/** The values can be templates: an icon button on mobile, a labelled one on larger screens. */
export const Templates: StoryObj = {
	render: () => html`
		${dependsOnScreenSize({
			mobile: html`<mo-icon-button icon='add'></mo-icon-button>`,
			desktop: html`<mo-button type='outlined' startIcon='add'>New</mo-button>`,
		})}
	`,
}

/** `hideOnScreenSize` hides an element on the sizes it names. */
export const HideOnScreenSize: StoryObj = {
	render: () => html`
		<div>Never hidden</div>
		<div ${hideOnScreenSize('mobile')}>Hidden on mobile</div>
		<div ${hideOnScreenSize('tablet')}>Hidden on tablet</div>
		<div ${hideOnScreenSize('desktop')}>Hidden on desktop</div>
		<div ${hideOnScreenSize('mobile', 'tablet')}>Hidden on mobile and tablet</div>
		<div ${hideOnScreenSize('tablet', 'desktop')}>Hidden on tablet and desktop</div>
		<div ${hideOnScreenSize('mobile', 'desktop')}>Hidden on mobile and desktop</div>
	`,
}
