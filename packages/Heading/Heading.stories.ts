import type { Meta, StoryObj } from '@storybook/web-components-vite'
import { html } from '@a11d/lit'
import { HeadingTypography } from './index.js'

type Args = {
	readonly typography: HeadingTypography
}

export default {
	title: 'Foundations / Heading',
	component: 'mo-heading',
	args: {
		typography: HeadingTypography.Heading3,
	},
	argTypes: {
		typography: { control: 'select', options: Object.values(HeadingTypography) },
	},
} satisfies Meta<Args>

type Story = StoryObj<Args>

export const Default: Story = {
	render: ({ typography }) => html`<mo-heading typography=${typography}>Quarterly report</mo-heading>`,
}

/** Six heading levels from `heading1` down to `heading6`, and two subtitles. */
export const Typographies: Story = {
	render: () => html`
		<mo-heading typography='heading1'>Heading 1</mo-heading>
		<mo-heading typography='heading2'>Heading 2</mo-heading>
		<mo-heading typography='heading3'>Heading 3</mo-heading>
		<mo-heading typography='heading4'>Heading 4</mo-heading>
		<mo-heading typography='heading5'>Heading 5</mo-heading>
		<mo-heading typography='heading6'>Heading 6</mo-heading>
		<mo-heading typography='subtitle1'>Subtitle 1</mo-heading>
		<mo-heading typography='subtitle2'>Subtitle 2</mo-heading>
	`,
}

/** A heading's size is relative to the surrounding text, up to a cap per level: 36px for `heading1`. */
export const RelativeSize: Story = {
	render: () => html`
		<div style='font-size: 10px'>
			<mo-heading typography='heading1'>Heading 1 in 10px text</mo-heading>
		</div>
		<div style='font-size: 16px'>
			<mo-heading typography='heading1'>Heading 1 in 16px text</mo-heading>
		</div>
		<div style='font-size: 32px'>
			<mo-heading typography='heading1'>Heading 1 in 32px text</mo-heading>
		</div>
	`,
}
