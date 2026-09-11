import { AsyncDirective, Controller, directive, isServer, noChange, PartType, type DirectiveResult, type ElementPart, type PartInfo, type ReactiveControllerHost } from '@a11d/lit'

export interface ContentVisibilityControllerOptions {
	/** The block size an item stands in at until it has been rendered once. Only read where the item is sized by its content. */
	readonly estimatedItemBlockSize?: string
	/** The same for the inline axis, the one a horizontal strip is scrolled along. */
	readonly estimatedItemInlineSize?: string
	/** Suspends the controller as long as this is `true`. */
	readonly disabled?: boolean
	/** Called as the engine starts or stops skipping an item, for the work it cannot skip by itself - a canvas, a subscription. */
	handleSkippedChange?(element: HTMLElement, skipped: boolean): void
}

/**
 * Lets the engine skip style, layout and paint of the items away from the viewport, while every item
 * stays in the DOM and keeps its place. An item must size only itself and must never subgrid, as
 * skipping contains its layout.
 *
 * ```ts
 * readonly contentVisibility = new ContentVisibilityController(this, { estimatedItemBlockSize: '40px' })
 *
 * html`<my-item ${this.contentVisibility.item()}></my-item>`
 * ```
 */
export class ContentVisibilityController<THost extends ReactiveControllerHost = ReactiveControllerHost> extends Controller {
	/** Whether the engine can skip rendering at all. */
	static readonly isSupported = isServer === false && CSS.supports('content-visibility', 'auto')

	private static readonly noItems: ReadonlySet<HTMLElement> = new Set()

	protected readonly options: ContentVisibilityControllerOptions

	constructor(
		protected override readonly host: THost,
		options: ContentVisibilityControllerOptions | ((host: THost) => ContentVisibilityControllerOptions)
	) {
		super(host)
		this.options = typeof options === 'function' ? options(host) : options
	}

	private readonly items = new Set<HTMLElement>()
	private readonly skipped = new Set<HTMLElement>()

	/** The items whose rendering the engine is currently skipping - none while disabled. */
	get skippedItems(): ReadonlySet<HTMLElement> { return this.isEnabled ? this.skipped : ContentVisibilityController.noItems }

	/** Declares the items of an owner which does not render them itself, replacing those declared before. */
	sync(items: Iterable<HTMLElement>) {
		const next = new Set(items)
		for (const item of this.items) {
			if (next.has(item) === false) {
				this.unregister(item)
			}
		}
		for (const item of next) {
			this.register(item)
		}
	}

	override hostUpdated() {
		// An owner's update must not become a walk over every item.
		if (this.applied !== this.declaration) {
			for (const element of this.items) {
				this.apply(element)
			}
		}
	}

	private register(element: HTMLElement) {
		this.items.add(element)
		element.addEventListener('contentvisibilityautostatechange', this.handleStateChange)
		this.apply(element)
	}

	private unregister(element: HTMLElement) {
		this.items.delete(element)
		this.skipped.delete(element)
		element.removeEventListener('contentvisibilityautostatechange', this.handleStateChange)
		element.style.removeProperty('content-visibility')
		element.style.removeProperty('contain-intrinsic-block-size')
		element.style.removeProperty('contain-intrinsic-inline-size')
	}

	private applied?: string

	private get isEnabled() {
		return ContentVisibilityController.isSupported && this.options.disabled !== true
	}

	private get estimates() {
		return [
			['contain-intrinsic-block-size', this.options.estimatedItemBlockSize],
			['contain-intrinsic-inline-size', this.options.estimatedItemInlineSize],
		] as const
	}

	private get declaration() {
		return !this.isEnabled ? '' : this.estimates.map(([property, size]) => `${property}:${size ?? ''}`).join(';')
	}

	private apply(element: HTMLElement) {
		const isEnabled = this.isEnabled
		this.applied = this.declaration
		for (const [property, size] of this.estimates) {
			if (isEnabled && size) {
				element.style.setProperty(property, `auto ${size}`)
			} else {
				element.style.removeProperty(property)
			}
		}
		if (isEnabled) {
			element.style.setProperty('content-visibility', 'auto')
		} else {
			element.style.removeProperty('content-visibility')
		}
	}

	private setSkipped(element: HTMLElement, skipped: boolean) {
		if (this.skipped.has(element) === skipped) {
			return
		}
		if (skipped) {
			this.skipped.add(element)
		} else {
			this.skipped.delete(element)
		}
		this.options.handleSkippedChange?.(element, skipped)
	}

	private readonly handleStateChange = (event: Event) => {
		const { skipped } = event as ContentVisibilityAutoStateChangeEvent
		this.setSkipped(event.currentTarget as HTMLElement, skipped)
	}

	// Memoised, as lit identifies a directive by its class.
	private _item?: () => DirectiveResult
	get item() {
		const controller = this
		return this._item ??= directive(class extends AsyncDirective {
			// Public, as a directive class is part of the emitted declaration.
			part?: ElementPart

			constructor(partInfo: PartInfo) {
				super(partInfo)
				if (partInfo.type !== PartType.ELEMENT) {
					throw new Error('This directive can only be used on an element')
				}
			}

			override render() {
				return noChange
			}

			override update(part: ElementPart) {
				this.part = part
				controller.register(part.element as HTMLElement)
				return noChange
			}

			override disconnected() {
				controller.unregister(this.part!.element as HTMLElement)
			}

			override reconnected() {
				controller.register(this.part!.element as HTMLElement)
			}
		}) as () => DirectiveResult
	}
}