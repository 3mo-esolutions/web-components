import type { Meta, StoryObj } from '@storybook/web-components-vite'
import { html } from '@a11d/lit'
import { sourceOf } from '../../.storybook/source.js'
import templateFieldSource from './stories/TemplateField.ts?raw'
import steppingFieldSource from './stories/SteppingField.ts?raw'
import codeFieldSource from './stories/CodeField.ts?raw'
import './stories/TemplateField.js'
import './stories/SteppingField.js'
import './stories/CodeField.js'

export default {
	title: 'Behaviors / Segmented Input',
	parameters: { controller: 'SegmentedInputController' },
} satisfies Meta

/** Type digits and the focus moves on by itself; the arrows walk the units, Backspace empties one and steps back, and the separators stay inert. */
export const Default: StoryObj = {
	parameters: sourceOf(templateFieldSource),
	render: () => html`<story-template-field pattern='##/####' label='Expiry'></story-template-field>`,
}

/** The segments decide everything: how many units there are, how wide they are and what they take. */
export const Templates: StoryObj = {
	decorators: [story => html`<div style='display: flex; flex-wrap: wrap; gap: 2rem'>${story()}</div>`],
	render: () => html`
		<story-template-field pattern='#### #### #### ####' label='Card number'></story-template-field>
		<story-template-field pattern='###.###.###.###' label='IP address'></story-template-field>
		<story-template-field pattern='AAAA-AAAA-AAAA' label='License key' uppercase></story-template-field>
		<story-template-field pattern='##/##' label='Expiry'></story-template-field>
	`,
}

/** `direction: 'rtl'` keeps the order the language reads the units in, as the segments are text rather than boxes; the digits within a unit still run left to right. */
export const RightToLeft: StoryObj = {
	render: () => html`<story-template-field dir='rtl' pattern='####/##/##' label='تاریخ'></story-template-field>`,
}

/** With `handleStep`, the units are spinbuttons: the arrows step, PageUp and PageDown jump, by a quarter of an hour on the minutes, Home and End reach the limits. */
export const Stepping: StoryObj = {
	parameters: sourceOf(steppingFieldSource),
	render: () => html`<story-stepping-field></story-stepping-field>`,
}

/** `SegmentedDisplayController`: one input, six cells, so the code arrives whole from a keyboard, a paste or the phone's own suggestion. */
export const Code: StoryObj = {
	parameters: sourceOf(codeFieldSource),
	render: () => html`<story-code-field></story-code-field>`,
}
