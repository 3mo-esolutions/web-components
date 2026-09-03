import { html } from '@a11d/lit'
import { ComponentTestFixture } from '@a11d/lit-testing'
import { Authentication } from '@a11d/lit-application-authentication'
import { type Menu } from '@3mo/menu'
import '@3mo/popover'
import '@3mo/line'
import '@3mo/icon-button'
import '@3mo/flex'
import './Avatar.js'
import { type UserAvatar } from './UserAvatar.js'

class TestAuthenticator {
	confirm() { return Promise.resolve({}) }
	unauthenticate() { return Promise.resolve() }
}

const waitUntil = async (predicate: () => boolean, timeout = 2000) => {
	const start = performance.now()
	while (predicate() === false && performance.now() - start < timeout) {
		await new Promise(resolve => setTimeout(resolve, 20))
	}
	return predicate()
}

describe('UserAvatar', () => {
	const fixture = new ComponentTestFixture<UserAvatar>(html`
		<mo-user-avatar name='John Doe' email='john.doe@example.com'></mo-user-avatar>
	`)

	let authenticatorBeforeTest: Constructor<any> | undefined
	beforeEach(() => authenticatorBeforeTest = Authentication.AuthenticatorConstructor)
	afterEach(() => Authentication.AuthenticatorConstructor = authenticatorBeforeTest)

	const query = <T extends HTMLElement>(selector: string) => fixture.component.renderRoot.querySelector<T>(selector)
	const menu = () => query<Menu>('mo-menu')!
	const avatar = () => query('#avatar')!
	const accountButton = () => query('#avatar mo-icon-button[icon=account_circle]')
	const signOutItem = () => query('mo-menu-item[icon=exit_to_app]')
	const headerTexts = () => [...fixture.component.renderRoot.querySelectorAll('mo-menu span')].map(span => span.textContent?.trim())

	describe('initials', () => {
		for (const [name, initials] of [['John Doe', 'JD'], ['John', 'J'], ['John Michael Doe', 'JD']] as const) {
			it(`should display the initials of the first and last words of the name ("${name}" → "${initials}")`, async () => {
				fixture.component.name = name

				await fixture.updateComplete

				expect(avatar().textContent?.trim()).toBe(initials)
			})
		}

		it('should display an account icon-button instead of initials when no name is set', async () => {
			fixture.component.name = undefined

			await fixture.updateComplete

			expect(accountButton()).not.toBeNull()
			expect(avatar().textContent?.trim()).toBe('')
		})
	})

	describe('menu', () => {
		it('should open the menu when the avatar is clicked', async () => {
			const menuElement = menu()
			await new Promise(resolve => setTimeout(resolve, 50))

			avatar().click()

			expect(await waitUntil(() => menuElement.open)).toBeTrue()
		})

		it('should reflect the open property and dispatch openChange when the menu toggles', async () => {
			const openChange = jasmine.createSpy('openChange')
			fixture.component.addEventListener<any>('openChange', (e: CustomEvent<boolean>) => openChange(e.detail))

			menu().setOpen(true)
			await fixture.updateComplete
			await new Promise(resolve => setTimeout(resolve, 50))

			expect(fixture.component.open).toBeTrue()
			expect(fixture.component.hasAttribute('open')).toBeTrue()
			expect(openChange).toHaveBeenCalledOnceWith(true)
		})

		it('should render the user\'s name and email in the menu header', () => {
			expect(headerTexts()).toEqual(['John Doe', 'john.doe@example.com'])
		})

		it('should omit the email row when no email is set', async () => {
			fixture.component.email = undefined

			await fixture.updateComplete

			expect(headerTexts()).toEqual(['John Doe'])
		})

		it('should separate the header, slotted content and sign-out sections with lines', async () => {
			Authentication.AuthenticatorConstructor = TestAuthenticator as any

			await fixture.update()

			expect(fixture.component.renderRoot.querySelectorAll('mo-menu > mo-line').length).toBe(2)
		})
	})

	describe('authentication', () => {
		for (const hasAuthenticator of [true, false]) {
			for (const hasName of [true, false]) {
				it(`should render the sign-out item only when an authenticator is registered and initials are available (authenticator: ${hasAuthenticator}, name: ${hasName})`, async () => {
					Authentication.AuthenticatorConstructor = hasAuthenticator ? TestAuthenticator as any : undefined
					fixture.component.name = hasName ? 'John Doe' : undefined

					await fixture.update()

					expect(!!signOutItem()).toBe(hasAuthenticator && hasName)
				})
			}
		}

		it('should unauthenticate when the sign-out item is clicked', async () => {
			const unauthenticate = spyOn(Authentication, 'unauthenticate').and.resolveTo()
			Authentication.AuthenticatorConstructor = TestAuthenticator as any
			await fixture.update()

			signOutItem()!.click()

			expect(unauthenticate).toHaveBeenCalledTimes(1)
		})

		it('should trigger global authentication when the account icon-button is clicked', async () => {
			const authenticateGlobally = spyOn(Authentication, 'authenticateGloballyIfAvailable').and.resolveTo()
			fixture.component.name = undefined
			await fixture.updateComplete

			accountButton()!.click()

			expect(authenticateGlobally).toHaveBeenCalledTimes(1)
		})
	})
})