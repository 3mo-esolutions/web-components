import { ComponentTestFixture } from '@a11d/lit-testing'
import { NotificationType, type Notification } from '@a11d/lit-application'
import { Snackbar, SnackbarStackController } from './index.js'

describe('Snackbar', () => {
	const fixture = new ComponentTestFixture(() => new Snackbar)

	const settle = async () => {
		for (let index = 0; index < 20; index++) {
			await Promise.resolve()
		}
	}

	const show = async (snackbar: Snackbar, notification?: Notification) => {
		snackbar.notification = notification ?? snackbar.notification ?? { message: 'Test' }
		const shown = snackbar.show()
		await snackbar.updateComplete
		await settle()
		await snackbar.updateComplete
		return { shown }
	}

	const getSurface = (snackbar: Snackbar) => snackbar.renderRoot.querySelector<HTMLElement>('[part=surface]')!
	const isCollapsed = (snackbar: Snackbar) => getSurface(snackbar).hasAttribute('data-collapsed')
	const getOffset = (snackbar: Snackbar) => getSurface(snackbar).style.getPropertyValue('--mo-snackbar-y')

	const nextLayoutPass = () => new Promise<void>(resolve => {
		requestAnimationFrame(() => resolve())
		setTimeout(resolve, 150)
	})

	const finishAnimations = (...snackbars: Array<Snackbar>) => {
		for (const snackbar of snackbars) {
			for (const animation of getSurface(snackbar).getAnimations({ subtree: true })) {
				try {
					animation.finish()
				} catch {
					// Ignore
				}
			}
		}
	}

	afterEach(async () => {
		for (const snackbar of [...document.querySelectorAll('mo-snackbar')]) {
			// The expansion is STATIC state shared by every snack-bar, so a stack left hovered or focused
			// would lay the next test's stack out in full.
			snackbar.dispatchEvent(new PointerEvent('pointerleave'))
			snackbar.dispatchEvent(new FocusEvent('focusout'))
			snackbar.close()
		}
		await new Promise(resolve => setTimeout(resolve, 10))
		for (const snackbar of [...document.querySelectorAll('mo-snackbar')]) {
			snackbar.remove()
		}
		for (let attempt = 0; SnackbarStackController.expanded && attempt < 50; attempt++) {
			await new Promise(resolve => setTimeout(resolve, 20))
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

	it('should use a status role for informational notifications', async () => {
		await show(fixture.component, { message: 'Saved', type: NotificationType.Info })

		expect(getSurface(fixture.component).getAttribute('role')).toBe('status')
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
		await nextLayoutPass()
		finishAnimations(fixture.component)

		expect(fixture.component.open).toBe(true)
	})

	it('should render a progress bar while the auto-dismiss timer is running', async () => {
		await show(fixture.component, { message: 'Running out' })

		const progress = fixture.component.renderRoot.querySelector('mo-linear-progress')
		expect(progress).not.toBeNull()
		// Determinate — an indeterminate bar would say nothing about how much time is left
		expect(progress!.progress).toBeGreaterThan(0)
		expect(progress!.progress).toBeLessThan(1)
	})

	// The timer runs on setInterval and Date.now, so the clock owns it — the alternative is a
	// fifteen-second wait per case.
	describe('auto-dismissal', () => {
		beforeEach(() => {
			jasmine.clock().install()
			jasmine.clock().mockDate()
		})

		afterEach(() => jasmine.clock().uninstall())

		const start = async (snackbar: Snackbar, notification: Notification) => {
			snackbar.notification = notification
			const shown = snackbar.show()
			await snackbar.updateComplete
			await settle()
			expect(snackbar.open).toBe(true) // the timer is armed
			return { shown }
		}

		/** Lets the exit animation's timeout run out, so show() settles rather than staying pending —
		 * a show() still pending when the clock is uninstalled never settles at all. */
		const finish = async (shown: Promise<void>) => {
			jasmine.clock().tick(500)
			await settle()
			await shown
		}

		const durationByType = [
			[NotificationType.Info, 5_000],
			[NotificationType.Success, 5_000],
			[NotificationType.Warning, 10_000],
			[NotificationType.Error, 15_000],
		] as const

		for (const [type, duration] of durationByType) {
			it(`should dismiss itself after the duration of its notification type: ${type}`, async () => {
				const snackbar = fixture.component
				const { shown } = await start(snackbar, { message: 'Timed', type })

				jasmine.clock().tick(duration - 100)
				await settle()
				expect(snackbar.open).toBe(true)

				jasmine.clock().tick(100)
				await settle()

				expect(snackbar.open).toBe(false)
				await finish(shown)
			})
		}

		it('should extend the duration for each action so actionable snack-bars stay readable', async () => {
			const snackbar = fixture.component
			// Info's own five seconds, plus 2500 for each of the two actions
			const { shown } = await start(snackbar, {
				message: 'Deleted',
				type: NotificationType.Info,
				actions: [
					{ title: 'Undo', handleClick: () => void 0 },
					{ title: 'Details', handleClick: () => void 0 },
				],
			})

			jasmine.clock().tick(5_000)
			await settle()
			expect(snackbar.open).toBe(true) // the bare type duration would have dismissed it

			jasmine.clock().tick(5_000)
			await settle()

			expect(snackbar.open).toBe(false)
			await finish(shown)
		})

		it('should pause the auto-dismiss timer while the stack is expanded and resume when it collapses', async () => {
			const snackbar = fixture.component
			const { shown } = await start(snackbar, { message: 'Being read', type: NotificationType.Info })

			jasmine.clock().tick(2_000)
			snackbar.dispatchEvent(new PointerEvent('pointerenter'))
			expect(SnackbarStackController.expanded).toBe(true)

			jasmine.clock().tick(20_000) // far beyond the five seconds it had left
			await settle()
			expect(snackbar.open).toBe(true)

			snackbar.dispatchEvent(new PointerEvent('pointerleave'))
			jasmine.clock().tick(SnackbarStackController.collapseDelay)
			await settle()
			expect(SnackbarStackController.expanded).toBe(false)

			// The three seconds it was holding, and not a millisecond more
			jasmine.clock().tick(2_900)
			await settle()
			expect(snackbar.open).toBe(true)

			jasmine.clock().tick(100)
			await settle()

			expect(snackbar.open).toBe(false)
			await finish(shown)
		})
	})

	describe('stack', () => {
		beforeEach(async () => {
			await nextLayoutPass()
			jasmine.clock().install()
			jasmine.clock().mockDate()
		})

		afterEach(async () => {
			for (const snackbar of [...document.querySelectorAll('mo-snackbar')]) {
				snackbar.dispatchEvent(new PointerEvent('pointerleave'))
				snackbar.dispatchEvent(new FocusEvent('focusout'))
				snackbar.close()
			}
			await settle()
			jasmine.clock().tick(1_000)
			await settle()
			jasmine.clock().uninstall()
		})

		const layOut = async () => {
			jasmine.clock().tick(100)
			await settle()
		}

		const createSnackbars = async (count: number) => {
			const snackbars = new Array<Snackbar>()
			for (let index = 0; index < count; index++) {
				const snackbar = new Snackbar()
				document.body.appendChild(snackbar)
				snackbars.push(snackbar)
				await show(snackbar, { message: `Notification ${index}` })
				await layOut()
			}
			await layOut()
			return snackbars
		}

		it('should lay out as a list while no more snack-bars are open than are laid out in full', async () => {
			const snackbars = await createSnackbars(SnackbarStackController.expandedCount)

			expect(snackbars.some(isCollapsed)).toBe(false)
			expect(getOffset(snackbars.at(-1)!)).toBe('0px')
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
			finishAnimations(...snackbars)

			expect(parseFloat(getOffset(oldest!))).toBeLessThan(parseFloat(getOffset(base)))
			expect(parseFloat(getSurface(oldest!).style.getPropertyValue('--mo-snackbar-scale'))).toBeLessThan(1)
			// Clamped to the size of the snack-bar the stack is based on
			expect(getSurface(oldest!).style.height).toBe(`${getSurface(base).offsetHeight}px`)
		})

		it('should drive the surface transform and fade the content out of a collapsed snack-bar', async () => {
			const snackbars = await createSnackbars(SnackbarStackController.expandedCount + 1)
			finishAnimations(...snackbars)
			const [collapsed] = snackbars

			expect(isCollapsed(collapsed!)).toBe(true)
		})

		it('should expand the whole stack while it is hovered', async () => {
			const snackbars = await createSnackbars(SnackbarStackController.expandedCount + 1)

			snackbars.at(-1)!.dispatchEvent(new PointerEvent('pointerenter'))
			await layOut()

			expect(snackbars.length).toBe(SnackbarStackController.expandedCount + 1)
		})

		it('should expand the stack while any snack-bar contains focus', async () => {
			const snackbars = await createSnackbars(SnackbarStackController.expandedCount + 1)
			expect(isCollapsed(snackbars[0]!)).toBe(true)

			snackbars.at(-1)!.dispatchEvent(new FocusEvent('focusin'))
			await layOut()

			expect(SnackbarStackController.expanded).toBe(true)
			expect(snackbars.some(isCollapsed)).toBe(false)

			snackbars.at(-1)!.dispatchEvent(new FocusEvent('focusout'))
		})

		it('should dismiss the oldest snack-bars once the maximum count is exceeded', async () => {
			const snackbars = await createSnackbars(SnackbarStackController.maxCount + 1)
			await layOut()

			expect(snackbars[0]!.open).toBe(false)
			expect(snackbars.slice(1).every(snackbar => snackbar.open)).toBe(true)
		})

		it('should re-lay out the remaining snack-bars when one of them closes', async () => {
			const snackbars = await createSnackbars(SnackbarStackController.expandedCount)
			const oldest = snackbars[0]!
			const offsetBefore = parseFloat(getOffset(oldest))

			snackbars.at(-1)!.close()
			await settle()
			await layOut()
			finishAnimations(...snackbars)

			const front = snackbars[1]!
			expect(parseFloat(getOffset(oldest))).toBeGreaterThan(offsetBefore)
			expect(parseFloat(getOffset(oldest))).toBeCloseTo(-(getSurface(front).offsetHeight + SnackbarStackController.gap), 0)
		})
	})
})