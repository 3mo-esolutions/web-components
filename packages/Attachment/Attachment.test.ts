import { html } from '@a11d/lit'
import { ComponentTestFixture } from '@a11d/lit-testing'
import { userEvent } from 'vitest/browser'
import { type Attachment } from './Attachment.js'
import './index.js'

describe('Attachment', () => {
	const part = (attachment: Attachment, name: string) => attachment.renderRoot.querySelector<HTMLElement>(`[part=${name}]`)

	// A 1x1 transparent GIF
	const picture = 'data:image/gif;base64,R0lGODlhAQABAAAAACH5BAEKAAEALAAAAAABAAEAAAICTAEAOw=='

	describe('Name', () => {
		const fixture = new ComponentTestFixture<Attachment>(html`<mo-attachment name='purchase-order-4471.pdf'></mo-attachment>`)

		it('should show the file name, and in full as a title for where it is cut off', () => {
			const name = part(fixture.component, 'name')!

			expect(name.textContent.trim()).toBe('purchase-order-4471.pdf')
			expect(name.title).toBe('purchase-order-4471.pdf')
		})
	})

	describe('Description', () => {
		const description = (attachment: Attachment) => part(attachment, 'description')!.querySelector('slot')!.textContent.trim()

		for (const { name, size, expected } of [
			{ name: 'invoice.pdf', size: undefined, expected: 'PDF' },
			{ name: 'archive.tar.GZ', size: undefined, expected: 'GZ' },
			{ name: 'README', size: undefined, expected: '' },
			{ name: '.gitignore', size: undefined, expected: '' },
			{ name: 'empty.txt', size: 0, expected: 'TXT · 0 bytes' },
			{ name: 'notice.xml', size: 870, expected: 'XML · 870 bytes' },
			{ name: 'invoice.pdf', size: 248_832, expected: 'PDF · 243 kB' },
			{ name: 'photo.jpg', size: 1_887_436, expected: 'JPG · 1.8 MB' },
			{ name: 'photos.zip', size: 3_221_225_472, expected: 'ZIP · 3 GB' },
			{ name: 'README', size: 2048, expected: '2 kB' },
		]) {
			describe(`of "${name}" with ${size === undefined ? 'no size' : `${size} bytes`}`, () => {
				const fixture = new ComponentTestFixture<Attachment>(html`<mo-attachment name=${name} .size=${size}></mo-attachment>`)

				it(`should be "${expected}"`, () => {
					expect(description(fixture.component)).toBe(expected)
				})
			})
		}

		describe('with slotted content', () => {
			const fixture = new ComponentTestFixture<Attachment>(html`<mo-attachment name='invoice.pdf' size='248832'>Internal</mo-attachment>`)

			it('should show it in place of the type and size', () => {
				const slot = part(fixture.component, 'description')!.querySelector('slot')!

				expect(slot.assignedNodes({ flatten: true }).map(node => node.textContent!.trim())).toEqual(['Internal'])
			})
		})
	})

	describe('Media', () => {
		const icon = (attachment: Attachment) => part(attachment, 'media')!.querySelector('mo-icon')?.icon

		for (const { name, expected } of [
			{ name: 'invoice.pdf', expected: 'picture_as_pdf' },
			{ name: 'photo.JPG', expected: 'image' },
			{ name: 'prices.xlsx', expected: 'table_chart' },
			{ name: 'notice.xml', expected: 'code' },
			{ name: 'photos.zip', expected: 'folder_zip' },
			{ name: 'unknown.xyz', expected: 'insert_drive_file' },
			{ name: 'README', expected: 'insert_drive_file' },
		]) {
			describe(`of "${name}"`, () => {
				const fixture = new ComponentTestFixture<Attachment>(html`<mo-attachment name=${name}></mo-attachment>`)

				it(`should be the icon "${expected}"`, () => {
					expect(icon(fixture.component)).toBe(expected)
				})
			})
		}

		describe('with a thumbnail', () => {
			const fixture = new ComponentTestFixture<Attachment>(html`<mo-attachment name='photo.jpg' thumbnail=${picture}></mo-attachment>`)

			it('should show the image in place of the icon, without a text alternative', () => {
				const image = part(fixture.component, 'media')!.querySelector('img')!

				expect(image.src).toBe(picture)
				expect(image.alt).toBe('')
				expect(icon(fixture.component)).toBeUndefined()
			})

			it('should fall back to the icon when the image cannot be loaded', async () => {
				part(fixture.component, 'media')!.querySelector('img')!.dispatchEvent(new Event('error'))
				await fixture.updateComplete

				expect(part(fixture.component, 'media')!.querySelector('img')).toBeNull()
				expect(icon(fixture.component)).toBe('image')
			})

			it('should try again when the thumbnail changes after a failure', async () => {
				part(fixture.component, 'media')!.querySelector('img')!.dispatchEvent(new Event('error'))
				await fixture.updateComplete

				fixture.component.thumbnail = `${picture}#again`
				await fixture.updateComplete

				expect(part(fixture.component, 'media')!.querySelector('img')).not.toBeNull()
			})
		})

		describe('for assistive technology', () => {
			const fixture = new ComponentTestFixture<Attachment>(html`<mo-attachment name='invoice.pdf'></mo-attachment>`)

			it('should be hidden, as it is decoration', () => {
				expect(part(fixture.component, 'media')!.getAttribute('aria-hidden')).toBe('true')
			})
		})
	})

	describe('Link', () => {
		describe('without href', () => {
			const fixture = new ComponentTestFixture<Attachment>(html`<mo-attachment name='invoice.pdf'></mo-attachment>`)

			it('should render no link', () => {
				expect(fixture.component.renderRoot.querySelector('a')).toBeNull()
			})
		})

		describe('with href', () => {
			const fixture = new ComponentTestFixture<Attachment>(html`
				<mo-attachment removable name='invoice.pdf' href='#invoice' target='_blank' style='width: 20rem'>
					<button slot='action' id='own'>Own</button>
				</mo-attachment>
			`)
			const followed = vi.fn()

			beforeEach(() => {
				followed.mockClear()
				fixture.component.addEventListener('click', event => {
					event.preventDefault()
					followed(event.composedPath()[0])
				})
			})

			it('should render the name as a link to the file', () => {
				const link = fixture.component.renderRoot.querySelector('a')!

				expect(link.part.contains('name')).toBe(true)
				expect(link.getAttribute('href')).toBe('#invoice')
				expect(link.target).toBe('_blank')
				expect(link.textContent.trim()).toBe('invoice.pdf')
			})

			it('should follow the link from a press on the icon, far from the name', async () => {
				const media = part(fixture.component, 'media')!.getBoundingClientRect()
				const host = fixture.component.getBoundingClientRect()

				await userEvent.click(fixture.component, { position: { x: media.x - host.x + media.width / 2, y: media.y - host.y + media.height / 2 } })

				expect(followed).toHaveBeenCalledExactlyOnceWith(fixture.component.renderRoot.querySelector('a'))
			})

			it('should leave a press on a slotted action to that action', async () => {
				const own = fixture.component.querySelector<HTMLElement>('#own')!

				await userEvent.click(own)

				expect(followed).toHaveBeenCalledExactlyOnceWith(own)
			})

			it('should not report a press on the remove button as a press on the attachment', async () => {
				await userEvent.click(part(fixture.component, 'remove')!)

				expect(followed).not.toHaveBeenCalled()
			})
		})
	})

	describe('Removal', () => {
		describe('when not removable', () => {
			const fixture = new ComponentTestFixture<Attachment>(html`<mo-attachment name='invoice.pdf'></mo-attachment>`)

			it('should render no remove button', () => {
				expect(part(fixture.component, 'remove')).toBeNull()
			})
		})

		describe('when removable', () => {
			const fixture = new ComponentTestFixture<Attachment>(html`<mo-attachment removable name='invoice.pdf'></mo-attachment>`)

			it('should name the remove button after the file', () => {
				expect(part(fixture.component, 'remove')!.getAttribute('aria-label')).toBe('Remove invoice.pdf')
			})

			it('should ask for the removal with a cancelable, bubbling event and stay where it is', async () => {
				const requested = vi.fn()
				document.body.addEventListener('requestRemove', requested, { once: true })

				await userEvent.click(part(fixture.component, 'remove')!)

				expect(requested).toHaveBeenCalledTimes(1)
				expect(requested.mock.lastCall![0].cancelable).toBe(true)
				expect(requested.mock.lastCall![0].target).toBe(fixture.component)
				expect(fixture.component.isConnected).toBe(true)
			})
		})
	})

	describe('Layout', () => {
		const boxes = (attachment: Attachment) => ({
			media: part(attachment, 'media')!.getBoundingClientRect(),
			name: part(attachment, 'name')!.getBoundingClientRect(),
		})

		describe('sized to its content, as in a row', () => {
			const fixture = new ComponentTestFixture<Attachment>(html`<mo-attachment removable name='purchase-order-4471.pdf' size='248832' style='width: max-content'></mo-attachment>`)

			it('should show the whole name, with the media beside it', () => {
				const { media, name } = boxes(fixture.component)
				const nameElement = part(fixture.component, 'name')!

				expect(nameElement.scrollWidth).toBeLessThanOrEqual(nameElement.clientWidth)
				expect(media.right).toBeLessThanOrEqual(name.left)
				expect(media.bottom).toBeGreaterThan(name.top)
			})
		})

		describe('in a space narrower than its name', () => {
			const fixture = new ComponentTestFixture<Attachment>(html`<mo-attachment removable name='a-name-far-too-long-for-the-space-it-is-given.pdf' size='248832' style='width: 16rem'></mo-attachment>`)

			it('should keep the name beside the media and cut it off', () => {
				const { media, name } = boxes(fixture.component)
				const nameElement = part(fixture.component, 'name')!

				expect(media.right).toBeLessThanOrEqual(name.left)
				expect(media.bottom).toBeGreaterThan(name.top)
				expect(nameElement.scrollWidth).toBeGreaterThan(nameElement.clientWidth)
			})
		})
	})
})
