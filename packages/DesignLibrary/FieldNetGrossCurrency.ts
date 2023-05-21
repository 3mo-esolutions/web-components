import { component, css, html, ifDefined, live, property, style } from '@a11d/lit'
import { Currency } from '@3mo/localization'
import { InputFieldComponent } from '@3mo/field'

@component('mo-field-net-gross-currency')
export class FieldNetGrossCurrency extends InputFieldComponent<NetGrossCurrency> {
	@property({ type: Object }) value: NetGrossCurrency = [undefined, false]
	@property({ type: Boolean }) isGross = false
	@property({ type: Object }) currency = Currency.EUR
	@property() currencySymbol?: string

	protected valueToInputValue(value?: NetGrossCurrency) {
		this.isGross = value?.[1] ?? false
		return typeof value?.[0] === 'number' ? value[0].formatAsCurrency() : ''
	}

	protected toValue(value: string): NetGrossCurrency {
		return [
			value.toNumber(),
			this.isGross,
		]
	}

	protected override get inputTemplate() {
		return html`
			<input
				part='input'
				type='text'
				inputmode='decimal'
				?readonly=${this.readonly}
				?required=${this.required}
				?disabled=${this.disabled}
				.value=${live(this.inputStringValue || '')}
				@input=${(e: Event) => this.handleInput(this.toValue(this.inputElement.value), e)}
				@change=${(e: Event) => this.handleChange(this.toValue(this.inputElement.value), e)}
			>
		`
	}

	static override get styles() {
		return css`
			${super.styles}

			button {
				cursor: pointer;
				border: none;
				background: transparent;
				color: var(--mo-color-foreground);
				border-radius: var(--mo-border-radius)
			}

			button:hover {
				background: var(--mo-color-transparent-gray-3);
			}

			button[data-selected] {
				color: var(--mo-color-on-accent);
				background-color: var(--mo-color-accent);
			}
		`
	}

	protected override get endSlotTemplate() {
		return html`
			${this.currencyAndSwitcherTemplate}
			${super.endSlotTemplate}
		`
	}

	protected get currencyAndSwitcherTemplate() {
		return html`
			<mo-flex direction='horizontal' gap='4px' alignItems='center' slot='end'>
				<mo-flex gap='2px' direction=${ifDefined(this.dense ? 'horizontal' : undefined)}>
					<button tabindex='-1'
						?data-selected=${!this.isGross}
						@click=${() => this.setIsGross(false)}
					>N</button>

					<button tabindex='-1'
						?data-selected=${this.isGross}
						@click=${() => this.setIsGross(true)}
					>B</button>
				</mo-flex>

				<div ${style({ fontSize: 'x-large' })}>
					${this.currencySymbol ?? this.currency.symbol}
				</div>
			</mo-flex>
		`
	}

	protected setIsGross(value: boolean) {
		if (this.isGross !== value) {
			this.isGross = value
			this.handleChange(this.value)
		}
	}
}

declare global {
	type NetGrossCurrency = [amount: number | undefined, isGross: boolean]
	interface HTMLElementTagNameMap {
		'mo-field-net-gross-currency': FieldNetGrossCurrency
	}
}