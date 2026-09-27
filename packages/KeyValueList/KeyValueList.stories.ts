import type { Meta, StoryObj } from '@storybook/web-components-vite'
import { html } from '@a11d/lit'
import './index.js'
import '@3mo/anchor'
import '@3mo/card'
import '@3mo/chip'
import '@3mo/copy-icon-button'
import '@3mo/flex'
import '@3mo/icon'
import '@3mo/linear-progress'

type Args = {
	readonly minColumnWidth: number
	readonly stackingWidth: number
	readonly alwaysStacked: boolean
}

export default {
	title: 'Data / Key Value List',
	component: 'mo-key-value-list',
	args: {
		minColumnWidth: 380,
		stackingWidth: 285,
		alwaysStacked: false,
	},
} satisfies Meta<Args>

type Story = StoryObj<Args>

export const Default: Story = {
	decorators: [story => html`<div style='resize: horizontal; overflow: hidden; min-width: 200px; max-width: 100%; padding: 16px; border: 1px dashed var(--mo-color-gray-transparent)'>${story()}</div>`],
	render: ({ minColumnWidth, stackingWidth, alwaysStacked }) => html`
		<mo-key-value-list minColumnWidth=${minColumnWidth} stackingWidth=${stackingWidth} ?alwaysStacked=${alwaysStacked}>
			<mo-key-value key='Camera'>Fujifilm X-T5</mo-key-value>
			<mo-key-value key='Lens'>XF 35mm F1.4 R</mo-key-value>
			<mo-key-value key='Focal length'>35 mm</mo-key-value>
			<mo-key-value key='Aperture'>f/2.0</mo-key-value>
			<mo-key-value key='Shutter speed'>1/250 s</mo-key-value>
			<mo-key-value key='ISO'>400</mo-key-value>
			<mo-key-value key='Taken'>14.06.2026, 18:42</mo-key-value>
			<mo-key-value key='Dimensions'>7728 × 5152</mo-key-value>
		</mo-key-value-list>
	`,
}

/** The list fills its width with as many key–value columns as fit, here three, two and one, and at or below `stackingWidth` places each key above its value. */
export const Responsiveness: Story = {
	decorators: [story => html`<div style='display: flex; flex-direction: column; gap: 24px'>${story()}</div>`],
	render: () => html`
		<mo-key-value-list style='width: 1200px'>
			<mo-key-value key='Region'>eu-central-1</mo-key-value>
			<mo-key-value key='Instance type'>c7g.2xlarge</mo-key-value>
			<mo-key-value key='Image'>debian-13-arm64</mo-key-value>
			<mo-key-value key='Uptime'>19 days, 4 hours</mo-key-value>
			<mo-key-value key='Public IPv4'>52.28.114.9</mo-key-value>
			<mo-key-value key='Kernel'>6.12.4-arm64</mo-key-value>
		</mo-key-value-list>
		<mo-key-value-list style='width: 800px'>
			<mo-key-value key='Region'>eu-central-1</mo-key-value>
			<mo-key-value key='Instance type'>c7g.2xlarge</mo-key-value>
			<mo-key-value key='Image'>debian-13-arm64</mo-key-value>
			<mo-key-value key='Uptime'>19 days, 4 hours</mo-key-value>
			<mo-key-value key='Public IPv4'>52.28.114.9</mo-key-value>
			<mo-key-value key='Kernel'>6.12.4-arm64</mo-key-value>
		</mo-key-value-list>
		<mo-key-value-list style='width: 400px'>
			<mo-key-value key='Region'>eu-central-1</mo-key-value>
			<mo-key-value key='Instance type'>c7g.2xlarge</mo-key-value>
			<mo-key-value key='Image'>debian-13-arm64</mo-key-value>
			<mo-key-value key='Uptime'>19 days, 4 hours</mo-key-value>
			<mo-key-value key='Public IPv4'>52.28.114.9</mo-key-value>
			<mo-key-value key='Kernel'>6.12.4-arm64</mo-key-value>
		</mo-key-value-list>
		<mo-key-value-list style='width: 260px'>
			<mo-key-value key='Region'>eu-central-1</mo-key-value>
			<mo-key-value key='Instance type'>c7g.2xlarge</mo-key-value>
			<mo-key-value key='Image'>debian-13-arm64</mo-key-value>
			<mo-key-value key='Uptime'>19 days, 4 hours</mo-key-value>
			<mo-key-value key='Public IPv4'>52.28.114.9</mo-key-value>
			<mo-key-value key='Kernel'>6.12.4-arm64</mo-key-value>
		</mo-key-value-list>
	`,
}

/** `alwaysStacked` places every key above its value however wide the list is. */
export const AlwaysStacked: Story = {
	render: () => html`
		<mo-key-value-list alwaysStacked style='width: 400px'>
			<mo-key-value key='Region'>eu-central-1</mo-key-value>
			<mo-key-value key='Instance type'>c7g.2xlarge</mo-key-value>
			<mo-key-value key='Image'>debian-13-arm64</mo-key-value>
		</mo-key-value-list>
	`,
}

/** `value` takes a value that needs no markup, and is where `bind()` writes by default. */
export const Value: Story = {
	render: () => html`
		<mo-key-value-list style='width: 400px'>
			<mo-key-value key='Invoice' value='2026-0142'></mo-key-value>
			<mo-key-value key='Due' value='30.09.2026'></mo-key-value>
		</mo-key-value-list>
	`,
}

/** A pair without a value shows a placeholder, unless `hiddenWhenEmpty` takes it out of the list. */
export const EmptyValues: Story = {
	render: () => html`
		<mo-key-value-list style='width: 400px'>
			<mo-key-value key='Title'>Sonata for cello and piano</mo-key-value>
			<mo-key-value key='Composer'></mo-key-value>
			<mo-key-value key='Year'>1915</mo-key-value>
			<mo-key-value hiddenWhenEmpty key='Dedication'></mo-key-value>
			<mo-key-value hiddenWhenEmpty key='Opus'></mo-key-value>
			<mo-key-value key='Movements'>3</mo-key-value>
		</mo-key-value-list>
	`,
}

/** Values take any content, and so do keys through the `key` slot. */
export const RichValues: Story = {
	render: () => html`
		<mo-key-value-list style='width: 460px'>
			<mo-key-value key='Project'>
				<mo-flex direction='horizontal' gap='8px' alignItems='center'>
					<mo-icon icon='map' style='color: var(--mo-color-accent)'></mo-icon>
					Cartographer
				</mo-flex>
			</mo-key-value>
			<mo-key-value key='Maintainer'>
				<mo-flex direction='horizontal' gap='8px' alignItems='center'>
					<span style='display: grid; place-items: center; width: 24px; height: 24px; border-radius: 50%; background: var(--mo-color-accent); color: var(--mo-color-on-accent); font-size: 11px'>AL</span>
					Ada Lovelace
				</mo-flex>
			</mo-key-value>
			<mo-key-value key='License'>
				<mo-chip readonly>MIT</mo-chip>
			</mo-key-value>
			<mo-key-value key='Coverage'>
				<mo-flex direction='horizontal' gap='8px' alignItems='center'>
					<mo-linear-progress progress='0.87' style='width: 120px; --mo-linear-progress-accent-color: var(--mo-color-green)'></mo-linear-progress>
					87 %
				</mo-flex>
			</mo-key-value>
			<mo-key-value key='Homepage'>
				<mo-flex direction='horizontal' gap='4px' alignItems='center'>
					<mo-anchor href='https://www.3mo.de' target='_blank'>www.3mo.de</mo-anchor>
					<mo-copy-icon-button dense value='https://www.3mo.de'></mo-copy-icon-button>
				</mo-flex>
			</mo-key-value>
			<mo-key-value>
				<mo-flex slot='key' direction='horizontal' gap='4px' alignItems='center'>
					<mo-icon icon='warning' style='color: var(--mo-color-yellow); font-size: 16px'></mo-icon>
					Deprecated
				</mo-flex>
				Superseded by Cartographer 2
			</mo-key-value>
		</mo-key-value-list>
	`,
}

/** The gaps, the dividers and the tracks of a column are custom properties, here for a dense list in a card. */
export const CustomProperties: Story = {
	render: () => html`
		<mo-card heading='Disk usage' style='width: 380px'>
			<mo-key-value-list style='--mo-key-value-list-row-gap: 0.35rem; --mo-key-value-list-divider-color: transparent; --mo-key-value-list-column-template: 1fr auto'>
				<mo-key-value key='Documents'>12,4 GB</mo-key-value>
				<mo-key-value key='Photos'>184,9 GB</mo-key-value>
				<mo-key-value key='System'>28,1 GB</mo-key-value>
				<mo-key-value key='Free'>274,6 GB</mo-key-value>
			</mo-key-value-list>
		</mo-card>
	`,
}

/** The `key` and `value` parts of each pair restyle its typography. */
export const Parts: Story = {
	render: () => html`
		<style>
			.monospaced mo-key-value::part(key) {
				color: var(--mo-color-foreground);
				font-weight: 400;
			}

			.monospaced mo-key-value::part(value) {
				font-family: monospace;
				text-align: end;
			}
		</style>
		<mo-key-value-list class='monospaced' style='width: 380px'>
			<mo-key-value key='Documents'>12,4 GB</mo-key-value>
			<mo-key-value key='Photos'>184,9 GB</mo-key-value>
			<mo-key-value key='System'>28,1 GB</mo-key-value>
			<mo-key-value key='Free'>274,6 GB</mo-key-value>
		</mo-key-value-list>
	`,
}