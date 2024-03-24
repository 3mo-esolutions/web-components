import React, { useContext } from 'react'
import { INITIAL_VIEWPORTS } from '@storybook/addon-viewport'
import { themes } from '@storybook/theming'
import { setCustomElementsManifest } from '@storybook/web-components'
import { Primary, Controls, Stories, DocsContext, Markdown } from '@storybook/blocks'
import customElements from '../custom-elements.json'

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
	actions: { disabled: true },
	docs: {
		inlineStories: true,
		theme: themes.dark,
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
						@import url('https://fonts.googleapis.com/css2?family=Roboto&display=swap');

						:root {
							font-family: 'Roboto', sans-serif;
						}

						h1, h2, h3, h4, h5, h6 {
							font-family: 'Roboto', sans-serif !important;
							font-weight: 500 !important;
						}

						.docblock-argstable * {
							font-family: 'Cascadia Code', 'Fira Code', 'Consolas', monospace !important;
						}

						.sb-bar {
							background: var(--mo-color-background) !important;
						}

						.sbdocs-wrapper {
							background: var(--mo-color-background);
							background: linear-gradient(109.6deg,
								var(--mo-color-background) 0%,
								color-mix(in srgb, var(--mo-color-accent) 15%, black) 17.5%,
								var(--mo-color-background) 60%
							);
						}

						.docblock-code-toggle {
							display: none;
						}
					`}</style>
					<mo-flex direction='horizontal' justifyContent='space-between' alignItems='center' gap='6px'>
						<mo-flex>
							<mo-heading typography='heading1'>{title}</mo-heading>
							<mo-heading typography='heading5' style={{ color: 'var(--mo-color-gray)' }}>{_package.description}</mo-heading>
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

					<mo-tab-bar value={tab} ref={tab => tab && tab.addEventListener('change', listener)}>
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