import { setCustomElementsManifest } from '@storybook/web-components-vite'
import { CustomDocsPage } from './CustomDocsPage.jsx'
import customElements from '../custom-elements.json'
import { themes } from 'storybook/theming'
import { addons } from 'storybook/internal/preview-api'
import { action } from 'storybook/actions'
import { DARK_MODE_EVENT_NAME } from '@vueless/storybook-dark-mode'
import { FieldComponent } from '@3mo/field'

// Keep your custom elements manifest setup
setCustomElementsManifest(customElements)

const channel = addons.getChannel()

// Every field's value events land in the Actions panel, so that no story has to wire them up itself.
// They are listened for in the CAPTURE phase because a field dispatches them without `bubbles` — the
// capture phase still descends through the ancestors, while the bubble phase would never reach here.
// Only `CustomEvent`s count: a control's own native "input"/"change" also passes by on its way to
// being stopped inside the field, and carries no value.
for (const type of ['input', 'change'] as const) {
	const log = action(type)
	document.addEventListener(type, event => {
		if (event instanceof CustomEvent && event.target instanceof FieldComponent) {
			log(event.detail)
		}
	}, { capture: true })
}

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