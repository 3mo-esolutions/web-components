export class Downloader {
	static download(url: string, name?: string) {
		const link = document.createElement('a')
		link.href = url
		link.style.visibility = 'hidden'
		link.download = name ?? ''
		link.target = '_blank'
		document.body.appendChild(link)
		link.click()
		document.body.removeChild(link)
	}
}