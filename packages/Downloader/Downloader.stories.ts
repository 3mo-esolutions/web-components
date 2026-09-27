import type { Meta, StoryObj } from '@storybook/web-components-vite'
import { html } from '@a11d/lit'
import { Downloader } from './index.js'

export default {
	title: 'Utilities / Downloader',
} satisfies Meta

/** A file generated in the browser downloads through a blob URL under the name it is given. */
export const Default: StoryObj = {
	render: () => html`
		<mo-button type='outlined' startIcon='download'
			@click=${() => Downloader.download(URL.createObjectURL(new Blob(['Hello, world!'], { type: 'text/plain' })), 'hello.txt')}
		>Download hello.txt</mo-button>
	`,
}

/** Any URL the browser can fetch works, a data URL included. */
export const DataUrl: StoryObj = {
	render: () => html`
		<mo-button type='outlined' startIcon='download'
			@click=${() => Downloader.download('data:text/csv;charset=utf-8,Name,Role%0AAda Lovelace,Analyst%0AAlan Turing,Cryptanalyst', 'people.csv')}
		>Download people.csv</mo-button>
	`,
}