import { Directive, directive, noChange, PartType, type ElementPart, type PartInfo } from '@a11d/lit'
import { type INavigation, type NavigationInvocationOptions } from './INavigation.js'

/** Stands in for an application's router: the element it is applied to reports being invoked. */
class FakeLinkDirective extends Directive {
	private options?: NavigationInvocationOptions

	constructor(partInfo: PartInfo) {
		super(partInfo)
		if (partInfo.type !== PartType.ELEMENT) {
			throw new Error('fakeLink can only be used on an element')
		}
		;(partInfo as ElementPart).element.addEventListener('click', () => this.options?.invocationHandler?.())
	}

	render(options?: NavigationInvocationOptions) {
		this.options = options
		return noChange
	}
}

const fakeLink = directive(FakeLinkDirective)

export const fakeNavigation = (label: string, rest?: Partial<INavigation>): INavigation => ({ label, ...rest })

/** A navigation whose invocation is observable, without an application to navigate in. */
export const fakeNavigationLink = (label: string, rest?: Partial<INavigation>): INavigation => ({
	label,
	link: options => fakeLink(options),
	...rest,
})