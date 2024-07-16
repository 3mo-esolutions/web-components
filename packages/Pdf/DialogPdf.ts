import { css, DialogComponent, html, state, ifDefined } from '@3mo/del'

export interface DialogPdfParameters<T> {
	readonly heading: string
	readonly type?: string
	readonly pathname?: string
	readonly pathKeyName?: string
	readonly fileId?: number
	readonly fileIds?: Array<number>
	readonly file?: T
	readonly files?: Array<T>
	readonly primaryButtonText?: string
}

interface IFile {
	id: number
	name: string
	type: string
}

export abstract class DialogPdf<TFile extends IFile, TParameters = {}> extends DialogComponent<DialogPdfParameters<TFile> & TParameters> {
	static readonly icon = 'picture_as_pdf'

	abstract fetch(id: number): Promise<TFile>

	@state() private files: Array<TFile> =
		[this.parameters.file, ...this.parameters.files ?? []].filter(file => file !== void 0)

	@state() private currentTabId?: number

	private get fileIds() {
		return typeof this.parameters.fileId === 'number'
			? [this.parameters.fileId]
			: this.parameters.fileIds ?? []
	}

	protected override initialized = async () => {
		if (this.fileIds?.length) {
			this.files = await Promise.all(this.fileIds.map(id => this.fetch(id)))
		}

		this.currentTabId = this.files[0]?.id
	}

	static override get styles() {
		return css`
			mo-dialog {
				--mo-dialog-height: 100vh;

				&::part(content) {
					padding: 0;
					overflow: hidden;
				}
			}

			#container {
				height: 100vh;
				overflow: hidden;
			}

			mo-tab-bar {
				width: 100%;
				position: sticky;
				top: 0;
				z-index: 2;
				background-color: var(--mo-color-surface);
			}

			#viewer {
				flex-grow: 1;
				height: 100vh;
			}

			mo-pdf {
				height: 100%;
			}

			#picture {
				object-fit: contain;
				height: 100%;

				img {
					height: 100%;
				}
			}
		`
	}

	protected override get template() {
		return html`
			<mo-dialog
				size='medium'
				heading=${this.parameters.heading}
				primaryButtonText=${this.parameters.primaryButtonText ?? ''}
			>
				${this.additionalItemsTemplate}

				<mo-flex id='container' gap='var(--mo-thickness-m)'>
					${this.files.length < 2 ? html.nothing : html`
						<mo-tab-bar
							value=${ifDefined(String(this.currentTabId))}
							@change=${(e: CustomEvent<string>) => this.currentTabId = +e.detail}
						>
							${this.files.map(file => html`
								<mo-tab value=${file.id}>
									${file.name}
								</mo-tab>
							`)}
						</mo-tab-bar>
					`}

					<main id='viewer'>
						${this.viewerTemplate}
					</main>
				</mo-flex>
			</mo-dialog>
		`
	}

	private get additionalItemsTemplate() {
		return html.nothing
	}

	private get viewerTemplate() {
		const file = this.files.find(file => file.id === +this.currentTabId! ?? this.files?.[0]?.id)

		const pathname =
			Object.getOwnPropertyDescriptor(file, this.parameters.pathKeyName as string)?.value ?? this.parameters.pathname

		if (!pathname) {
			return html.nothing
		}

		const type = file ? file?.type : this.parameters.pathname ? this.parameters.type : 'application/pdf'

		if (type?.includes('image')) {
			return html`
				<mo-flex alignItems='center' justifyContent='center' id='picture'>
					<img src=${pathname} />
				</mo-flex>
			`
		}

		return html`
			<mo-pdf source=${pathname}></mo-pdf>
		`
	}

	protected override cancellationAction() {
		return Promise.resolve()
	}
}