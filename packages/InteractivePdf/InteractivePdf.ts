import { Component, component, html, css, property, queryAll, state, style, query } from '@a11d/lit'
import { tooltip } from '@3mo/tooltip'
import { Localizer } from '@3mo/localization'
import { Color } from '@3mo/color'
import { DocumentController } from './DocumentController.js'
import { FabricController, FabricMode } from './FabricController.js'

Localizer.dictionaries.add({
	de: {
		'Fit to window': 'An Fenster anpassen',
		'Zoom out': 'Herauszoomen',
		'Zoom in': 'Hineinzoomen',
		'Print': 'Drucken',
		'Download': 'Herunterladen',
	}
})

@component('mo-interactive-pdf')
export class InteractivePdf extends Component {
	@property() source!: string
	@property() name!: string
	@property({ type: Boolean }) overlayHidden = false

	@queryAll('.document') readonly documentNodes!: Array<HTMLCanvasElement>
	@queryAll('.fabric') readonly fabricNodes!: Array<HTMLCanvasElement>
	@query('#renderer') readonly rendererNode!: HTMLDivElement

	@state({
		updated(this: InteractivePdf, value: boolean) {
			if (!value) {
				this.requestUpdate('scale')
			}
		}
	}) fitWidth = true

	@state({
		updated(this: InteractivePdf, value: number) {
			this.documentNodes.forEach(documentNode => {
				documentNode.style.width = this.fitWidth
					? `${this.rendererNode.clientWidth}px`
					: `${+documentNode.dataset.width! * value / 100}px`
			})
		}
	}) private scale = 200

	@state() loading = true

	protected readonly documentController = new DocumentController(this)
	protected readonly fabricController = new FabricController(this)

	static override get styles() {
		return css`
			#container {
				position: relative;
				height: 100%;
				background-color: rgb(82, 86, 89);
			}

			#loader {
				position: absolute;
				top: 0;
				left: 0;
				width: 100%;
				height: 100%;
				z-index: 1000;
				background-color: rgba(255, 255, 255, 0.3);
			}

			#toolbar {
				width: 100%;
				flex-shrink: 0;
				height: 64px;
				padding: 0 32px;
				box-sizing: border-box;
				box-shadow: 0 4px 8px -4px rgb(0, 0, 0);
				background-color: rgb(67, 67, 67);
				color: white;

				#divider {
					width: 1px;
					height: 1.5rem;
					background-color: var(--mo-color-gray);
				}
			}

			#viewer {
				flex-grow: 1;

				#renderer {
					min-width: 100%;
					box-sizing: border-box;
					min-height: 100%;
					height: fit-content;

					#extraMargin {
						width: 100%;
						min-height: 1px;
						height: 1px;
					}
				}
			}

			.fabric, [data-fabric] {
				position: absolute !important;
				width: 100% !important;
				height: 100% !important;
				left: 0;
				top: 0;
			}

			input::-webkit-outer-spin-button,
			input::-webkit-inner-spin-button {
				-webkit-appearance: none;
				margin: 0;
			}

			input {
				width: 3.5rem;
				height: 1.5rem;
				font-size: 1rem;
				text-align: center;
				background-color: black;
				color: white;
				border: none;
				outline: none;
				-moz-appearance: textfield;

				&[disabled] {
					background-color: rgba(0, 0, 0, 0.3);
				}

				&[type=number] {
					width: 2.5rem;
				}
			}

			#fabricOverlay {
				position: absolute;
				top: 256px;
				right: 28px;
				z-index: 2;

				padding: 12px 6px;

				background-color: white;
				color: rgb(67, 67, 67);
				box-shadow: 0 4px 8px -4px rgb(0, 0, 0);

				border-radius: 32px;
			}

			#colorPicker {
				position: relative;

				margin: 12px 0 -12px 0;
				height: 36px;

				mo-color-picker {
					display: flex;
					justify-content: center;
					min-width: 20px;

					&::part(input) {
						width: 20px;
						height: 20px;
						border-radius: 100%;
					}
				}

				#brush {
					pointer-events: none;
					width: 24px;
					height: 24px;
					position: relative;
					top: -24px;
					left: calc(50% - 12px);
					z-index: 1000;
					border-radius: 32px;
				}
			}

			[icon=download] {
				margin-left: auto;
			}

			.documentOuter {
				position: relative;
				width: fit-content;
				max-height: 100%;
			}
		`
	}

	protected override get template() {
		return html`
			<mo-flex id='container'>
				${this.loadingTemplate}
				${this.toolbarTemplate}
				${this.viewerTemplate}
				${this.fabricOverlayTemplate}
			</mo-flex>
		`
	}

	protected get loadingTemplate() {
		return !this.loading ? html.nothing : html`
			<mo-flex id='loader' alignItems='center' justifyContent='center'>
				<mo-circular-progress></mo-circular-progress>
			</mo-flex>
		`
	}

	protected get toolbarTemplate() {
		return html`
			<mo-flex id='toolbar' direction='horizontal' alignItems='center' gap='12px'>
				<mo-icon-button icon='fit_screen'
					${style({ color: this.fitWidth ? 'var(--mo-color-accent)' : 'unset' })}
					${tooltip(t('Fit to window'))}
					?disabled=${this.loading}
					@click=${() => this.fitWidth = !this.fitWidth}
				></mo-icon-button>
				${this.scaleTemplate}
				<slot name='end'></slot>
			</mo-flex>
		`
	}

	private get scaleTemplate() {
		return html`
			<mo-icon-button icon='remove'
				${tooltip(t('Zoom out'))}
				${style({ color: this.scale <= 10 || this.fitWidth ? 'rgba(255, 255, 255, 0.4)' : 'unset', pointerEvents: this.scale <= 10 || this.fitWidth ? 'none' : 'unset' })}
				?disabled=${this.loading}
				@click=${() => this.scale -= 10}
			></mo-icon-button>
			<input
				?disabled=${this.fitWidth || this.loading}
				.value=${this.scale + '%'}
				@change=${this.onScaleChange}
			/>
			<mo-icon-button icon='add'
				${tooltip(t('Zoom in'))}
				${style({
					color: this.fitWidth ? 'rgba(255, 255, 255, 0.4)' : 'unset',
					pointerEvents: this.fitWidth ? 'none' : 'unset',
				})}
				?disabled=${this.loading}
				@click=${() => this.scale += 10}
			></mo-icon-button>
			<mo-icon-button icon='download'
				${tooltip(t('Download'))}
				?disabled=${this.loading}
				@click=${() => this.download()}
			></mo-icon-button>
			<mo-icon-button icon='print'
				${tooltip(t('Print'))}
				?disabled=${this.loading}
				@click=${() => this.print()}
			></mo-icon-button>
		`
	}

	private onScaleChange(e: InputEvent) {
		const scale = Math.max(parseInt((e.target as HTMLInputElement).value), 10)
		if (!isNaN(scale)) {
			this.scale = scale
		}
	}

	protected get viewerTemplate() {
		return html`
			<mo-scroller id='viewer' part='viewer'>
				<mo-flex id='renderer' gap='32px' alignItems='center' justifyContent='center'
					${style({ width: 'fit-content', padding: this.fitWidth ? '32px 0' : '32px 32px 0' })}
				>
					${new Array(this.documentController?.numberOfPages ?? 0).fill(undefined).map(() => html`
						<div class='documentOuter'>
							<canvas class='document' ${style({ maxWidth: !this.fitWidth ? 'unset' : '100%' })}></canvas>
							<canvas class='fabric'></canvas>
						</div>
					`)}
					<div id='extraMargin'></div>
				</mo-flex>
			</mo-scroller>
		`
	}

	protected get fabricOverlayTemplate() {
		const getStyles = (mode: FabricMode) => {
			return style({
				color: this.fabricController.mode === mode ? 'var(--mo-color-accent)' : undefined,
			})
		}

		return this.overlayHidden || this.loading ? html.nothing : html`
			<mo-flex id='fabricOverlay' gap='var(--mo-thickness-xl)'>
				<mo-icon-button icon='gesture' ${getStyles(FabricMode.Brush)}
					@click=${() => this.fabricController.setMode(FabricMode.Brush)}
				></mo-icon-button>
				<mo-icon-button icon='title' ${getStyles(FabricMode.Text)}
					@click=${() => this.fabricController.setMode(FabricMode.Text)}
				></mo-icon-button>
				<mo-icon-button icon='image' ${getStyles(FabricMode.Picture)}
				@click=${() => this.fabricController.setMode(FabricMode.Picture)}
				></mo-icon-button>
				<div id='colorPicker'>
					<mo-color-picker
						.value=${new Color(this.fabricController.brush.color)}
						@input=${(e: CustomEvent<Color>) => this.fabricController.setCurrentColor(e.detail.hex)}
					></mo-color-picker>
					<div id='brush' ${style({ backgroundColor: this.fabricController.brush.color })}></div>
				</div>
			</mo-flex>
		`
	}

	private async toObjectUrl() {
		this.loading = true
		const arrayBuffer = await this.documentController.fetchNatively()
		if (!arrayBuffer) {
			return
		}
		const binary = await this.documentController.mergeWithFiber(arrayBuffer)
		const objectUrl = URL.createObjectURL(binary)
		this.loading = false
		return objectUrl
	}

	private async download() {
		const url = await this.toObjectUrl()
		if (!url) {
			return
		}
		const linkNode = document.createElement('a')
		linkNode.href = url
		linkNode.download = this.name
		linkNode.click()
		URL.revokeObjectURL(url)
	}

	private async print() {
		const url = await this.toObjectUrl()
		if (!url) {
			return
		}
		const popup = window.open(url);
		popup?.addEventListener('load', () => popup.print())
	}
}

declare global {
	interface HTMLElementTagNameMap {
		'mo-interactive-pdf': InteractivePdf
	}
}