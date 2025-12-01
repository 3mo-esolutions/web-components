import { setCustomElementsManifest } from '@storybook/web-components-vite'
import { withThemeByDataAttribute } from '@storybook/addon-themes'
import { CustomDocsPage } from './CustomDocsPage.jsx'
import customElements from '../custom-elements.json'
import { themes } from 'storybook/theming'
import { addons } from 'storybook/internal/preview-api'
import { DARK_MODE_EVENT_NAME } from '@vueless/storybook-dark-mode'

// Keep your custom elements manifest setup
setCustomElementsManifest(customElements)

const channel = addons.getChannel()

export default {
	parameters: {
		// Assign your custom component to the docs page
		docs: {
			page: CustomDocsPage,
			theme: themes.dark,
			codePanel: true
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
		(story: any) => {
			channel.on(DARK_MODE_EVENT_NAME, (isDark: boolean) => {
				if (globalThis.Theme) {
					globalThis.Theme.background.value = (isDark ? 'dark' : 'light') as any
				}
			})
			return story()
		}
	],
	tags: ['autodocs'],
}