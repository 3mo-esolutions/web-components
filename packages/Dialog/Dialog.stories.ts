import { story, meta } from '../../.storybook/story.js'
import { html } from '@a11d/lit'
import p from './package.json'
import './index.js'

export default meta({
	title: 'Dialog',
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

export const Scrollable = story({
	render: () => html`
		<mo-dialog heading='Heading' open>
			Lorem ipsum dolor sit amet, consectetur adipisicing elit. Eius quidem eaque earum obcaecati qui? Nihil quaerat,
			repudiandae error delectus labore quasi inventore fugit corporis maxime eos aspernatur aliquid temporibus vitae.

			Lorem ipsum dolor sit amet, consectetur adipisicing elit. Eius quidem eaque earum obcaecati qui? Nihil quaerat,
			repudiandae error delectus labore quasi inventore fugit corporis maxime eos aspernatur aliquid temporibus vitae.

			Lorem ipsum dolor sit amet, consectetur adipisicing elit. Eius quidem eaque earum obcaecati qui? Nihil quaerat,
			repudiandae error delectus labore quasi inventore fugit corporis maxime eos aspernatur aliquid temporibus vitae.

			Lorem ipsum dolor sit amet, consectetur adipisicing elit. Eius quidem eaque earum obcaecati qui? Nihil quaerat,
			repudiandae error delectus labore quasi inventore fugit corporis maxime eos aspernatur aliquid temporibus vitae.

			Lorem ipsum dolor sit amet, consectetur adipisicing elit. Eius quidem eaque earum obcaecati qui? Nihil quaerat,
			repudiandae error delectus labore quasi inventore fugit corporis maxime eos aspernatur aliquid temporibus vitae.

			<mo-field-select label='Select'>
				<mo-option value='one'>Option 1</mo-option>
				<mo-option value='two'>Option 2</mo-option>
				<mo-option value='three'>Option 3</mo-option>
				<mo-option value='four'>Option 4</mo-option>
				<mo-option value='five'>Option 5</mo-option>
				<mo-option value='six'>Option 6</mo-option>
				<mo-option value='seven'>Option 7</mo-option>
				<mo-option value='eight'>Option 8</mo-option>
				<mo-option value='nine'>Option 9</mo-option>
				<mo-option value='ten'>Option 10</mo-option>
				<mo-option value='eleven'>Option 11</mo-option>
				<mo-option value='twelve'>Option 12</mo-option>
				<mo-option value='thirteen'>Option 13</mo-option>
				<mo-option value='fourteen'>Option 14</mo-option>
				<mo-option value='fifteen'>Option 15</mo-option>
				<mo-option value='sixteen'>Option 16</mo-option>
				<mo-option value='seventeen'>Option 17</mo-option>
				<mo-option value='eighteen'>Option 18</mo-option>
				<mo-option value='nineteen'>Option 19</mo-option>
				<mo-option value='twenty'>Option 20</mo-option>
				<mo-option value='twenty-one'>Option 21</mo-option>
				<mo-option value='twenty-two'>Option 22</mo-option>
				<mo-option value='twenty-three'>Option 23</mo-option>
				<mo-option value='twenty-four'>Option 24</mo-option>
				<mo-option value='twenty-five'>Option 25</mo-option>
			</mo-field-select>

			Lorem ipsum dolor sit amet, consectetur adipisicing elit. Eius quidem eaque earum obcaecati qui? Nihil quaerat,
			repudiandae error delectus labore quasi inventore fugit corporis maxime eos aspernatur aliquid temporibus vitae.

			Lorem ipsum dolor sit amet, consectetur adipisicing elit. Eius quidem eaque earum obcaecati qui? Nihil quaerat,
			repudiandae error delectus labore quasi inventore fugit corporis maxime eos aspernatur aliquid temporibus vitae.

			Lorem ipsum dolor sit amet, consectetur adipisicing elit. Eius quidem eaque earum obcaecati qui? Nihil quaerat,
			repudiandae error delectus labore quasi inventore fugit corporis maxime eos aspernatur aliquid temporibus vitae.

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