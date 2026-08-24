import type { Meta, StoryObj } from '@storybook/web-components-vite'
import { html, style } from '@a11d/lit'
import p from './package.json'
import './index.js'
import '@3mo/button'
import '@3mo/circular-progress'
import '@3mo/flex'
import '@3mo/icon'
import '@3mo/icon-button'

export default {
	title: 'Data Display / Swap',
	component: 'mo-swap',
	package: p,
} as Meta

/** The swap belonging to the control which has been clicked. */
const swapOf = (event: Event) => (event.currentTarget as HTMLElement).querySelector('mo-swap')!

const toggle = (event: Event, value: string) => {
	const swap = swapOf(event)
	swap.value = swap.value ? '' : value
}

/**
 * An icon-button sizes the icon it renders itself, but a "mo-icon" handed to its slot brings a size of its own.
 * Letting it inherit is what keeps a swapping icon-button the size of every other one.
 */
const iconSizeStyle = html`
	<style>
		mo-icon-button mo-icon {
			font-size: inherit;
		}
	</style>
`

export const Swap: StoryObj = {
	args: {
		value: '',
	},
	argTypes: {
		value: { control: 'inline-radio', options: ['', 'success', 'error'] },
	},
	render: ({ value }) => html`
		<mo-swap value=${value}>
			<mo-icon icon='content_copy'></mo-icon>
			<mo-icon slot='success' icon='check' ${style({ color: 'var(--mo-color-green)' })}></mo-icon>
			<mo-icon slot='error' icon='error_outline' ${style({ color: 'var(--mo-color-red)' })}></mo-icon>
		</mo-swap>
	`
}

/**
 * A value which is only meant to be seen for a moment is what "flash()" is for, as it returns to the value it
 * interrupted. It confirms an action in the very control which triggered it instead of pulling the eye away to
 * a snackbar. Since all slots share one cell, the button holds the width of its longest label from the start
 * and does not jump while the transition runs.
 */
export const TransientFeedback: StoryObj = {
	render: () => html`
		<mo-flex direction='horizontal' gap='12px'>
			<mo-button type='filled' @click=${(e: Event) => swapOf(e).flash('saved')}>
				<mo-swap>
					Save changes
					<mo-flex slot='saved' direction='horizontal' gap='6px' alignItems='center'>
						<mo-icon icon='check'></mo-icon>
						Saved
					</mo-flex>
				</mo-swap>
			</mo-button>

			<mo-button type='outlined' @click=${(e: Event) => swapOf(e).flash('sent')}>
				<mo-swap>
					Send invitation
					<span slot='sent'>Invitation sent</span>
				</mo-swap>
			</mo-button>
		</mo-flex>
	`
}

/**
 * Two slots which alternate are set declaratively instead of being flashed. A swap only shows the value it is
 * given, which leaves the source of truth with whatever already knows whether the player runs or the theme is dark.
 */
export const Toggle: StoryObj = {
	render: () => html`
		${iconSizeStyle}
		<mo-flex direction='horizontal' gap='12px' alignItems='center'>
			<mo-icon-button @click=${(e: Event) => toggle(e, 'playing')}>
				<mo-swap slot='icon'>
					<mo-icon icon='play_arrow'></mo-icon>
					<mo-icon slot='playing' icon='pause'></mo-icon>
				</mo-swap>
			</mo-icon-button>

			<mo-icon-button @click=${(e: Event) => toggle(e, 'dark')}>
				<mo-swap slot='icon'>
					<mo-icon icon='light_mode'></mo-icon>
					<mo-icon slot='dark' icon='dark_mode'></mo-icon>
				</mo-swap>
			</mo-icon-button>

			<mo-icon-button @click=${(e: Event) => toggle(e, 'visible')}>
				<mo-swap slot='icon'>
					<mo-icon icon='visibility_off'></mo-icon>
					<mo-icon slot='visible' icon='visibility'></mo-icon>
				</mo-swap>
			</mo-icon-button>
		</mo-flex>
	`
}

/**
 * Values are named instead of counted, so neither their number nor their content is fixed. This upload row holds
 * four slots made of icons, labels and a progress indicator, and takes the width of the longest one once, which
 * keeps the rows of a list aligned no matter which value each of them is at.
 */
export const MultipleValues: StoryObj = {
	render: () => {
		const handleClick = (event: Event) => {
			const value = (event.target as HTMLElement).closest('mo-button')?.dataset.value
			if (value !== undefined) {
				(event.currentTarget as HTMLElement).querySelector('mo-swap')!.value = value
			}
		}
		return html`
			<mo-flex gap='16px' alignItems='start' @click=${handleClick}>
				<!-- The default centers each slot under the widest one, which a row of a list would rather have aligned. -->
				<mo-swap ${style({ placeItems: 'center start' })}>
					<mo-flex direction='horizontal' gap='8px' alignItems='center'>
						<mo-icon icon='cloud_upload'></mo-icon>
						Ready to upload
					</mo-flex>

					<mo-flex slot='uploading' direction='horizontal' gap='8px' alignItems='center'>
						<mo-circular-progress ${style({ width: '18px', height: '18px' })}></mo-circular-progress>
						Uploading…
					</mo-flex>

					<mo-flex slot='uploaded' direction='horizontal' gap='8px' alignItems='center' ${style({ color: 'var(--mo-color-green)' })}>
						<mo-icon icon='check_circle'></mo-icon>
						Uploaded
					</mo-flex>

					<mo-flex slot='failed' direction='horizontal' gap='8px' alignItems='center' ${style({ color: 'var(--mo-color-red)' })}>
						<mo-icon icon='error_outline'></mo-icon>
						Upload failed
					</mo-flex>
				</mo-swap>

				<mo-flex direction='horizontal' gap='8px'>
					<mo-button type='outlined' data-value=''>Ready</mo-button>
					<mo-button type='outlined' data-value='uploading'>Uploading</mo-button>
					<mo-button type='outlined' data-value='uploaded'>Uploaded</mo-button>
					<mo-button type='outlined' data-value='failed'>Failed</mo-button>
				</mo-flex>
			</mo-flex>
		`
	}
}

/**
 * By default a slot fades out while scaling down. Both ends of the transition are custom properties, so a swap
 * can rotate, flip or merely fade instead, without having to reimplement when the transition runs.
 */
export const CustomTransition: StoryObj = {
	render: () => html`
		${iconSizeStyle}
		<style>
			#rotating {
				--mo-swap-inactive-transform: rotate(-90deg) scale(0.7);
				--mo-swap-transition-duration: 350ms;
			}

			#flipping {
				--mo-swap-inactive-transform: rotateY(90deg);
				--mo-swap-transition-duration: 200ms;
			}

			#fading {
				--mo-swap-inactive-transform: none;
			}
		</style>

		<mo-flex direction='horizontal' gap='12px' alignItems='center'>
			<mo-icon-button @click=${(e: Event) => toggle(e, 'open')}>
				<mo-swap id='rotating' slot='icon'>
					<mo-icon icon='menu'></mo-icon>
					<mo-icon slot='open' icon='close'></mo-icon>
				</mo-swap>
			</mo-icon-button>

			<mo-icon-button @click=${(e: Event) => toggle(e, 'unmuted')}>
				<mo-swap id='flipping' slot='icon'>
					<mo-icon icon='volume_off'></mo-icon>
					<mo-icon slot='unmuted' icon='volume_up'></mo-icon>
				</mo-swap>
			</mo-icon-button>

			<mo-icon-button @click=${(e: Event) => toggle(e, 'bookmarked')}>
				<mo-swap id='fading' slot='icon'>
					<mo-icon icon='bookmark_border'></mo-icon>
					<mo-icon slot='bookmarked' icon='bookmark'></mo-icon>
				</mo-swap>
			</mo-icon-button>
		</mo-flex>
	`
}