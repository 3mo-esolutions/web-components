import { html, render } from '@a11d/lit'
import { ComponentTestFixture } from '../../test/index.js'
import { Card } from './Card.js'

describe(Card.name, () => {
	const fixture = new ComponentTestFixture(() => new Card)

	function testSlotRendersIfContentAvailable(toBeRenderSlotName: string, contentSlotName: string) {
		it(`should render slot "${toBeRenderSlotName}" if the content of slot "${contentSlotName}" is available`, async () => {
			render(html`<div slot=${contentSlotName}>Content</div>`, fixture.component)

			await fixture.update()

			expect(fixture.component.renderRoot.querySelector(`slot[part=${toBeRenderSlotName}]`)).not.toBeNull()
		})
	}

	function testSlotRendersIfPropertyIsSet(toBeRenderSlotName: string, property: keyof Card) {
		it(`should render slot "${toBeRenderSlotName}" if property "${property}" is set`, async () => {
			(fixture.component as any)[property] = 'test'

			await fixture.update()

			expect(fixture.component.renderRoot.querySelector(`slot[part=${toBeRenderSlotName}]`)).not.toBeNull()
		})
	}

	describe('Header', () => {
		for (const property of ['heading', 'avatar', 'subHeading'] as const) {
			testSlotRendersIfPropertyIsSet('header', property)
		}

		for (const slotName of ['header', 'avatar', 'heading', 'subHeading', 'action'] as const) {
			testSlotRendersIfContentAvailable('header', slotName)
		}

		for (const [propertyName, elementSelector] of [['avatar', 'mo-avatar'], ['heading', 'mo-heading[part=heading]'], ['subHeading', 'mo-heading[part=subHeading]']] as const) {
			it(`should render the ${elementSelector} element if ${propertyName} is set`, async () => {
				const content = 'Content'

				fixture.component[propertyName] = content
				await fixture.update()

				expect(fixture.component.renderRoot.querySelector(elementSelector)).not.toBeNull()
				expect(fixture.component.renderRoot.querySelector(elementSelector)?.textContent).toBe(content)
			})
		}
	})

	describe('Media', () => {
		testSlotRendersIfContentAvailable('media', 'media')

		testSlotRendersIfPropertyIsSet('media', 'image')

		it('should set the source of the image element when "image" property is set', async () => {
			fixture.component.image = 'https://example.com/image.jpg'

			await fixture.component.updateComplete

			expect(fixture.component.renderRoot.querySelector('img')?.src).toBe(fixture.component.image)
		})
	})

	describe('Footer', () => {
		testSlotRendersIfContentAvailable('footer', 'footer')
	})
})