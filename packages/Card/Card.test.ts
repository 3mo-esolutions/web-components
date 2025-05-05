import { html, render } from '@a11d/lit'
import { ComponentTestFixture } from '@a11d/lit-testing'
import { type Card } from './Card.js'

describe('Card', () => {
	const fixture = new ComponentTestFixture<Card>('mo-card')

	function testSlotHiddenIfNoContentAvailable(slot: string, contentSlotName: string) {
		it(`should hide slot "${slot}" if no content of slot "${contentSlotName}" is available`, async () => {
			const slotElement = fixture.component.renderRoot.querySelector(`slot[name=${slot}]`)
			expect(getComputedStyle(slotElement!).getPropertyValue('display') === 'none').toBe(true)

			render(html`<div slot=${contentSlotName}>Content</div>`, fixture.component)

			await fixture.update()

			expect(getComputedStyle(slotElement!).getPropertyValue('display') === 'none').toBe(false)
		})
	}

	function testSlotRendersIfPropertyIsSet(toBeRenderSlotName: string, property: keyof Card) {
		it(`should render slot "${toBeRenderSlotName}" if property "${property}" is set`, async () => {
			(fixture.component as any)[property] = 'test'

			await fixture.update()

			expect(fixture.component.renderRoot.querySelector(`slot[part=${toBeRenderSlotName}]`)).not.toBeNull()
		})
	}

	describe('Media', () => {
		testSlotHiddenIfNoContentAvailable('media', 'media')

		testSlotRendersIfPropertyIsSet('media', 'image')

		it('should set the source of the image element when "image" property is set', async () => {
			fixture.component.image = 'https://example.com/image.jpg'

			await fixture.component.updateComplete

			expect(fixture.component.renderRoot.querySelector('img')?.src).toBe(fixture.component.image)
		})
	})

	describe('Header', () => {
		for (const property of ['heading', 'avatar', 'subHeading'] as const) {
			testSlotRendersIfPropertyIsSet('header', property)
		}

		for (const slotName of ['header', 'avatar', 'heading', 'subHeading', 'action'] as const) {
			testSlotHiddenIfNoContentAvailable('header', slotName)
		}

		for (const [propertyName, elementSelector] of [['avatar', 'div[part=avatar]'], ['heading', 'mo-heading[part=heading]'], ['subHeading', 'mo-heading[part=subHeading]']] as const) {
			it(`should render the ${elementSelector} element if ${propertyName} is set`, async () => {
				const content = 'Content'

				fixture.component[propertyName] = content
				await fixture.update()

				expect(fixture.component.renderRoot.querySelector(elementSelector)).not.toBeNull()
				expect(fixture.component.renderRoot.querySelector(elementSelector)?.textContent).toBe(content)
			})
		}
	})

	describe('Body', () => {
		it('should hide the body slot if no content is available', async () => {
			const slotElement = fixture.component.renderRoot.querySelector('slot:not([name])')
			expect(getComputedStyle(slotElement!).getPropertyValue('display') === 'none').toBe(true)

			fixture.component.textContent = 'Content'
			await fixture.update()

			expect(getComputedStyle(slotElement!).getPropertyValue('display') === 'none').toBe(false)
		})

		it('should remove the block-start padding if header is available', async () => {
			const slotElement = fixture.component.renderRoot.querySelector('slot:not([name])')

			fixture.component.textContent = 'Content'
			await fixture.update()
			expect(getComputedStyle(slotElement!).getPropertyValue('padding-block-start')).toBe('16px')

			fixture.component.heading = 'Heading'
			await fixture.update()
			expect(getComputedStyle(slotElement!).getPropertyValue('padding-block-start')).toBe('0px')
		})
	})

	describe('Footer', () => {
		testSlotHiddenIfNoContentAvailable('footer', 'footer')
	})
})