import { component, ReactiveElement } from '@a11d/lit'
import { NotificationComponent } from '@a11d/lit-application'
import { BusinessSuiteAuthenticationDialogComponent, type User } from './BusinessSuiteAuthenticationDialogComponent.js'

const account: User = { name: 'John Doe', email: 'john.doe@example.com' }

@component('test-business-suite-authentication-dialog-component')
class TestAuthenticationDialogComponent extends BusinessSuiteAuthenticationDialogComponent {
	authenticatedAccount: User | undefined = account
	passwordResetError?: Error

	protected override requestPasswordReset() {
		return this.passwordResetError ? Promise.reject(this.passwordResetError) : Promise.resolve()
	}

	protected override authenticateAccount() {
		this.authenticatedAccount = account
		return Promise.resolve(this.authenticatedAccount)
	}

	protected override unauthenticateAccount() {
		this.authenticatedAccount = undefined
		return Promise.resolve()
	}

	protected override getAuthenticatedAccount() {
		return Promise.resolve(this.authenticatedAccount)
	}
}

class TestStorageObserver extends ReactiveElement { }
customElements.define('test-authenticated-user-storage-observer', TestStorageObserver)

describe('BusinessSuiteAuthenticationDialogComponent', () => {
	const storage = BusinessSuiteAuthenticationDialogComponent.authenticatedUserStorage

	let component: TestAuthenticationDialogComponent
	let storedUserBeforeTest: object | undefined

	beforeEach(() => {
		storedUserBeforeTest = storage.value
		component = new TestAuthenticationDialogComponent
		vi.spyOn(NotificationComponent, 'notifySuccess').mockResolvedValue()
	})

	afterEach(() => storage.value = storedUserBeforeTest)

	describe('authenticate', () => {
		it('should persist the authenticated user in the user storage', async () => {
			storage.value = undefined

			await component.authenticate()

			expect(storage.value).toEqual(account)
		})
	})

	describe('unauthenticate', () => {
		it('should clear the persisted user', async () => {
			storage.value = account
			vi.spyOn(component, 'confirm').mockResolvedValue(account)

			await component.unauthenticate()

			expect(storage.value).toBeUndefined()
		})
	})

	describe('resetPassword', () => {
		it('should notify with an info message once the reset request succeeds', async () => {
			const notifyInfo = vi.spyOn(NotificationComponent, 'notifyInfo').mockResolvedValue()

			await component.resetPassword()

			expect(notifyInfo).toHaveBeenCalledTimes(1)
			expect(String(notifyInfo.mock.lastCall![0]))
				.toBe(String(t('Password reset instructions have been sent to your email address')))
		})

		it('should notify the error message and rethrow when the reset request fails', async () => {
			const notifyError = vi.spyOn(NotificationComponent, 'notifyError').mockResolvedValue()
			component.passwordResetError = new Error('The mail server is unreachable')

			await expect(component.resetPassword()).rejects.toThrow('The mail server is unreachable')

			expect(notifyError).toHaveBeenCalledExactlyOnceWith('The mail server is unreachable')
		})
	})

	describe('authenticated user storage', () => {
		let observer: TestStorageObserver | undefined
		afterEach(() => observer?.remove())

		it('should trigger an update of connected components when the stored user changes', async () => {
			observer = new TestStorageObserver
			document.body.appendChild(observer)
			await observer.updateComplete
			const requestUpdate = vi.spyOn(observer, 'requestUpdate').mockReturnValue(undefined)

			storage.value = { name: 'Jane Doe' }

			expect(requestUpdate).toHaveBeenCalled()
		})
	})
})