import { setCustomElementsManifest } from '@storybook/web-components-vite'
import { withThemeByDataAttribute } from '@storybook/addon-themes'
import { CustomDocsPage } from './CustomDocsPage.jsx'
import customElements from '../custom-elements.json'

// Keep your custom elements manifest setup
setCustomElementsManifest(customElements)

export default {
	parameters: {
		// Assign your custom component to the docs page
		docs: {
			page: CustomDocsPage,
		},
		controls: {
			expanded: true,
			matchers: {
				color: /(background|color)$/i,
				date: /Date$/,
			},
		},
	},
	decorators: [
		// Your decorators remain the same
		withThemeByDataAttribute({
			themes: {
				light: 'light',
				dark: 'dark',
			},
			defaultTheme: 'dark',
			attributeName: 'data-storybook-theme',
		}),
	],
	tags: ['autodocs'],
}