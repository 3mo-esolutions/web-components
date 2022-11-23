import { component, property, css, html, style, eventListener } from '@a11d/lit'
import { Checkbox } from '@3mo/checkbox'
import { observeMutation } from '@3mo/mutation-observer'
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

	private get childrenValue(): CheckboxValue {
		if (this.checkboxes.every(e => e.value === 'checked')) {
			return 'checked'
		} else if (this.checkboxes.every(e => e.value === 'unchecked')) {
			return 'unchecked'
		} else {
			return 'indeterminate'
		}
	}

	private set childrenValue(value: CheckboxValue) {
		if (value === 'indeterminate') {
			return
		}

		this.checkboxes.forEach(checkbox => {
			if (checkbox.value !== value) {
				checkbox.value = value
				checkbox.change.dispatch(value)
			}
		})
	}

	@eventListener('change')
	protected changed = () => this.childrenValue = this.value

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
					<slot ${observeMutation(this.handleSlotChange)}></slot>
				</mo-flex>
			</mo-flex>
		`
	}

	private readonly handleSlotChange = () => {
		const updateValue = () => {
			const value = this.childrenValue
			if (value !== this.value) {
				this.value = value
				this.change.dispatch(value)
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