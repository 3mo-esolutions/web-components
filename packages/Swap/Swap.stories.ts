import type { Meta, StoryObj } from '@storybook/web-components-vite'
import { html } from '@a11d/lit'
import { useState } from 'storybook/preview-api'
import type { Swap } from './Swap.js'
import './index.js'
import '@3mo/button'
import '@3mo/circular-progress'
import '@3mo/flex'
import '@3mo/icon'
import '@3mo/icon-button'

type Args = {
	readonly value: string
}

export default {
	title: 'Data / Swap',
	component: 'mo-swap',
	args: {
		value: '',
	},
	argTypes: {
		value: { control: 'inline-radio', options: ['', 'success', 'error'] },
	},
	decorators: [story => html`<div style='display: flex; flex-wrap: wrap; align-items: center; gap: 12px'>${story()}</div>`],
} satisfies Meta<Args>

type Story = StoryObj<Args>

export const Default: Story = {
	render: ({ value }) => html`
		<mo-swap value=${value}>
			<mo-icon icon='content_copy'></mo-icon>
			<mo-icon slot='success' icon='check' style='color: var(--mo-color-green)'></mo-icon>
			<mo-icon slot='error' icon='error_outline' style='color: var(--mo-color-red)'></mo-icon>
		</mo-swap>
	`,
}

/** `flash()` shows a value for `flashDuration` milliseconds and returns to the one it interrupted, confirming an action in the control that triggered it. The button keeps the width of its longest label throughout. */
export const TransientFeedback: Story = {
	render: () => html`
		<mo-button type='filled' @click=${(event: Event) => (event.currentTarget as HTMLElement).querySelector<Swap>('mo-swap')!.flash('saved')}>
			<mo-swap>
				Save changes
				<mo-flex slot='saved' direction='horizontal' gap='6px' alignItems='center'>
					<mo-icon icon='check'></mo-icon>
					Saved
				</mo-flex>
			</mo-swap>
		</mo-button>
		<mo-button type='outlined' @click=${(event: Event) => (event.currentTarget as HTMLElement).querySelector<Swap>('mo-swap')!.flash('sent')}>
			<mo-swap>
				Send invitation
				<span slot='sent'>Invitation sent</span>
			</mo-swap>
		</mo-button>
	`,
}

/** Two alternating slots follow a `value` bound to the state that already knows whether the player runs or the theme is dark. A slotted icon inherits the icon button's size. */
export const Toggle: Story = {
	render: () => {
		const [playing, setPlaying] = useState(false)
		const [dark, setDark] = useState(false)
		const [visible, setVisible] = useState(false)
		return html`
			<style>
				mo-icon-button mo-icon {
					font-size: inherit;
				}
			</style>
			<mo-icon-button @click=${() => setPlaying(!playing)}>
				<mo-swap slot='icon' value=${playing ? 'playing' : ''}>
					<mo-icon icon='play_arrow'></mo-icon>
					<mo-icon slot='playing' icon='pause'></mo-icon>
				</mo-swap>
			</mo-icon-button>
			<mo-icon-button @click=${() => setDark(!dark)}>
				<mo-swap slot='icon' value=${dark ? 'dark' : ''}>
					<mo-icon icon='light_mode'></mo-icon>
					<mo-icon slot='dark' icon='dark_mode'></mo-icon>
				</mo-swap>
			</mo-icon-button>
			<mo-icon-button @click=${() => setVisible(!visible)}>
				<mo-swap slot='icon' value=${visible ? 'visible' : ''}>
					<mo-icon icon='visibility_off'></mo-icon>
					<mo-icon slot='visible' icon='visibility'></mo-icon>
				</mo-swap>
			</mo-icon-button>
		`
	},
}

/** Values are named, not counted, so a swap holds as many as it needs, here the four states of an upload. `place-items: center start` aligns them at the start instead of centering each under the widest. */
export const MultipleValues: Story = {
	render: () => {
		const [value, setValue] = useState('')
		return html`
			<mo-flex gap='16px' alignItems='start'>
				<mo-swap value=${value} style='place-items: center start'>
					<mo-flex direction='horizontal' gap='8px' alignItems='center'>
						<mo-icon icon='cloud_upload'></mo-icon>
						Ready to upload
					</mo-flex>
					<mo-flex slot='uploading' direction='horizontal' gap='8px' alignItems='center'>
						<mo-circular-progress style='width: 18px; height: 18px'></mo-circular-progress>
						Uploading…
					</mo-flex>
					<mo-flex slot='uploaded' direction='horizontal' gap='8px' alignItems='center' style='color: var(--mo-color-green)'>
						<mo-icon icon='check_circle'></mo-icon>
						Uploaded
					</mo-flex>
					<mo-flex slot='failed' direction='horizontal' gap='8px' alignItems='center' style='color: var(--mo-color-red)'>
						<mo-icon icon='error_outline'></mo-icon>
						Upload failed
					</mo-flex>
				</mo-swap>
				<mo-flex direction='horizontal' gap='8px'>
					<mo-button type='outlined' @click=${() => setValue('')}>Ready</mo-button>
					<mo-button type='outlined' @click=${() => setValue('uploading')}>Uploading</mo-button>
					<mo-button type='outlined' @click=${() => setValue('uploaded')}>Uploaded</mo-button>
					<mo-button type='outlined' @click=${() => setValue('failed')}>Failed</mo-button>
				</mo-flex>
			</mo-flex>
		`
	},
}

/** Both ends of the transition are custom properties, so a swap can rotate, flip or only fade instead of scaling down. */
export const CustomProperties: Story = {
	render: () => {
		const [open, setOpen] = useState(false)
		const [unmuted, setUnmuted] = useState(false)
		const [bookmarked, setBookmarked] = useState(false)
		return html`
			<style>
				mo-icon-button mo-icon {
					font-size: inherit;
				}
			</style>
			<mo-icon-button @click=${() => setOpen(!open)}>
				<mo-swap slot='icon' value=${open ? 'open' : ''} style='--mo-swap-inactive-transform: rotate(-90deg) scale(0.7); --mo-swap-transition-duration: 350ms'>
					<mo-icon icon='menu'></mo-icon>
					<mo-icon slot='open' icon='close'></mo-icon>
				</mo-swap>
			</mo-icon-button>
			<mo-icon-button @click=${() => setUnmuted(!unmuted)}>
				<mo-swap slot='icon' value=${unmuted ? 'unmuted' : ''} style='--mo-swap-inactive-transform: rotateY(90deg); --mo-swap-transition-duration: 200ms'>
					<mo-icon icon='volume_off'></mo-icon>
					<mo-icon slot='unmuted' icon='volume_up'></mo-icon>
				</mo-swap>
			</mo-icon-button>
			<mo-icon-button @click=${() => setBookmarked(!bookmarked)}>
				<mo-swap slot='icon' value=${bookmarked ? 'bookmarked' : ''} style='--mo-swap-inactive-transform: none'>
					<mo-icon icon='bookmark_border'></mo-icon>
					<mo-icon slot='bookmarked' icon='bookmark'></mo-icon>
				</mo-swap>
			</mo-icon-button>
		`
	},
}
