import { INITIAL_VIEWPORTS } from '@storybook/addon-viewport'

export const parameters = {
	options: {
		storySort: (a, b) => {
			return a[1].kind === b[1].kind ? 0 : (a[1].id.localeCompare(b[1].id, undefined, { numeric: true })) * -1
		}
	},
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