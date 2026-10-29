import '../../index.js'
import { html, render } from '@a11d/lit'
import { DataGridColumnImagePreview } from './DataGridColumnImagePreview.js'
import type { DataGridImagePreview } from './DataGridImagePreview.js'
import type { DataGridImagePreviewButton } from './DataGridImagePreviewButton.js'

type Item = { id: number, name: string }

const source = 'data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7'

const waitForImage = async (preview: DataGridImagePreview) => {
	await preview.updateComplete
	await vi.waitUntil(() => preview.renderRoot.querySelector('img, mo-icon'))
}

describe('DataGridColumnImagePreview', () => {
	const container = document.createElement('div')
	document.body.append(container)

	afterEach(() => render(html.nothing, container))

	it('should render a preview button only for a value', () => {
		const column = new DataGridColumnImagePreview<Item>()

		render(column.getContentTemplate(source, { id: 1, name: 'Alice' }), container)
		expect(container.querySelector('mo-data-grid-image-preview-button')).not.toBeNull()

		render(column.getContentTemplate(undefined, { id: 1, name: 'Alice' }), container)
		expect(container.querySelector('mo-data-grid-image-preview-button')).toBeNull()
	})

	it('should pass its source resolver and its preview content to the button', () => {
		const column = new DataGridColumnImagePreview<Item, number>()
		column.getSource = () => source
		column.getPreviewContentTemplate = (_, data) => html`<span>${data.name}</span>`

		render(column.getContentTemplate(1, { id: 1, name: 'Alice' }), container)
		const button = container.querySelector('mo-data-grid-image-preview-button')!

		expect(button.value).toBe(1)
		expect(button.getSource).toBe(column.getSource)
		expect(button.textContent?.trim()).toBe('Alice')
	})

	describe('DataGridImagePreview', () => {
		it('should show the image resolved from the value', async () => {
			const getSource = vi.fn((id: unknown) => Promise.resolve(id === 1 ? source : undefined))
			render(html`<mo-data-grid-image-preview .value=${1} .getSource=${getSource}></mo-data-grid-image-preview>`, container)
			const preview = container.querySelector('mo-data-grid-image-preview')!

			await waitForImage(preview)

			expect(getSource).toHaveBeenCalledWith(1)
			expect(preview.renderRoot.querySelector('img')?.getAttribute('src')).toBe(source)
		})

		it('should use the value itself as source without resolver', async () => {
			render(html`<mo-data-grid-image-preview .value=${source}></mo-data-grid-image-preview>`, container)
			const preview = container.querySelector('mo-data-grid-image-preview')!

			await waitForImage(preview)

			expect(preview.renderRoot.querySelector('img')?.getAttribute('src')).toBe(source)
		})

		it('should show a placeholder when the image cannot be loaded', async () => {
			render(html`<mo-data-grid-image-preview .value=${'data:image/png;base64,broken'}></mo-data-grid-image-preview>`, container)
			const preview = container.querySelector('mo-data-grid-image-preview')!

			await waitForImage(preview)

			expect(preview.renderRoot.querySelector('img')).toBeNull()
			expect(preview.renderRoot.querySelector('mo-icon')?.getAttribute('icon')).toBe('image_not_supported')
		})

		it('should not resolve the source while the image is hidden', async () => {
			const getSource = vi.fn(() => source)
			render(html`<mo-data-grid-image-preview .value=${1} .getSource=${getSource} imageHidden></mo-data-grid-image-preview>`, container)

			await container.querySelector('mo-data-grid-image-preview')!.updateComplete

			expect(getSource).not.toHaveBeenCalled()
		})
	})

	describe('DataGridImagePreviewButton', () => {
		it('should keep only one preview open at a time', () => {
			render(html`
				<mo-data-grid-image-preview-button .value=${source}></mo-data-grid-image-preview-button>
				<mo-data-grid-image-preview-button .value=${source}></mo-data-grid-image-preview-button>
			`, container)
			const [first, second] = [...container.querySelectorAll('mo-data-grid-image-preview-button')] as Array<DataGridImagePreviewButton>

			first!.show()
			expect([first!.open, second!.open]).toEqual([true, false])

			second!.show()
			expect([first!.open, second!.open]).toEqual([false, true])
		})
	})
})
