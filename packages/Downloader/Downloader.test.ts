import { Downloader } from './Downloader.js'

describe('Downloader', () => {
	const clickedAnchor = () => {
		let anchor: HTMLAnchorElement | undefined
		let wasConnected: boolean | undefined
		spyOn(HTMLAnchorElement.prototype, 'click').and.callFake(function (this: HTMLAnchorElement) {
			anchor = this
			wasConnected = this.isConnected
		})
		return {
			get element() { return anchor! },
			get wasConnected() { return wasConnected! },
		}
	}

	it('should click an anchor pointing at the given URL', () => {
		const clicked = clickedAnchor()

		Downloader.download('https://example.com/file.pdf')

		expect(clicked.element).toBeInstanceOf(HTMLAnchorElement)
		expect(clicked.element.href).toBe('https://example.com/file.pdf')
		expect(clicked.wasConnected).toBeTrue()
	})

	it('should set the download attribute to the given file name', () => {
		const clicked = clickedAnchor()

		Downloader.download('https://example.com/file.pdf', 'invoice.pdf')

		expect(clicked.element.download).toBe('invoice.pdf')
	})

	it('should remove the temporary anchor from the document afterwards', () => {
		const clicked = clickedAnchor()

		Downloader.download('https://example.com/file.pdf', 'invoice.pdf')

		expect(clicked.wasConnected).toBeTrue()
		expect(clicked.element.isConnected).toBeFalse()
		expect(document.body.contains(clicked.element)).toBeFalse()
	})
})