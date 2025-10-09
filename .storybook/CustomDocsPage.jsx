import React from 'react'
import { Title, Subtitle, Primary, ArgTypes, Stories, useOf, Markdown } from '@storybook/addon-docs/blocks'
import '@3mo/icon'
import '@3mo/theme'
import '@3mo/flex'
import '@3mo/heading'
import '@3mo/card'
import '@3mo/collapsible-card'
import '@3mo/tab'


export const CustomDocsPage = () => {
	const [tab, setTab] = React.useState('api')
	const tabBarRef = React.useRef(null);
	const resolvedOf = useOf('meta')
	React.useEffect(() => {
		const tabBarElement = tabBarRef.current;
		const handleChange = event => setTab(event.detail || event.target.value)
		tabBarElement?.addEventListener('change', handleChange);
		return () => tabBarElement?.removeEventListener('change', handleChange)
	}, []);

	const { meta } = resolvedOf.csfFile;
	const { title } = meta
	const _package = meta.package;

	const style = 'for-the-badge'
	const packageNameEncoded = encodeURIComponent(_package.name)
	const packageNameEncodedAndDashEscaped = packageNameEncoded.replace(/-/g, '--')
	return (
		<mo-flex id='docs-page'>
			<style>{`
				/* Your custom styles */
				.sbdocs-preview, .sb-bar { background: inherit !important; }
				.sbdocs-wrapper {
					padding: 2rem;
					background: #101114 !important;
					background: linear-gradient(109.6deg,
						rgb(16, 17, 20) 0%,
						color-mix(in srgb, var(--mo-color-accent) 15%, black) 17.5%,
						rgb(16, 17, 20) 60%
					) !important;
				}
				.docs-story { background: var(--mo-color-background) !important; }
				.docblock-argstable {
					background: var(--mo-color-background) !important;
					color: var(--mo-color-foreground) !important;
				}
			`}</style>
			<mo-flex direction='horizontal' justifyContent='space-between' alignItems='center' gap='6px'>
				<mo-flex>
					<Title>{title.split('/').pop()}</Title>
					<Subtitle>{_package.description}</Subtitle>
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
				ref={tabBarRef}
				style={{ '--mo-tab-divider-color': 'rgba(140,140,140,0.2)', color: 'white' }}
			>
				<mo-tab value='api' style={{ height: '60px' }}><mo-icon icon='api'></mo-icon> API Reference</mo-tab>
				<mo-tab value='changelog' style={{ height: '60px' }}><mo-icon icon='list_alt'></mo-icon> Changelog</mo-tab>
				<mo-tab value='stories' style={{ height: '60px' }}><mo-icon icon='history_edu'></mo-icon> Stories</mo-tab>
			</mo-tab-bar>

			{tab === 'api' && <div style={{ marginTop: '25px' }}><ArgTypes /></div>}
			{tab === 'changelog' && <div style={{ marginTop: '60px' }}><Markdown>{_package.changelog || 'Changelog is not available.'}</Markdown></div>}
			{tab === 'stories' && <Stories includePrimary={false} title={''} />}
		</mo-flex>
	)
}