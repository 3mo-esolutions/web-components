import type { Meta, StoryObj } from '@storybook/web-components'
import { html } from '@a11d/lit'
import p from './package.json'
import { CommandPalette, CommandPaletteDataSource, type CommandPaletteData } from './index.js'
import type { MaterialIcon } from '@3mo/icon/MaterialIcon.js'

export default {
	title: 'Selection & Input / Command Palette',
	component: 'mo-command-palette',
	package: p,
} as Meta

export const _CommandPalette: StoryObj = {
	render: () => {
		@CommandPalette.dataSource()
		class DataSource extends CommandPaletteDataSource<number> {
			private static items = new Array(100).fill(0).map((_, i) => i)

			name = 'Numbers'
			icon: MaterialIcon = 'pin'

			fetch() {
				return Promise.resolve(DataSource.items)
			}

			search(keyword: string) {
				return Promise.resolve(DataSource.items.filter(i => i.toString().includes(keyword)))
			}

			getItem(item: number): CommandPaletteData {
				return {
					icon: this.icon,
					label: `Number ${item}`,
					command() {
						alert(`${item} clicked`)
					}
				}
			}

		}
		DataSource
		return html`
			<mo-command-palette-button></mo-command-palette-button>
		`
	}
}