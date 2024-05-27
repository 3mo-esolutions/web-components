import React, { useContext } from 'react'
import { INITIAL_VIEWPORTS } from '@storybook/addon-viewport'
import { addons } from '@storybook/preview-api'
import { theme } from './manager'
import { setCustomElementsManifest } from '@storybook/web-components'
import { withThemeByDataAttribute } from '@storybook/addon-themes'
import { Primary, Controls, Stories, DocsContext, Markdown } from '@storybook/blocks'
import customElements from '../custom-elements.json'
import { DARK_MODE_EVENT_NAME } from 'storybook-dark-mode'

customElements.tags.forEach(tag => tag.properties = [])
setCustomElementsManifest(customElements)

declare global {
	namespace JSX {
		interface IntrinsicElements {
			'mo-icon': any
			'mo-heading': any
			'mo-flex': any
			'mo-card': any
			'mo-collapsible-card': any
			'mo-tab-bar': any
			'mo-tab': any
		}
	}
}

export const parameters = {
	darkMode: {
		dark: theme,
		light: theme,
		current: 'dark',
	},
	docs: {
		inlineStories: true,
		theme: theme,
		page: () => {
			const context = useContext(DocsContext)
			const meta = [...(context as any).attachedCSFFiles][0].meta
			const title = meta.title
			const _package = meta.package
			const style = 'for-the-badge'
			const packageNameEncoded = encodeURIComponent(_package.name)
			const packageNameEncodedAndDashEscaped = packageNameEncoded.replace(/-/g, '--')

			const urlHasHref = window.parent.location.href.includes('#')
			const [tab, setTab] = React.useState<'api' | 'changelog' | 'stories'>(urlHasHref ? 'stories' : 'api')
			const listener = (event: CustomEvent<'api' | 'changelog' | 'stories'>) => setTab(event.detail)

			return (
				<mo-flex>
					<style>{`
						.sbdocs-preview, .sb-bar {
							background: inherit !important;
						}

						.sbdocs-wrapper {
							background: #101114 !important;
							background: linear-gradient(109.6deg,
								rgb(16, 17, 20) 0%,
								color-mix(in srgb, var(--mo-color-accent) 15%, black) 17.5%,
								rgb(16, 17, 20) 60%
							) !important;
						}

						.docs-story {
							background: var(--mo-color-background) !important;
						}

						.docblock-code-toggle {
							display: none;
						}
					`}</style>
					<mo-flex direction='horizontal' justifyContent='space-between' alignItems='center' gap='6px'>
						<mo-flex>
							<mo-heading typography='heading1' style={{ color: 'white' }}>{title}</mo-heading>
							<mo-heading typography='heading5' style={{ color: 'rgb(165, 165, 165)' }}>{_package.description}</mo-heading>
						</mo-flex>
						<mo-flex direction='horizontal' gap='4px' style={{ flexShrink: '0' }}>
							<mo-flex direction='horizontal'>
								<a target='_blank' href={`https://www.npmjs.com/package/${_package.name}`}>
									<img src={`https://img.shields.io/badge/${packageNameEncodedAndDashEscaped}-8A2BE2?style=${style}&logo=npm&logoColor=red&color=white`} />
								</a>

								<a target='_blank' href={`https://www.npmjs.com/package/${_package.name}`}>
									<img src={`https://img.shields.io/npm/v/${packageNameEncoded}?style=${style}&label=`} />
								</a>
							</mo-flex>

							<a target='_blank' href={`https://www.npmjs.com/package/${_package.name}`}>
								<img src={`https://img.shields.io/npm/dm/${packageNameEncoded}?style=${style}&label=&color=blue`} />
							</a>
						</mo-flex>
					</mo-flex>

					<Primary />

					<mo-tab-bar
						value={tab}
						ref={tab => tab && tab.addEventListener('change', listener)}
						style={{ '--mo-tab-divider-color': 'rgba(140,140,140,0.2)', color: 'white' }}
					>
						<mo-tab value='api' style={{ height: '60px' }}>
							<mo-icon icon='api'></mo-icon>
							API Reference
						</mo-tab>
						<mo-tab value='changelog' style={{ height: '60px' }}>
							<mo-icon icon='list_alt'></mo-icon>
							Changelog
						</mo-tab>
						<mo-tab value='stories' style={{ height: '60px' }}>
							<mo-icon icon='history_edu'></mo-icon>
							Stories
						</mo-tab>
					</mo-tab-bar>

					{tab === 'changelog' && <div style={{ marginTop: '60px' }}><Markdown children={_package.changelog || 'Changelog is not available in development environment'} /></div>}
					{tab === 'api' && <div style={{ marginTop: '25px' }}><Controls /></div>}
					{tab === 'stories' && <Stories includePrimary={false} title={''} />}
				</mo-flex>
			)
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

const channel = addons.getChannel()

export default {
	decorators: [
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
	]
}