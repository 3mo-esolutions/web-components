import { component, css, property, eventListener } from '@a11d/lit'
import { PopoverController, PopoverComponent } from '@3mo/popover'
import { TooltipPlacement } from './TooltipPlacement.js'

@component('mo-tooltip')
export class Tooltip extends PopoverComponent {
	private static readonly instancesContainer = new Set<Tooltip>()
	private static openInstance?: Tooltip

	@property({ reflect: true }) override placement = TooltipPlacement.Bottom

	@property({ type: Boolean, reflect: true }) protected rich = false

	protected readonly popoverController: PopoverController = new PopoverController(this, {
		openOnFocus: true,
		openOnHover: true,
		handleOpen: () => {
			if (this.open) {
				Tooltip.openInstance = this
			}

			for (const tooltip of [...Tooltip.instancesContainer.values()].filter(t => t !== this)) {
				tooltip.open = Tooltip.openInstance === tooltip
			}
		}
	})

	protected override connected() {
		Tooltip.instancesContainer.add(this)
	}

	protected override disconnected() {
		Tooltip.instancesContainer.delete(this)
	}

	static override get styles() {
		return css`
			${super.styles}

			:host {
				border-radius: var(--mo-toolbar-border-radius, var(--mo-border-radius, 4px));
			}

			:host(:not([rich])) {
				background: var(--mo-tooltip-surface-color, var(--mo-color-surface, rgba(255, 255, 255, 0.75)));
				backdrop-filter: blur(40px);
				color: var(--mo-color-foreground);
				box-shadow: var(--mo-tooltip-shadow, var(--mo-shadow-deep, 0px 5px 5px -3px rgba(95, 81, 78, 0.2), 0px 8px 10px 1px rgba(95, 81, 78, 0.14), 0px 3px 14px 2px rgba(95, 81, 78, 0.12)));
				padding: 8px;
			}
		`
	}

	@eventListener('slotchange')
	protected handleSlotChange() {
		this.rich = this.childElementCount > 0
	}
}

declare global {
	interface HTMLElementTagNameMap {
		'mo-tooltip': Tooltip
	}
}