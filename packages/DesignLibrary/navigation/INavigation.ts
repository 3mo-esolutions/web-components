import { html, ifDefined, repeat, style, type HTMLTemplateResult } from '@a11d/lit'
import { routerLink, type RoutableComponent, NavigationStrategy } from '@a11d/lit-application'
import type { MaterialIcon } from '@3mo/icon'

type RouterLinkParameters = Exclude<Parameters<typeof routerLink>[0], RoutableComponent>

type NavigationTemplateOptions = {
	readonly slot?: string
	readonly navigationInvocationHandler?: () => void
	readonly iconHidden?: boolean
}

export interface INavigation {
	readonly hidden: boolean
	getItemTemplate(options?: NavigationTemplateOptions): HTMLTemplateResult
	getItemContentTemplate(open: boolean): HTMLTemplateResult
	getMenuItemTemplate(options?: NavigationTemplateOptions): HTMLTemplateResult
	getListItemTemplate(options?: NavigationTemplateOptions): HTMLTemplateResult
}

type NavigationOptions = {
	readonly label?: string | HTMLTemplateResult
	readonly icon?: MaterialIcon
	readonly hidden?: boolean
	readonly hasSeparator?: boolean
}

export class NavigationLink implements INavigation {
	constructor(readonly options: NavigationOptions & RouterLinkParameters) { }

	get label() {
		const value = this.options.label ?? label.get(this.options.component.constructor as Constructor<any>)
		const appendedEllipsis = (this.options.navigationStrategy ?? NavigationStrategy.Page) === NavigationStrategy.Page ? '' : '...'
		return [value, appendedEllipsis].filter(Boolean).join(' ')
	}

	get icon() { return this.options.icon }
	get hidden() { return this.options.hidden ?? false }
	get hasSeparator() { return this.options.hasSeparator }
	get routerLinkParameters() { return this.options as RouterLinkParameters }

	getItemTemplate(options?: NavigationTemplateOptions) {
		return this.hidden ? html.nothing : html`
			<mo-navigation-item .navigation=${this} ${this.routerLink(options?.navigationInvocationHandler)}>
				${this.label}
			</mo-navigation-item>
		`
	}

	getItemContentTemplate() {
		return html`<span>${this.label}</span>`
	}

	getMenuItemTemplate(options?: NavigationTemplateOptions) {
		return this.hidden ? html.nothing : html`
			${!this.hasSeparator ? html.nothing : html`<mo-line slot=${ifDefined(options?.slot)}></mo-line>`}
			<mo-navigation-menu-item slot=${ifDefined(options?.slot)} ${this.routerLink(options?.navigationInvocationHandler)}>
				${this.label}
			</mo-navigation-menu-item>
		`
	}

	getListItemTemplate(options?: NavigationTemplateOptions) {
		return this.hidden ? html.nothing : html`
			${!this.hasSeparator ? html.nothing : html`<mo-line slot=${ifDefined(options?.slot)}></mo-line>`}
			<mo-navigation-list-item slot=${ifDefined(options?.slot)} ${this.routerLink(options?.navigationInvocationHandler)}>
				${options?.iconHidden ? html.nothing : this.iconTemplate}
				${this.label}
			</mo-navigation-list-item>
		`
	}

	private get iconTemplate() {
		return !this.icon ? html.nothing : html`
			<mo-icon icon=${this.icon} style='opacity: 0.75; font-size: 24px'></mo-icon>
		`
	}

	private routerLink(invocationHandler?: () => void) {
		return routerLink({
			...this.routerLinkParameters,
			invocationHandler: () => {
				invocationHandler?.()
				this.routerLinkParameters.invocationHandler?.()
			}
		})
	}
}

export class NavigationGroup implements INavigation {
	constructor(readonly options: NavigationOptions & { readonly children: Array<INavigation> }) { }

	get label() { return this.options.label }
	get icon() { return this.options.icon }
	get hidden() { return this.options.hidden || !this.children.length || this.children.every(c => c.hidden) }
	get hasSeparator() { return this.options.hasSeparator }
	get children() { return this.options.children }

	getItemTemplate() {
		return this.hidden ? html.nothing : html`
			<mo-navigation-item .navigation=${this}>
				${this.label}
			</mo-navigation-item>
		`
	}

	getItemContentTemplate(open: boolean) {
		return html`
			<span>${this.label}</span>
			<mo-icon icon=${open ? 'keyboard_arrow_up' : 'keyboard_arrow_down'} ${style({ fontSize: 'large' })}></mo-icon>
		`
	}

	getMenuItemTemplate(options?: NavigationTemplateOptions) {
		return this.hidden ? html.nothing : html`
			${!this.hasSeparator ? html.nothing : html`<mo-line></mo-line>`}
			<mo-nested-menu-item slot=${ifDefined(options?.slot)}>
				${this.label}
				${repeat(this.children, c => c, child => child.getMenuItemTemplate({ ...options, slot: 'submenu' }))}
			</mo-nested-menu-item>
		`
	}

	getListItemTemplate(options?: NavigationTemplateOptions): HTMLTemplateResult {
		return this.hidden ? html.nothing : html`
			${!this.hasSeparator ? html.nothing : html`<mo-line slot=${ifDefined(options?.slot)}></mo-line>`}
			<mo-collapsible-list-item slot=${ifDefined(options?.slot)}>
				<mo-list-item>
					${!this.icon ? html.nothing : html`<mo-icon icon=${this.icon} style='opacity: 0.75; font-size: 24px'></mo-icon>`}
					${this.label}
				</mo-list-item>
				${this.children?.map(child => child.getListItemTemplate({ ...options, slot: 'details', iconHidden: true }))}
			</mo-collapsible-list-item>
		`
	}
}