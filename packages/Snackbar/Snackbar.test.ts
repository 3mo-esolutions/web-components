import { ComponentTestFixture } from '@a11d/lit-testing'
import { NotificationType, type Notification } from '@a11d/lit-application'
import { Snackbar, SnackbarStackController } from './index.js'

describe('Snackbar', () => {
	const fixture = new ComponentTestFixture(() => new Snackbar)

	const nextFrame = () => new Promise(requestAnimationFrame)

	// The returned promise is wrapped, as it only settles once the snack-bar closes
	const show = async (snackbar: Snackbar, notification?: Notification) => {
		snackbar.notification = notification ?? snackbar.notification ?? { message: 'Test' }
		const shown = snackbar.show()
		await snackbar.updateComplete
		await nextFrame()
		await nextFrame()
		return { shown }
	}

	const getSurface = (snackbar: Snackbar) => snackbar.renderRoot.querySelector<HTMLElement>('[part=surface]')!
	const isCollapsed = (snackbar: Snackbar) => getSurface(snackbar).hasAttribute('data-collapsed')
	const getOffset = (snackbar: Snackbar) => getSurface(snackbar).style.getPropertyValue('--mo-snackbar-y')

	afterEach(async () => {
		for (const snackbar of [...document.querySelectorAll('mo-snackbar')]) {
			snackbar.close()
		}
		await new Promise(resolve => setTimeout(resolve, 400))
		for (const snackbar of [...document.querySelectorAll('mo-snackbar')]) {
			snackbar.remove()
		}
	})

	it('should render the notification message', async () => {
		await show(fixture.component, { message: 'Something happened' })

		expect(fixture.component.open).toBe(true)
		expect(fixture.component.renderRoot.querySelector('.label')?.textContent).toBe('Something happened')
	})

	it('should reflect the notification type and use an alert role for errors', async () => {
		await show(fixture.component, { message: 'Failed', type: NotificationType.Error })

		expect(fixture.component.getAttribute('type')).toBe(NotificationType.Error)
		expect(getSurface(fixture.component).getAttribute('role')).toBe('alert')
		expect(fixture.component.renderRoot.querySelector('mo-icon')?.icon).toBe('error')
	})

	it('should render a button for each action', async () => {
		await show(fixture.component, {
			message: 'Deleted',
			actions: [
				{ title: 'Undo', handleClick: () => void 0 },
				{ title: 'Details', handleClick: () => void 0 },
			],
		})

		const buttons = fixture.component.renderRoot.querySelectorAll('mo-button')
		expect(buttons.length).toBe(2)
		expect(buttons[0]?.textContent).toBe('Undo')
	})

	it('should close and resolve show() when the dismiss button is clicked', async () => {
		const { shown } = await show(fixture.component, { message: 'Dismiss me' })

		fixture.component.renderRoot.querySelector('mo-icon-button')?.click()
		await shown

		expect(fixture.component.open).toBe(false)
	})

	it('should make the surface visible once open', async () => {
		await show(fixture.component, { message: 'Visible' })
		// Awaited out, as the computed opacity is interpolated while the snack-bar is still transitioning in
		await new Promise(resolve => setTimeout(resolve, 400))

		expect(getComputedStyle(getSurface(fixture.component)).opacity).toBe('1')
	})

	describe('stack', () => {
		// Created oldest first, so that the LAST one of these is the front of the stack
		const createSnackbars = async (count: number) => {
			const snackbars = new Array<Snackbar>()
			for (let index = 0; index < count; index++) {
				const snackbar = new Snackbar()
				document.body.appendChild(snackbar)
				snackbars.push(snackbar)
				await show(snackbar, { message: `Notification ${index}` })
			}
			await nextFrame()
			await nextFrame()
			return snackbars
		}

		it('should lay out as a list while no more snack-bars are open than are laid out in full', async () => {
			const snackbars = await createSnackbars(SnackbarStackController.expandedCount)

			expect(snackbars.some(isCollapsed)).toBe(false)
			expect(getOffset(snackbars.at(-1)!)).toBe('0px')
			// The older ones are offset away from the anchored edge by the heights of the newer ones
			expect(getOffset(snackbars[0]!)).not.toBe('0px')
		})

		it('should keep the snack-bars laid out in full and collapse only the ones past them', async () => {
			const snackbars = await createSnackbars(SnackbarStackController.expandedCount + 1)
			const [oldest, ...laidOutInFull] = snackbars

			expect(laidOutInFull.length).toBe(SnackbarStackController.expandedCount)
			expect(laidOutInFull.some(isCollapsed)).toBe(false)
			expect(laidOutInFull.every(snackbar => getSurface(snackbar).style.getPropertyValue('--mo-snackbar-scale') === '1')).toBe(true)
			expect(isCollapsed(oldest!)).toBe(true)
		})

		it('should collapse the oldest snack-bar behind the last one laid out in full', async () => {
			const snackbars = await createSnackbars(SnackbarStackController.expandedCount + 1)
			const [oldest] = snackbars
			const base = snackbars[1]!

			expect(parseFloat(getOffset(oldest!))).toBeLessThan(parseFloat(getOffset(base)))
			expect(parseFloat(getSurface(oldest!).style.getPropertyValue('--mo-snackbar-scale'))).toBeLessThan(1)
			// Clamped to the size of the snack-bar the stack is based on
			expect(getSurface(oldest!).style.height).toBe(`${getSurface(base).offsetHeight}px`)
		})

		it('should drive the surface transform and fade the content out of a collapsed snack-bar', async () => {
			const snackbars = await createSnackbars(SnackbarStackController.expandedCount + 1)
			// Awaited out, as computed styles are interpolated while the snack-bars are still transitioning
			await new Promise(resolve => setTimeout(resolve, 400))
			const [collapsed] = snackbars
			const base = snackbars[1]!

			const matrixOf = (snackbar: Snackbar) => new DOMMatrix(getComputedStyle(getSurface(snackbar)).transform)
			const contentOpacityOf = (snackbar: Snackbar) => getComputedStyle(getSurface(snackbar).querySelector('.content')!).opacity

			expect(matrixOf(collapsed!).a).toBeLessThan(1)
			expect(matrixOf(collapsed!).f).toBeLessThan(matrixOf(base).f)
			expect(matrixOf(base).a).toBe(1)
			expect(contentOpacityOf(collapsed!)).toBe('0')
			expect(contentOpacityOf(base)).toBe('1')
		})

		it('should expand the whole stack while it is hovered', async () => {
			const snackbars = await createSnackbars(SnackbarStackController.expandedCount + 1)

			snackbars.at(-1)!.dispatchEvent(new PointerEvent('pointerenter'))
			await nextFrame()
			await nextFrame()

			expect(SnackbarStackController.expanded).toBe(true)
			expect(snackbars.some(isCollapsed)).toBe(false)

			snackbars.at(-1)!.dispatchEvent(new PointerEvent('pointerleave'))
			await new Promise(resolve => setTimeout(resolve, SnackbarStackController.collapseDelay + 100))
			await nextFrame()

			expect(SnackbarStackController.expanded).toBe(false)
			expect(isCollapsed(snackbars[0]!)).toBe(true)
		})

		it('should dismiss the oldest snack-bars once the maximum count is exceeded', async () => {
			const snackbars = await createSnackbars(SnackbarStackController.maxCount + 1)
			await new Promise(resolve => setTimeout(resolve, 400))

			expect(snackbars[0]!.open).toBe(false)
			expect(snackbars.slice(1).every(snackbar => snackbar.open)).toBe(true)
		})
	})
})