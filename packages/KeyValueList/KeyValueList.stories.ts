import type { Meta, StoryObj } from '@storybook/web-components-vite'
import { html, style } from '@a11d/lit'
import p from './package.json'
import './index.js'
import '@3mo/anchor'
import '@3mo/card'
import '@3mo/chip'
import '@3mo/copy-icon-button'
import '@3mo/flex'
import '@3mo/icon'
import '@3mo/linear-progress'

export default {
	title: 'Data Display / Key Value List',
	component: 'mo-key-value-list',
	package: p,
} as Meta

const resizable = (content: unknown) => html`
	<div ${style({ resize: 'horizontal', overflow: 'hidden', minWidth: '200px', maxWidth: '100%', padding: '16px', border: '1px dashed var(--mo-color-gray-transparent)' })}>
		${content}
	</div>
`

export const KeyValueList: StoryObj = {
	args: {
		minColumnWidth: 380,
		stackingWidth: 285,
		alwaysStacked: false,
	},
	render: ({ minColumnWidth, stackingWidth, alwaysStacked }) => resizable(html`
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
	`)
}

const widths = [
	{ label: 'Three columns', width: '1200px' },
	{ label: 'Two columns', width: '800px' },
	{ label: 'One column', width: '400px' },
	{ label: 'Stacked', width: '260px' },
]

/**
 * The list fills the width it is given with as many key–value columns as fit into it.
 * When narrower than "stackingWidth", pairs place their key above their value.
 */
export const Responsiveness: StoryObj = {
	render: () => html`
		<mo-flex gap='24px'>
			${widths.map(({ label, width }) => html`
				<mo-flex gap='6px'>
					<span ${style({ color: 'var(--mo-color-gray)', fontSize: 'small' })}>${label} — ${width}</span>
					<mo-key-value-list ${style({ width })}>
						<mo-key-value key='Region'>eu-central-1</mo-key-value>
						<mo-key-value key='Instance type'>c7g.2xlarge</mo-key-value>
						<mo-key-value key='Image'>debian-13-arm64</mo-key-value>
						<mo-key-value key='Uptime'>19 days, 4 hours</mo-key-value>
						<mo-key-value key='Public IPv4'>52.28.114.9</mo-key-value>
						<mo-key-value key='Kernel'>6.12.4-arm64</mo-key-value>
					</mo-key-value-list>
				</mo-flex>
			`)}
		</mo-flex>
	`
}

/**
 * A pair without a value renders a placeholder. "hiddenWhenEmpty" hides empty pairs instead.
 */
export const EmptyValues: StoryObj = {
	render: () => html`
		<mo-key-value-list ${style({ width: '400px' })}>
			<mo-key-value key='Title'>Sonata for cello and piano</mo-key-value>
			<mo-key-value key='Composer'>${undefined}</mo-key-value>
			<mo-key-value key='Year'>1915</mo-key-value>
			<mo-key-value hiddenWhenEmpty key='Dedication'>${undefined}</mo-key-value>
			<mo-key-value hiddenWhenEmpty key='Opus'>${undefined}</mo-key-value>
			<mo-key-value key='Movements'>3</mo-key-value>
		</mo-key-value-list>
	`
}

/**
 * Custom elements can be slotted into values and keys.
 */
export const RichValues: StoryObj = {
	render: () => html`
		<style>
			#rich img {
				display: block;
				height: 24px;
			}

			#rich .avatar {
				display: grid;
				place-items: center;
				inline-size: 24px;
				block-size: 24px;
				border-radius: 50%;
				background: var(--mo-color-accent);
				color: var(--mo-color-on-accent);
				font-size: 11px;
			}
		</style>

		<mo-key-value-list id='rich' ${style({ width: '460px' })}>
			<mo-key-value key='Project'>
				<mo-flex direction='horizontal' gap='8px' alignItems='center'>
					<img alt='Logo' src='data:image/svg+xml;utf8,${encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><circle cx="12" cy="12" r="11" fill="#e89823"/><path d="M7 15l5-9 5 9z" fill="#111"/></svg>')}'>
					Cartographer
				</mo-flex>
			</mo-key-value>

			<mo-key-value key='Maintainer'>
				<mo-flex direction='horizontal' gap='8px' alignItems='center'>
					<span class='avatar'>AL</span>
					Ada Lovelace
				</mo-flex>
			</mo-key-value>

			<mo-key-value key='License'>
				<mo-chip>MIT</mo-chip>
			</mo-key-value>

			<mo-key-value key='Coverage'>
				<mo-flex direction='horizontal' gap='8px' alignItems='center'>
					<mo-linear-progress progress='0.87' ${style({ width: '120px', '--mo-linear-progress-accent-color': 'var(--mo-color-green)' })}></mo-linear-progress>
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
					<mo-icon icon='warning' ${style({ color: 'var(--mo-color-yellow)', fontSize: '16px' })}></mo-icon>
					Deprecated
				</mo-flex>
				Superseded by Cartographer 2
			</mo-key-value>
		</mo-key-value-list>
	`
}

/**
 * Custom CSS properties and parts allow styling gaps, dividers, and typography.
 */
export const Styling: StoryObj = {
	render: () => html`
		<style>
			#dense {
				--mo-key-value-list-row-gap: 0.35rem;
				--mo-key-value-list-divider-color: transparent;
			}

			#dense mo-key-value::part(key) {
				color: var(--mo-color-foreground);
				font-weight: 400;
			}

			#dense mo-key-value::part(value) {
				font-family: monospace;
				text-align: end;
			}
		</style>

		<mo-card heading='Disk usage' ${style({ width: '380px' })}>
			<mo-key-value-list id='dense'>
				<mo-key-value key='Documents'>12,4 GB</mo-key-value>
				<mo-key-value key='Photos'>184,9 GB</mo-key-value>
				<mo-key-value key='System'>28,1 GB</mo-key-value>
				<mo-key-value key='Free'>274,6 GB</mo-key-value>
			</mo-key-value-list>
		</mo-card>
	`
}