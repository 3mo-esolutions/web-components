import { Controller } from '@a11d/lit'
import { type PDFDocumentProxy } from 'pdfjs-dist'
import { type InteractivePdf } from './InteractivePdf.js'
import { PDFDocument } from 'pdf-lib'

declare var pdfjsLib: typeof import('pdfjs-dist')

export class DocumentController extends Controller {
	override host!: InteractivePdf

	static idleTimeout = 3_000

	private static _workerUrl: string

	static get workerUrl() {
		if (!this._workerUrl) {
			throw new Error('Worker url is not set!')
		}
		return this._workerUrl
	}

	static set workerUrl(value) {
		this._workerUrl = value
		if (!('pdfjsLib' in window)) {
			throw new Error('Rendering library is missing!')
		}
		pdfjsLib.GlobalWorkerOptions.workerSrc = DocumentController.workerUrl
	}

	private document!: PDFDocumentProxy

	private currentSource?: string

	get numberOfPages() {
		return this.document?.numPages ?? 0
	}

	override async hostUpdated() {
		if (!('pdfjsLib' in window)) {
			setTimeout(() => this.host.requestUpdate(), DocumentController.idleTimeout)
			return
		}
		if (this.host.source === this.currentSource || !this.host.source) {
			return
		}
		this.currentSource = this.host.source
		this.document = await pdfjsLib.getDocument(this.currentSource).promise
		this.host.requestUpdate()
		requestAnimationFrame(() => this.render())
	}

	private async render() {
		for (let i = 0; i < this.numberOfPages; i++) {
			const page = await this.document.getPage(i + 1);
			const viewport = page.getViewport({ scale: 3 })
			const documentNode = this.host.documentNodes[i]!
			documentNode.width = viewport.width
			documentNode.height = viewport.height
			documentNode.style.width = `${viewport.width / viewport.scale}px`
			documentNode.dataset.width = (viewport.width / (viewport.scale * 2)).toString()
			documentNode.dataset.height = (viewport.height / (viewport.scale * 2)).toString()
			page.render({ canvasContext: documentNode.getContext('2d')!, viewport })
		}

		this.host['fabricController'].render()
	}

	async fetchNatively() {
		const response = await fetch(this.host.source)

		const binary = await response.blob()
		const reader = new FileReader()
		const arrayBuffer = await new Promise<ArrayBuffer | null>(resolve => {
			reader.addEventListener('loadend', () => resolve(reader.result as ArrayBuffer))
			reader.addEventListener('error', () => resolve(null))
			reader.readAsArrayBuffer(binary)
		})

		return arrayBuffer
	}

	async mergeWithFiber(arrayBuffer: ArrayBuffer) {
		const file = await PDFDocument.load(arrayBuffer);
		const pages = file.getPages()

		for (let i = 0; i < pages.length; i++) {
			const { width, height } = pages[i]!.getSize()
			const image = this.host.fabricNodes[i]!.toDataURL('image/png')
			pages[i]?.drawImage(await file.embedPng(image), { x: 0, y: 0, width, height })
		}

		return new Blob([await file.save()], { type: 'application/pdf' })
	}
}