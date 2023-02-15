import { story, meta } from '../../.storybook/story.js'
import { html } from '@a11d/lit'
import p from './package.json'
import './index.js'

export default meta({
	title: 'Core/Dialog',
	component: 'mo-dialog',
	parameters: {
		docs: {
			description: {
				component: p.description,
			},
		}
	}
})

export const Dialog = story({
	render: () => html`
		<mo-dialog heading='Heading' open>
			Lorem ipsum dolor sit amet, consectetur adipisicing elit. Eius quidem eaque earum obcaecati qui? Nihil quaerat,
			repudiandae error delectus labore quasi inventore fugit corporis maxime eos aspernatur aliquid temporibus vitae.
		</mo-dialog>
	`
})

export const Header = story({
	render: () => html`
		<mo-dialog heading='Heading' open>
			<mo-icon-button slot='header' icon='edit'></mo-icon-button>
			Lorem ipsum dolor sit amet, consectetur adipisicing elit. Eius quidem eaque earum obcaecati qui? Nihil quaerat,
			repudiandae error delectus labore quasi inventore fugit corporis maxime eos aspernatur aliquid temporibus vitae.
		</mo-dialog>
	`
})

export const Footer = story({
	render: () => html`
		<mo-dialog heading='Heading' open primaryButtonText='Save'>
			<mo-checkbox slot='footer' label='Save as draft'></mo-checkbox>
			Lorem ipsum dolor sit amet, consectetur adipisicing elit. Eius quidem eaque earum obcaecati qui? Nihil quaerat,
			repudiandae error delectus labore quasi inventore fugit corporis maxime eos aspernatur aliquid temporibus vitae.
		</mo-dialog>
	`
})

export const PrimaryAction = story({
	render: () => html`
		<mo-dialog heading='Heading' open>
			<mo-loading-button slot='primaryAction' type='raised' leadingIcon='save'>Save</mo-loading-button>
			Lorem ipsum dolor sit amet, consectetur adipisicing elit. Eius quidem eaque earum obcaecati qui? Nihil quaerat,
			repudiandae error delectus labore quasi inventore fugit corporis maxime eos aspernatur aliquid temporibus vitae.
		</mo-dialog>
	`
})

export const SecondaryAction = story({
	render: () => html`
		<mo-dialog heading='Heading' open primaryButtonText='Save'>
			<mo-loading-button slot='secondaryAction' type='outlined' leadingIcon='delete' style='--mo-button-accent-color: darkred'>Delete</mo-loading-button>
			Lorem ipsum dolor sit amet, consectetur adipisicing elit. Eius quidem eaque earum obcaecati qui? Nihil quaerat,
			repudiandae error delectus labore quasi inventore fugit corporis maxime eos aspernatur aliquid temporibus vitae.
		</mo-dialog>
	`
})

export const SizeMedium = story({
	render: () => html`
		<mo-dialog heading='Heading' open primaryButtonText='Save' size='medium'>
			Lorem ipsum dolor sit amet, consectetur adipisicing elit. Eius quidem eaque earum obcaecati qui? Nihil quaerat,
			repudiandae error delectus labore quasi inventore fugit corporis maxime eos aspernatur aliquid temporibus vitae.
		</mo-dialog>
	`
})

export const SizeLarge = story({
	render: () => html`
		<mo-dialog heading='Heading' open primaryButtonText='Save' size='large'>
			Lorem ipsum dolor sit amet, consectetur adipisicing elit. Eius quidem eaque earum obcaecati qui? Nihil quaerat,
			repudiandae error delectus labore quasi inventore fugit corporis maxime eos aspernatur aliquid temporibus vitae.
		</mo-dialog>
	`
})