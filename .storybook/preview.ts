import { INITIAL_VIEWPORTS } from '@storybook/addon-viewport'

export const parameters = {
	docs: {
		inlineStories: true,
		source: {
			type: 'dynamic',
			language: 'html',
		}
	},
	viewport: {
		viewports: INITIAL_VIEWPORTS,
	},
	controls: {
		expanded: true,
		matchers: {
			color: /(background|color)$/i,
			date: /Date$/,
		},
	},
}