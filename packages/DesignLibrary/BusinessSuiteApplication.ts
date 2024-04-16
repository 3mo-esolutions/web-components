import { css, html, property, style, type HTMLTemplateResult, ifDefined, query, repeat, bind } from '@a11d/lit'
import { Application, type PageComponent, PwaHelper, RouteMatchMode, routerLink } from '@a11d/lit-application'
import { Authentication } from '@a11d/lit-application-authentication'
import { Localizer } from '@3mo/localization'
import { PagePreferences, type Navigation, BusinessSuiteAuthenticationDialogComponent, type User } from './index.js'
import { observeResize } from '@3mo/resize-observer'
import { observeMutation } from '@3mo/mutation-observer'
import { Icon, IconVariant } from '@3mo/icon'

Icon.defaultVariant = IconVariant.Sharp

Localizer.register('de', {
	'User Settings': 'Benutzereinstellungen',
	'Close': 'Schließen',
	'Open as Popup': 'Als Popup öffnen',
	'Cancel': 'Abbrechen',
	'Expand': 'Erweitern',
	'Collapse': 'Reduzieren',
	'Loading': 'Lädt',
})

export abstract class BusinessSuiteApplication extends Application {
	@property({ type: Boolean }) drawerOpen = false
	@property({ type: Boolean, reflect: true }) mobileNavigation = false

	protected abstract get navigations(): Array<Navigation>

	constructor() {
		super()
		PwaHelper.registerServiceWorker('/ServiceWorker.js')
	}

	override connected() {
		BusinessSuiteAuthenticationDialogComponent.authenticatedUserStorage.changed.subscribe(() => this.requestUpdate())
	}

	static override get styles() {
		return css`
			@import 'https://fonts.googleapis.com/css2?family=Roboto:wght@400;500;700&display=swap';

			${super.styles}

			* {
				font-weight: 400;
				box-sizing: border-box;
			}

			:root {
				font-family: var(--mo-font-family);
				background-color: var(--mo-color-background);
				color: var(--mo-color-foreground);
				/* Thickness */
				--mo-thickness-s: 4px;
				--mo-thickness-m: 6px;
				--mo-thickness-l: 8px;
				--mo-thickness-xl: 14px;
			}

			[application][mobileNavigation] #navbarNavigations {
				visibility: hidden;
			}

			[application]:not([mobileNavigation]) mo-icon-button[icon=menu] {
				display: none;
			}

			mo-collapsible-list-item:has(mo-navigation-list-item[slot=details][data-router-selected])::part(summary) {
				color: color-mix(in srgb, var(--mo-color-accent), var(--mo-color-foreground) 25%);
			}

			mo-navigation-list-item[slot=details] {
				padding-inline-start: 56px;
				height: 40px;
				font-size: 0.875rem;
			}
		`
	}

	@query('#navbarNavigations') protected readonly navigationsContainer!: HTMLElement

	protected override get template() {
		return html`
			${super.template}
			<mo-confetti></mo-confetti>
		`
	}

	protected override get bodyTemplate() {
		return html`
			${this.drawerTemplate}
			${this.navbarTemplate}
			${super.bodyTemplate}
		`
	}

	protected get navbarTemplate() {
		return html`
			<mo-flex direction='horizontal' gap='32px' ${style({ background: 'var(--mo-color-accent)', paddingInlineStart: '4px', height: '48px', overflow: 'hidden' })}>
				<mo-flex direction='horizontal' alignItems='center' ${style({ color: 'var(--mo-color-on-accent)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' })}>
					${this.navbarStartTemplate}
				</mo-flex>

				<mo-flex id='navbarNavigations' direction='horizontal' alignItems='center' gap='8px'
					${style({ flex: '1', overflow: 'hidden', opacity: '0' })}
					${observeResize(() => this.checkNavigationOverflow())}
					${observeMutation(() => this.checkNavigationOverflow())}
				>
					${this.navbarNavigationTemplate}
				</mo-flex>

				<mo-flex direction='horizontal' alignItems='center' gap='8px'>
					${this.navbarTrailingTemplate}
				</mo-flex>
			</mo-flex>
		`
	}

	private async checkNavigationOverflow() {
		// As the items render using a "repeat" directive, they are not immediately available in the DOM sometimes.
		await new Promise(resolve => setTimeout(resolve))

		const lastNavigationItem = this.navigationsContainer.style.flexDirection === 'row-reverse'
			? this.navigationsContainer.firstElementChild
			: this.navigationsContainer.lastElementChild

		const firstNavigationItem = this.navigationsContainer.style.flexDirection === 'row-reverse'
			? this.navigationsContainer.lastElementChild
			: this.navigationsContainer.firstElementChild

		const scrollWidth = (lastNavigationItem?.getBoundingClientRect().right ?? 0) - (firstNavigationItem?.getBoundingClientRect().left ?? 0)
		this.mobileNavigation = this.navigationsContainer.clientWidth < scrollWidth

		this.navigationsContainer.style.opacity = '1'
	}

	protected get navbarStartTemplate() {
		return html`
			${this.navbarMenuTemplate}
			${this.navbarLogoTemplate}
			${this.navbarHeadingTemplate}
		`
	}

	protected get navbarMenuTemplate() {
		return html`
			<mo-icon-button icon='menu'
				${style({ fontSize: '20px' })}
				@click=${() => this.drawerOpen = !this.drawerOpen}
			></mo-icon-button>
		`
	}

	protected get navbarLogoTemplate() {
		return html`
			<mo-application-logo ${style({ height: '30px', margin: '0 0 0 var(--mo-thickness-xl)' })}></mo-application-logo>
		`
	}

	protected get navbarHeadingTemplate() {
		return html`
			<span ${style({ margin: '2px 0 0 8px', fontSize: '23px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' })}>
				${manifest?.short_name}
			</span>
		`
	}

	protected get navbarNavigationTemplate() {
		return html`
			${repeat(this.navigations, n => n.key ?? n, navigation => this.getNavigationItemTemplate(navigation))}
		`
	}

	protected getNavigationItemTemplate(navigation: Navigation) {
		return navigation.hidden ? html.nothing : html`
			<mo-navigation-item .navigation=${navigation} ${!navigation.component ? html.nothing : routerLink({
				component: navigation.component as PageComponent,
				matchMode: navigation.matchMode,
				invocationHandler: () => this.drawerOpen = false
			})}>${navigation.label}</mo-navigation-item>
		`
	}

	protected get navbarTrailingTemplate() {
		return html`
			${this.userAvatarTemplate}
		`
	}

	protected get userAvatarTemplate() {
		return !Authentication.hasAuthenticator() ? html.nothing : html`
			<mo-user-avatar
				name=${ifDefined((BusinessSuiteAuthenticationDialogComponent.authenticatedUserStorage.value as User)?.name)}
				email=${ifDefined((BusinessSuiteAuthenticationDialogComponent.authenticatedUserStorage.value as User)?.email)}
				style='color: var(--mo-color-on-accent); margin-inline-end: var(--mo-thickness-xl)'
				@openChange=${(e: CustomEvent<boolean>) => this.handleUserAvatarOpenChange(e.detail)}
			>
				${this.userAvatarMenuItemsTemplate}
			</mo-user-avatar>
		`
	}

	private handleUserAvatarOpenChange(open: boolean) {
		if (open === false) {
			this.drawerOpen = false
		}
	}

	protected get userAvatarMenuItemsTemplate() {
		return html`
			<mo-navigation-menu-item icon='manage_accounts'
				${routerLink({ component: new PagePreferences, matchMode: RouteMatchMode.IgnoreParameters })}
			>${t('User Settings')}</mo-navigation-menu-item>
		`
	}

	protected get drawerTemplate() {
		return html`
			<mo-drawer ?open=${bind(this, 'drawerOpen')}>
				<mo-flex ${style({ height: '100%' })}>
					${this.drawerTitleTemplate}

					<mo-list ${style({ flex: '1' })}>
						${this.drawerContentTemplate}
					</mo-list>

					<mo-list>
						${this.drawerFooterTemplate}
					</mo-list>
				</mo-flex>
			</mo-drawer>
		`
	}

	protected get drawerContentTemplate() {
		return html`${this.navigations.map(navigation => this.getNavigationListItemTemplate(navigation))}`
	}

	private getNavigationListItemTemplate(navigation: Navigation, detailsSlot = false): HTMLTemplateResult {
		if (navigation.hidden) {
			return html.nothing
		}

		const iconTemplate = !navigation.icon ? html.nothing : html`
			<mo-icon icon=${navigation.icon} style='opacity: 0.75; font-size: 24px'></mo-icon>
		`

		const contentTemplate = html`
			${iconTemplate}
			${navigation.label}
		`

		const separatorTemplate = !navigation.hasSeparator ? html.nothing : html`<mo-line slot=${ifDefined(detailsSlot ? 'details' : undefined)}></mo-line>`

		if (navigation.children?.length) {
			return html`
				${separatorTemplate}
				<mo-collapsible-list-item slot=${ifDefined(detailsSlot ? 'details' : undefined)}>
					<mo-list-item>
						${contentTemplate}
					</mo-list-item>
					${navigation.children?.map(child => this.getNavigationListItemTemplate(child, true))}
				</mo-collapsible-list-item>
			`
		}

		return html`
			${separatorTemplate}
			<mo-navigation-list-item
				slot=${ifDefined(detailsSlot ? 'details' : undefined)}
				${!navigation.component ? html.nothing : routerLink({ component: navigation.component as PageComponent, matchMode: RouteMatchMode.IgnoreParameters, invocationHandler: () => this.drawerOpen = false })}
			>
				${contentTemplate}
			</mo-navigation-list-item>
		`
	}

	protected get drawerTitleTemplate() {
		return html`
			<mo-flex direction='horizontal' alignItems='center' style='padding: 24px'>
				${this.navbarHeadingTemplate}
			</mo-flex>
		`
	}

	protected get drawerFooterTemplate() {
		return html.nothing
	}
}