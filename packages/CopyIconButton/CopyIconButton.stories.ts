import type { Meta, StoryObj } from '@storybook/web-components-vite'
import { html, style } from '@a11d/lit'
import p from './package.json'
import './index.js'
import '@3mo/flex'
import '@3mo/icon'

export default {
	title: 'Buttons & Actions / Copy Icon Button',
	component: 'mo-copy-icon-button',
	package: p,
} as Meta

export const CopyIconButton: StoryObj = {
	args: {
		value: 'https://www.3mo.de',
		label: 'Copy link',
		disabled: false,
		dense: false,
		feedbackDuration: 1500,
	},
	render: ({ value, label, disabled, dense, feedbackDuration }) => html`
		<mo-copy-icon-button
			value=${value}
			label=${label}
			?disabled=${disabled}
			?dense=${dense}
			.feedbackDuration=${feedbackDuration}
		></mo-copy-icon-button>
	`
}

/**
 * Values which are meant to be carried elsewhere rather than read are what the button is for. Sitting right next
 * to the value it copies, it confirms in place and gives back the space it borrowed, which a notification for
 * every copy in a list of credentials would not. Naming each button through "label" is what tells the three of
 * them apart, both on hover and to a screen reader.
 */
export const NextToAValue: StoryObj = {
	render: () => html`
		<style>
			#credentials {
				font-family: var(--mo-font-family-mono);
				background: var(--mo-color-transparent-gray-3);
				border-radius: var(--mo-border-radius);
				padding: 8px 8px 8px 16px;
			}

			#credentials mo-flex[direction=horizontal] {
				min-height: 32px;
			}

			#credentials span {
				font-family: initial;
				color: var(--mo-color-gray);
				min-width: 90px;
			}
		</style>

		<mo-flex id='credentials' gap='4px' ${style({ maxWidth: '460px' })}>
			<mo-flex direction='horizontal' gap='12px' alignItems='center'>
				<span>Endpoint</span>
				https://api.3mo.de/v2
				<mo-copy-icon-button dense label='Copy endpoint' value='https://api.3mo.de/v2' ${style({ marginInlineStart: 'auto' })}></mo-copy-icon-button>
			</mo-flex>

			<mo-flex direction='horizontal' gap='12px' alignItems='center'>
				<span>API key</span>
				sk_live_9f2c4a1ab7e
				<mo-copy-icon-button dense label='Copy API key' value='sk_live_9f2c4a1ab7e' ${style({ marginInlineStart: 'auto' })}></mo-copy-icon-button>
			</mo-flex>
		</mo-flex>
	`
}

/**
 * Each state takes its content from a slot, so a button which copies a share link can say so, and one which
 * copies a colour can show it. The colours of the outcome are custom properties of their own.
 */
export const CustomContent: StoryObj = {
	render: () => html`
		<style>
			#branded {
				--mo-copy-icon-button-success-color: var(--mo-color-accent);
			}
		</style>

		<mo-flex direction='horizontal' gap='16px' alignItems='center'>
			<mo-copy-icon-button value='https://www.3mo.de/share/8f21' icon='link' successIcon='done_all'></mo-copy-icon-button>

			<mo-copy-icon-button id='branded' value='#5daa60'>
				<mo-icon slot='icon' icon='palette' ${style({ color: '#5daa60' })}></mo-icon>
			</mo-copy-icon-button>

			<mo-copy-icon-button value='🎉'>
				<span slot='icon'>🎨</span>
				<span slot='success-icon'>🎉</span>
			</mo-copy-icon-button>
		</mo-flex>
	`
}

/**
 * A clipboard which refuses the value, as it does outside of a secure context, and a value which is not there
 * to begin with both end in the error state, along with a "copyError" event carrying the reason.
 */
export const WhenCopyingFails: StoryObj = {
	render: () => html`
		<mo-flex direction='horizontal' gap='12px' alignItems='center'>
			<mo-copy-icon-button value=''
				@copyError=${(e: CustomEvent<Error>) => (e.target as HTMLElement).nextElementSibling!.textContent = e.detail.message}
			></mo-copy-icon-button>
			<span ${style({ color: 'var(--mo-color-gray)' })}></span>
		</mo-flex>
	`
}