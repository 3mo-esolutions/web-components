import { story, meta } from '../../.storybook/story.js'
import { html } from '@a11d/lit'
import p from './package.json'
import './index.js'

export default meta({
	title: 'Loading Dialog',
	component: 'mo-loading-dialog',
	args: { loading: true, loadingHeading: 'Loading' },
	argTypes: {
		loading: { control: { type: 'boolean' } },
		loadingHeading: { control: { type: 'text' } }
	},
	parameters: {
		docs: {
			description: {
				component: p.description,
			},
		}
	}
})

export const LoadingDialog = story({
	render: ({ loading, loadingHeading }) => html`
		<mo-loading-dialog heading='Heading' primaryButtonText='Action' open ?loading=${loading} loadingHeading=${loadingHeading}>
			Lorem ipsum dolor sit amet, consectetur adipisicing elit. Eius quidem eaque earum obcaecati qui? Nihil quaerat,
			repudiandae error delectus labore quasi inventore fugit corporis maxime eos aspernatur aliquid temporibus vitae.
		</mo-loading-dialog>
	`
})

export const CustomLoadingDialog = story({
	render: ({ loading, loadingHeading }) => html`
		<mo-loading-dialog heading='Heading' primaryButtonText='Action' open ?loading=${loading} loadingHeading=${loadingHeading}>
			<mo-flex slot='loading'>
				<mo-heading typography='subtitle2' style='color: #0077c8; text-align: center; font-weight: 600;'>Did you know</mo-heading>
				That you can use any content in the loading slot?
			</mo-flex>
			Lorem ipsum dolor sit amet, consectetur adipisicing elit. Eius quidem eaque earum obcaecati qui? Nihil quaerat,
			repudiandae error delectus labore quasi inventore fugit corporis maxime eos aspernatur aliquid temporibus vitae.
		</mo-loading-dialog>
	`
})