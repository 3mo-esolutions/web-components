import { component, css, property } from '@a11d/lit'
import { FieldSearch } from '@3mo/text-fields'

@component('mo-command-palette-search-field')
export class CommandPaletteSearchField extends FieldSearch {
	@property({ type: Boolean, reflect: true }) fetching = false
	override label = ''

	protected override initialized() {
		this.inputElement.placeholder = t('Search')
	}

	static override get styles() {
		return css`
			[part=input] {
				padding: 0px;
				font-size: 20px;
			}

			mo-field {
				height: 50px;
				background: transparent;
				border-bottom: 1px solid var(--mo-color-transparent-gray-3) !important;
				&:after {
					visibility: hidden;
				}
			}

			mo-icon {
				--mo-color-accent: var(--mo-color-gray);
			}

			:host([fetching]) mo-field:after {
				visibility: visible;
				animation: fetching 2s linear infinite;
			}

			@keyframes fetching {
				0% {
					inset-inline-start: -40%;
					width: 0%;
				}
				50% {
					inset-inline-start: 20%;
					width: 80%;
				}
				100% {
					inset-inline-start: 100%;
					width: 100%;
				}
			}
		`
	}
}

declare global {
	interface HTMLElementTagNameMap {
		'mo-command-palette-search-field': CommandPaletteSearchField
	}
}