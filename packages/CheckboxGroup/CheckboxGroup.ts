import { component, property, css, html, style, eventListener } from '@a11d/lit'
import { Checkbox } from '@3mo/checkbox'
import type { Flex } from '@3mo/flex'

/**
 * @element mo-checkbox-group
 *
 * @attr direction
 */
@component('mo-checkbox-group')
export class CheckboxGroup extends Checkbox {
	@property() direction: Flex['direction'] = 'vertical'

	protected get checkboxes() {
		return [...this.children].filter((child): child is Checkbox => child instanceof Checkbox)
	}

	private get childrenSelected(): CheckboxSelection {
		if (this.checkboxes.every(e => e.selected === true)) {
			return true
		} else if (this.checkboxes.every(e => e.selected === false)) {
			return false
		} else {
			return 'indeterminate'
		}
	}

	private set childrenSelected(selected: CheckboxSelection) {
		if (selected === 'indeterminate') {
			return
		}

		this.checkboxes.forEach(checkbox => {
			if (checkbox.selected !== selected) {
				checkbox.selected = selected
				checkbox.change.dispatch(selected)
			}
		})
	}

	@eventListener('change')
	protected changed = () => this.childrenSelected = this.selected

	static override get styles() {
		return css`
			${super.styles}

			:host {
				--mo-checkbox-group-nested-margin: 32px;
			}

			::slotted(*) {
				margin-inline-start: var(--mo-checkbox-group-nested-margin);
			}
		`
	}

	protected override get template() {
		return html`
			<mo-flex>
				${super.template}
				<mo-flex direction=${this.direction} ${style({ height: '*' })}>
					<slot @slotchange=${() => this.handleSlotChange()}></slot>
				</mo-flex>
			</mo-flex>
		`
	}

	private readonly handleSlotChange = () => {
		const updateValue = () => {
			const selected = this.childrenSelected
			if (selected !== this.selected) {
				this.selected = selected
				this.change.dispatch(selected)
			}
		}

		updateValue()
		this.checkboxes.forEach(checkbox => checkbox.change.subscribe(updateValue))
	}
}

declare global {
	interface HTMLElementTagNameMap {
		'mo-checkbox-group': CheckboxGroup
	}
}