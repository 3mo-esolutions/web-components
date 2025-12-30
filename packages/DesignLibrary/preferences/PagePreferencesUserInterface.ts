import { html, component, css, style } from '@a11d/lit'
import { route } from '@a11d/lit-application'
import { Background, Theme } from '@3mo/theme'
import { Color } from '@3mo/color'
import { DataGrid, type DataGridPagination } from '@3mo/data-grid'
import { PagePreferences, PageSettings } from './index.js'

@component('mo-page-preferences-user-interface')
@route(PagePreferences, '/preferences/user-interface', '/preferences/ui')
export class PagePreferencesUserInterface extends PageSettings {
	private static readonly accentPresetColors = [
		new Color('rgb(0, 119, 200)'), // 3MO Blue
		new Color('rgb(0, 128, 128)'), // Teal
		new Color('rgb(171, 71, 188)'), // Purple
		new Color('rgb(104, 159, 56)'), // Green
		new Color('rgb(249, 168, 37)'), // Yellow
		new Color('rgb(251, 125, 142)'), // Pink
	]

	protected override initialized() {
		Theme.background.changed.subscribe(() => this.requestUpdate())
		Theme.accent.changed.subscribe(() => this.requestUpdate())
	}

	static override get styles() {
		return css`
			${super.styles}

			.themePreview {
				cursor: pointer;
				padding: 10px;
				height: 100px;
				width: min(100%, 150px);
				border: 4px solid var(--mo-color-gray);
				border-radius: var(--mo-border-radius);
				background: var(--preview-background);
			}

			.themePreview[data-active] {
				border-color: var(--mo-color-accent);
			}

			.themePreview[data-background=light] {
				--preview-background: white;
				--preview-foreground: black;
			}

			.themePreview[data-background=dark] {
				--preview-background: black;
				--preview-foreground: white;
			}

			.themePreview[data-background=system] {
				--preview-background: linear-gradient(0deg, rgba(0,0,0,0.75) 0%, rgba(255,255,255,0.75) 100%);
				--preview-foreground: var(--mo-color-foreground);
			}

			.themePreview div {
				border-radius: var(--mo-border-radius);
				height: 2px;
				width: 100%;
				background-color: var(--preview-foreground);
				opacity: 0.8;
			}

			.accentPreview {
				cursor: pointer;
				justify-self: center;
				border: none;
				width: 25px;
				height: 25px;
				border-radius: 50%;
			}
		`
	}

	protected override get template() {
		return html`
			<mo-page heading='User-Interface' headerHidden>
				<mo-flex gap='18px'>
					<mo-section heading='Farbthemen'>
						<mo-card ${style({ flex: '1', alignItems: 'center' })}>
							<mo-flex direction='horizontal' gap='10px' justifyContent='center'>
								<mo-flex direction='horizontal' gap='10px' ${style({ flex: '1', maxWidth: '1000px' })}>
									${this.getBackgroundColorTemplate(Background.System)}
									${this.getBackgroundColorTemplate(Background.Light)}
									${this.getBackgroundColorTemplate(Background.Dark)}
								</mo-flex>
								<mo-grid gap='10px' columns='* * *' style='display: none'>
									${PagePreferencesUserInterface.accentPresetColors.map(color => this.getForegroundColorTemplate(color))}
									<!-- .presets={PagePreferencesUserInterface.accentPresetColors} -->
									<mo-color-picker ${style({ width: '100%', gridColumn: '1 / -1' })}
										.value=${!Theme.accent.value ? undefined : new Color(Theme.accent.value)}
										@input=${(e: CustomEvent<Color>) => Theme.accent.value = e.detail.rgb}
										@change=${(e: CustomEvent<Color>) => Theme.accent.value = e.detail.rgb}
									></mo-color-picker>
								</mo-grid>
							</mo-flex>
						</mo-card>
					</mo-section>

					<mo-section heading='Tabellen'>
						<mo-flex gap='0.5rem'>
							<mo-list-item>
								Zeilen pro Seite
								<mo-field-select dense
									${style({ width: '150px' })}
									value=${DataGrid.pageSize.value}
									@change=${(e: CustomEvent<Exclude<DataGridPagination, 'auto'>>) => DataGrid.pageSize.value = e.detail}
								>
									${[10, 25, 50, 100, 250, 500].map(size => html`<mo-option value=${size}>${size.format()}</mo-option>`)}
								</mo-field-select>
							</mo-list-item>

							<mo-checkbox-list-item
								?selected=${DataGrid.hasAlternatingBackground.value}
								@change=${(e: CustomEvent<boolean>) => DataGrid.hasAlternatingBackground.value = e.detail}
							>Wechselnder Hintergrund</mo-checkbox-list-item>

							<mo-list-item>
								Höhe der Zeilen
								<mo-slider max='50' min='30' step='5' discrete
									${style({ margin: '0 -15px' })}
									value=${DataGrid.rowHeight.value}
									@change=${(e: CustomEvent<number>) => DataGrid.rowHeight.value = e.detail}
								></mo-slider>
							</mo-list-item>

							<mo-list-item>
								Schriftgröße
								<mo-slider min='0.8' max='1.2' step='0.1' discrete
									${style({ margin: '0 -15px' })}
									value=${DataGrid.cellRelativeFontSize.value}
									@input=${(e: CustomEvent<number>) => DataGrid.cellRelativeFontSize.value = e.detail}
								></mo-slider>
							</mo-list-item>
						</mo-flex>
					</mo-section>

					<mo-section heading='Dialoge'>
						<mo-list-item>
							Popup-fähige Dialoge immer öffnen
							<mo-field-select-poppable-dialog-confirmation-strategy dense
								${style({ width: '150px' })}
							></mo-field-select-poppable-dialog-confirmation-strategy>
						</mo-list-item>
					</mo-section>
				</mo-flex>
			</mo-page>
		`
	}

	private getBackgroundColorTemplate(background: Background) {
		const getName = () => {
			switch (background) {
				case Background.System: return 'Systemfarbe'
				case Background.Light: return 'Hell'
				case Background.Dark: return 'Dunkel'
			}
		}
		return html`
			<mo-flex ${style({ flex: '1' })} gap='0.5rem' alignItems='center'>
				<button class='themePreview'
					data-background=${background}
					?data-active=${Theme.background.value === background}
					@click=${() => Theme.background.value = background}
				>
					<mo-flex gap='0.5rem'>
						<div ${style({ position: 'relative', opacity: 1, background: 'var(--mo-color-accent)', height: '20px', width: '100%' })}>
							<div ${style({ insetInlineStart: '30%', top: '8px', position: 'absolute', background: 'var(--mo-color-on-accent)', height: '4px', width: '40%', opacity: '1' })}></div>
						</div>
						<div ${style({ background: 'var(--mo-color-accent)', height: '4px', width: '50%', opacity: '1' })}></div>
						<div ${style({ width: '100%' })}></div>
						<div ${style({ width: '100%' })}></div>
						<div ${style({ width: '80%' })}></div>
					</mo-flex>
				</button>
				<mo-heading typography='heading5' ${style({ textAlign: 'center' })}>
					${getName()}
				</mo-heading>
			</mo-flex>
		`
	}

	private getForegroundColorTemplate(color: Color) {
		return html`
			<button class='accentPreview' ${style({ background: color.hex })}
				@click=${() => Theme.accent.value = color.rgb}
			></button>
		`
	}
}