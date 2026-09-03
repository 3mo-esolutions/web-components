import { html } from '@a11d/lit'
import { ComponentTestFixture } from '@a11d/lit-testing'
import { Button, ButtonType } from '@3mo/button'
import { type ButtonGroup } from './ButtonGroup.js'
import './index.js'

const buttonsOf = (group: ButtonGroup) => [...group.querySelectorAll('mo-button')]

const settle = () => new Promise(resolve => setTimeout(resolve, 50))

describe('ButtonGroup', () => {
	describe('type propagation', () => {
		const fixture = new ComponentTestFixture<ButtonGroup>(html`
			<mo-button-group type='outlined'>
				<mo-button>Button 1</mo-button>
				<mo-button>Button 2</mo-button>
			</mo-button-group>
		`)

		it('should assign its type to every slotted button', () => {
			expect(buttonsOf(fixture.component).map(button => button.type)).toEqual([ButtonType.Outlined, ButtonType.Outlined])
		})

		it('should assign the type to buttons slotted in later', async () => {
			const button = new Button
			expect(button.type).toBe(ButtonType.Text)

			fixture.component.appendChild(button)
			await settle()

			expect(button.type).toBe(ButtonType.Outlined)
		})

		it('should re-assign the type to all buttons when "type" changes', async () => {
			fixture.component.type = ButtonType.Filled
			await fixture.updateComplete

			expect(buttonsOf(fixture.component).map(button => button.type)).toEqual([ButtonType.Filled, ButtonType.Filled])
		})
	})

	describe('corner rounding', () => {
		const radiiOf = (button: Element) => {
			const style = getComputedStyle(button)
			return [style.borderTopLeftRadius, style.borderTopRightRadius, style.borderBottomRightRadius, style.borderBottomLeftRadius]
		}

		const expectationByDirection = new Map([
			['horizontal', { first: ['8px', '0px', '0px', '8px'], last: ['0px', '8px', '8px', '0px'] }],
			['horizontal-reversed', { first: ['0px', '8px', '8px', '0px'], last: ['8px', '0px', '0px', '8px'] }],
			['vertical', { first: ['8px', '8px', '0px', '0px'], last: ['0px', '0px', '8px', '8px'] }],
			['vertical-reversed', { first: ['0px', '0px', '8px', '8px'], last: ['8px', '8px', '0px', '0px'] }],
		])

		for (const [direction, expectation] of expectationByDirection) {
			const fixture = new ComponentTestFixture<ButtonGroup>(html`
				<mo-button-group direction=${direction} style='--mo-button-group-border-radius: 8px'>
					<mo-button>Button 1</mo-button>
					<mo-button>Button 2</mo-button>
				</mo-button-group>
			`)

			it(`should round only the outer corners of the first and the last button in "${direction}" direction`, () => {
				const [first, last] = buttonsOf(fixture.component)
				expect(radiiOf(first!)).toEqual(expectation.first)
				expect(radiiOf(last!)).toEqual(expectation.last)
			})
		}

		const threeButtonFixture = new ComponentTestFixture<ButtonGroup>(html`
			<mo-button-group direction='horizontal' style='--mo-button-group-border-radius: 8px'>
				<mo-button>Button 1</mo-button>
				<mo-button>Button 2</mo-button>
				<mo-button>Button 3</mo-button>
			</mo-button-group>
		`)

		it('should square all corners of middle buttons', () => {
			const [, middle] = buttonsOf(threeButtonFixture.component)
			expect(radiiOf(middle!)).toEqual(['0px', '0px', '0px', '0px'])
		})

		it('should re-evaluate the first and the last button when buttons are added or removed', async () => {
			const [, , last] = buttonsOf(threeButtonFixture.component)
			const appended = new Button

			threeButtonFixture.component.appendChild(appended)
			await settle()

			expect(last!.hasAttribute('data-mo-button-group-last')).toBe(false)
			expect(appended.hasAttribute('data-mo-button-group-last')).toBe(true)

			appended.remove()
			await settle()

			expect(last!.hasAttribute('data-mo-button-group-last')).toBe(true)
		})

		const paddedFixture = new ComponentTestFixture<ButtonGroup>(html`
			<mo-button-group direction='horizontal'>
				<span>not a button</span>
				<mo-button id='first-button'>Button 1</mo-button>
				<mo-button id='last-button'>Button 2</mo-button>
				<span>not a button</span>
			</mo-button-group>
		`)

		it('should ignore non-button children when determining the first and the last button', () => {
			const first = paddedFixture.component.querySelector('#first-button')!
			const last = paddedFixture.component.querySelector('#last-button')!
			expect(first.hasAttribute('data-mo-button-group-first')).toBe(true)
			expect(first.hasAttribute('data-mo-button-group-last')).toBe(false)
			expect(last.hasAttribute('data-mo-button-group-last')).toBe(true)
			expect(last.hasAttribute('data-mo-button-group-first')).toBe(false)
		})
	})

	describe('separator', () => {
		const fixture = new ComponentTestFixture<ButtonGroup>(html`
			<mo-button-group type='text' direction='horizontal'>
				<mo-button>Button 1</mo-button>
				<mo-button>Button 2</mo-button>
			</mo-button-group>
		`)

		it('should render a separator after every button except the last', () => {
			const [first, last] = buttonsOf(fixture.component)
			expect(getComputedStyle(first!, '::after').content).not.toBe('none')
			expect(getComputedStyle(first!, '::after').width).toBe('1px')
			expect(getComputedStyle(last!, '::after').content).toBe('none')
		})

		const outlinedFixture = new ComponentTestFixture<ButtonGroup>(html`
			<mo-button-group type='outlined' direction='horizontal'>
				<mo-button>Button 1</mo-button>
				<mo-button>Button 2</mo-button>
			</mo-button-group>
		`)

		it('should not render separators for the outlined type', () => {
			const [first] = buttonsOf(outlinedFixture.component)
			expect(getComputedStyle(first!, '::after').content).toBe('none')
		})
	})

	describe('direction', () => {
		const fixture = new ComponentTestFixture<ButtonGroup>(html`
			<mo-button-group direction='vertical-reversed'>
				<mo-button>Button 1</mo-button>
			</mo-button-group>
		`)

		it('should lay out the slotted buttons in the given direction', async () => {
			const flex = fixture.component.renderRoot.querySelector('mo-flex')!
			expect(getComputedStyle(flex).flexDirection).toBe('column-reverse')

			fixture.component.direction = 'horizontal'
			await fixture.updateComplete

			expect(getComputedStyle(flex).flexDirection).toBe('row')
		})
	})
})