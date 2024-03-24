// @ts-check
import { promises as FileSystem } from 'fs'
import { Package, run } from './util/index.mjs'

const packageNames = Package.all.map(p => p.name)

const getPackageReadmeElements = (/** @type {string} */ packageName) => {
	const style = 'for-the-badge'
	const p = Package.all.find(p => p.name === packageName)
	const packageNameEncoded = encodeURIComponent(packageName)
	const packageNameEncodedAndDashEscaped = encodeURIComponent(packageName).replace(/-/g, '--')

	const packageFolderLink = `[${p?.directoryName}](${p?.relativePath})`
	const packageBadge = `[![](https://img.shields.io/badge/${packageNameEncodedAndDashEscaped}-8A2BE2?style=${style}&logo=npm&logoColor=red&color=white)](https://www.npmjs.com/package/${packageName})`
	const packageVersionBadge = `[![](https://img.shields.io/npm/v/${packageNameEncoded}?style=${style}&label=)](https://www.npmjs.com/package/${packageName})`
	const packageDownloadsBadge = `[![](https://img.shields.io/npm/dm/${packageNameEncoded}?style=${style}&label=&color=blue)](https://www.npmjs.com/package/${packageName})`

	return { packageFolderLink, packageBadge, packageVersionBadge, packageDownloadsBadge }
}

const cell = (/** @type {string} */ value) => value || ''
const codeCell = (/** @type {string} */ value) => value ? `<code>${value.replace(/</g, '&lt;').replace(/>/g, '&gt;')}</code>` : ''

/**
 * @param {import('../custom-elements.json')} manifest
 * @param {Package} pack
 */
async function generatePackageReadme(manifest, pack) {
	const elements = manifest.tags.filter(tag => tag.path.includes(pack.relativePath.replace('/', '\\') + '\\'))
	const readmeElements = getPackageReadmeElements(pack.name)
	await FileSystem.writeFile(`${pack.path}/README.md`, `
		<h1>

			${pack.directoryName}
			${readmeElements.packageBadge}
			${readmeElements.packageDownloadsBadge}
			${readmeElements.packageVersionBadge}
			[![Stories](https://img.shields.io/badge/-Stories-pink.svg?logo=storybook&style=for-the-badge)](https://3mo-esolutions.github.io/web-components/)
		</h1>

		${pack.packageJson.description}

		## API Reference

		<table>
			${elements.map(({ name, attributes, events, cssProperties, cssParts }) => `
				<thead>
					<tr>
						<th colspan="4" align="center">
							<h3>${codeCell(name)}</h3>
						</th>
					</tr>
					<tr>
						<td></td>
						<th>Name</th>
						<th>Type</th>
						<th>Description</th>
					</tr>
				</thead>
				${!attributes?.length ? '' : `
					<tr>
						<td rowspan="${attributes.length + 1}"></td>
						<th colspan="3" align="start">Properties</th>
					</tr>
					${attributes?.map(prop => `
						<tr>
							<td>${cell(prop.name)}</td>
							<td>${codeCell(prop.type)}</td>
							<td>${cell(prop.description)}</td>
						</tr>
					`).join('\n')}
				`}
				${!events?.length ? '' : `
					<tr>
						<td rowspan="${events.length + 1}"></td>
						<th colspan="3" align="start">Events</th>
					</tr>
					${events?.map(event => `
						<tr>
							<td>${cell(event.name)}</td>
							<td>${codeCell(event.type)}</td>
							<td>${cell(event.description)}</td>
						</tr>
					`).join('\n')}
				`}
				${!cssProperties?.length ? '' : `
					<tr>
						<td rowspan="${cssProperties.length + 1}"></td>
						<th colspan="3" align="start">CSS Properties</th>
					</tr>
					${cssProperties?.map(prop => `
						<tr>
							<td>${cell(prop.name)}</td>
							<td></td>
							<td>${cell(prop.description)}</td>
						</tr>
					`).join('\n')}
				`}
				${!cssParts?.length ? '' : `
					<tr>
						<td rowspan="${cssParts.length + 1}"></td>
						<th colspan="3" align="start">CSS Parts</th>
					</tr>
					${cssParts?.map(part => `
						<tr>
							<td>${cell(part.name)}</td>
							<td></td>
							<td>${cell(part.description)}</td>
						</tr>
					`).join('\n')}
				`}
			`).join('\n')}
		</table>
	`.trim().replace(/\t/g, ''))
}
// Package specific READMEs not used as we use Storybook:
generatePackageReadme

async function generateGlobalReadme() {
	await FileSystem.writeFile('README.md', `
		<div align="center">
		<a href="https://3mo.de">
			<img src="https://www.3mo.de/wp-content/themes/3mo/assets/images/logo_3mo.svg" alt="3MO Logo" width="80" height="80">
		</a>

		<h3>3MO Web Components</h3>

		[![Tests](https://img.shields.io/github/actions/workflow/status/3mo-esolutions/web-components/development.yml?logo=github&style=for-the-badge&label=Tests)](https://3mo-esolutions.github.io/web-components/actions/workflows/development.yml)
		[![Stories](https://img.shields.io/badge/-Stories-pink.svg?logo=storybook&style=for-the-badge)](https://3mo-esolutions.github.io/web-components/)


		| Module | Package | Version | Downloads |
		| ------- | ------- | ------- | --------- |
		${packageNames.map(packageName => getPackageReadmeElements(packageName)).map(x => '| ' + [x.packageFolderLink, x.packageBadge, x.packageVersionBadge, x.packageDownloadsBadge].join(' | ') + ' |').join('\n')}

		</div>
	`.replace(/\t/g, ''))
}

//const manifest = (await import('../custom-elements.json', { assert: { type: 'json' } })).default

await Promise.all([
	//...Package.all.map(p => generatePackageReadme(manifest, p)),
	generateGlobalReadme(),
])

try { await run('git add **/*/README.md') } catch { /* ignore */ }