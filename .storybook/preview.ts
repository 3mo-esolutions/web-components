import { setCustomElementsManifest, type Preview } from '@storybook/web-components-vite'
import { action } from 'storybook/actions'
import { addons } from 'storybook/preview-api'
import { UPDATE_GLOBALS } from 'storybook/internal/core-events'
import '@3mo/del'
import '@3mo/del/translations/de'
import { DocsContainer } from './DocsContainer.js'
import { DocsPage } from './DocsPage.js'
import { applyGlobals, decorators, globalTypes, initialGlobals } from './globals.js'
import { renderWhenVisible } from './lazy.js'
import './litLanguage.js'
import { transformSource } from './source.js'

type Manifest = { readonly tags: ReadonlyArray<{ readonly name: string, readonly events?: ReadonlyArray<{ readonly name: string }> }> }

// Globbed rather than imported, as `npm run analyze` generates the file, which the type-check runs without.
const [manifest] = Object.values(import.meta.glob<Manifest>('../custom-elements.json', { eager: true, import: 'default' }))

setCustomElementsManifest(manifest)

// Every event the manifest documents lands in the Actions panel, whichever element dispatches it. Listening in the
// capture phase also catches events dispatched without `bubbles`, and only `CustomEvent`s count, as native events
// of the same names carry no value.
for (const type of new Set(manifest?.tags.flatMap(tag => tag.events?.map(event => event.name) ?? []))) {
	document.addEventListener(type, event => {
		const target = event.target as Element | null
		if (event instanceof CustomEvent && target?.localName.includes('-')) {
			action(`${target.localName} ${type}`)(event.detail)
		}
	}, { capture: true })
}

// Only what a story declares in `args` gets a control; the rest of the manifest is documentation.
const controlsForDeclaredArgs = ({ argTypes, initialArgs }: { argTypes: Record<string, any>, initialArgs: Record<string, unknown> }) =>
	Object.fromEntries(Object.entries(argTypes).map(([name, argType]) => [name, name in initialArgs ? argType : { ...argType, control: false }]))

// Pages without stories run no decorator, so a change from the toolbar is also applied as it arrives.
addons.getChannel().on(UPDATE_GLOBALS, ({ globals }: { globals: Record<string, unknown> }) => applyGlobals(globals))

export default {
	parameters: {
		docs: {
			container: DocsContainer,
			page: DocsPage,
			toc: {
				title: 'On this page',
				headingSelector: 'h2, h3',
				ignoreSelector: '.docs-hero h2, .docs-hero h3, .docs-changelog h3',
			},
			source: {
				language: 'lit',
				excludeDecorators: true,
				transform: transformSource,
			},
			codePanel: true,
		},
		controls: {
			expanded: true,
			matchers: {
				color: /(background|color)$/i,
				date: /Date$/,
			},
		},
		options: {
			storySort: {
				method: 'alphabetical',
				order: [
					'Getting Started', ['Introduction', 'Installation', 'Theming', 'Localization', 'Forms', 'Accessibility', 'Changelog', '*'],
					'Foundations', ['Theme', 'Localization', '*'],
					'Actions', 'Inputs', 'Layout', 'Feedback', 'Data', 'Behaviors', 'Utilities', 'Recipes', 'Contributing',
				],
			},
		},
	},
	globalTypes,
	initialGlobals,
	decorators: [...decorators, renderWhenVisible],
	argTypesEnhancers: [controlsForDeclaredArgs as any],
	tags: ['autodocs'],
} satisfies Preview