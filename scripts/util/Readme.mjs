import { Packages } from './Packages.mjs'
import * as FileSystem from 'fs'

export class Readme {
	static generate() {
		const packageNames = Packages.getAllPackages()

		const getPackageReadme = (packageName) => {
			const style = 'for-the-badge'
			const relativePath = Packages.getPath(packageName).split('\\').slice(-3, -1).join('/')
			const moduleName = relativePath.split('/').slice(-1)[0]
			const packageNameEncoded = encodeURIComponent(packageName)
			const packageNameEncodedAndDashEscaped = encodeURIComponent(packageName).replace(/-/g, '--')

			const packageFolderBadge = `[${moduleName}](${relativePath})`
			const packageBadge = `[![](https://img.shields.io/badge/${packageNameEncodedAndDashEscaped}-8A2BE2?style=${style}&logo=npm&logoColor=red&color=white)](https://www.npmjs.com/package/${packageName})`
			const packageVersionBadge = `[![](https://img.shields.io/npm/v/${packageNameEncoded}?style=${style}&label=)](https://www.npmjs.com/package/${packageName})`
			const packageDownloadsBadge = `[![](https://img.shields.io/npm/dm/${packageNameEncoded}?style=${style}&label=&color=blue)](https://www.npmjs.com/package/${packageName})`

			return `| ${packageFolderBadge} | ${packageBadge} | ${packageVersionBadge} | ${packageDownloadsBadge} |`
		}

		const readme = `
			<div align="center">
			<a href="https://3mo.de">
				<img src="https://www.3mo.de/wp-content/themes/3mo/assets/images/logo_3mo.svg" alt="3MO Logo" width="80" height="80">
			</a>

			<h3>3MO Web Components</h3>

			[![Tests](https://img.shields.io/github/actions/workflow/status/3mo-esolutions/web-components/development.yml?logo=github&style=for-the-badge&label=Tests)](https://3mo-esolutions.github.io/web-components/actions/workflows/development.yml)
			[![Stories](https://img.shields.io/badge/-Stories-pink.svg?logo=storybook&style=for-the-badge)](https://3mo-esolutions.github.io/web-components/)


			| Module  | Package | Version | Downloads |
			| ------- | ------- | ------- | --------- |
			${packageNames.map(packageName => getPackageReadme(packageName)).join('\n')}

			</div>
		`

		const readmeLinesWithoutTabs = readme.split('\n')
			.map(line => line.replace(/\t/g, ''))
			.join('\n')

		FileSystem.writeFileSync('README.md', readmeLinesWithoutTabs)
	}
}