import { html } from '@a11d/lit'

export const fileSystem = html`
	<mo-tree-item value='documents' icon='folder' open>
		Documents
		<mo-tree-item value='taxes' icon='folder'>
			Taxes
			<mo-tree-item value='2025.pdf' icon='picture_as_pdf'>2025.pdf</mo-tree-item>
			<mo-tree-item value='2026.pdf' icon='picture_as_pdf'>2026.pdf</mo-tree-item>
		</mo-tree-item>
		<mo-tree-item value='letters' icon='folder'>
			Letters
			<mo-tree-item value='landlord.docx' icon='description'>Landlord.docx</mo-tree-item>
		</mo-tree-item>
		<mo-tree-item value='notes.md' icon='description'>Notes.md</mo-tree-item>
	</mo-tree-item>
	<mo-tree-item value='pictures' icon='folder'>
		Pictures
		<mo-tree-item value='holidays' icon='folder'>
			Holidays
			<mo-tree-item value='beach.jpg' icon='image'>Beach.jpg</mo-tree-item>
			<mo-tree-item value='mountains.jpg' icon='image'>Mountains.jpg</mo-tree-item>
		</mo-tree-item>
		<mo-tree-item value='screenshot.png' icon='image'>Screenshot.png</mo-tree-item>
	</mo-tree-item>
	<mo-tree-item value='music' icon='folder'>
		Music
		<mo-tree-item value='playlist.m3u' icon='description'>Playlist.m3u</mo-tree-item>
	</mo-tree-item>
	<mo-tree-item value='system' icon='folder' disabled>
		System
		<mo-tree-item value='kernel' icon='description'>kernel</mo-tree-item>
	</mo-tree-item>
	<mo-tree-item value='readme.txt' icon='description'>Readme.txt</mo-tree-item>
`