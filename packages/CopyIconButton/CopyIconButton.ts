import { Component, component, css, event, eventListener, html, property, query, state } from '@a11d/lit'
import { tooltip } from '@3mo/tooltip'
import { disabledProperty } from '@3mo/disabled-property'
import { Localizer } from '@3mo/localization'
import { type MaterialIcon } from '@3mo/icon'
import { type IconButton } from '@3mo/icon-button'
import { type Swap } from '@3mo/swap'

Localizer.dictionaries.add('de', {
	'Copy': 'Kopieren',
	'Copied': 'Kopiert',
	'Could not copy': 'Kopieren fehlgeschlagen',
})

/**
 * An icon-button which writes a value to the clipboard and confirms it by briefly turning into a check mark.
 *
 * @element mo-copy-icon-button
 *
 * @attr value - The text which is written to the clipboard. Copying nothing is treated as a failure.
 * @attr label - The tooltip naming what the button copies. Defaults to "Copy" and is dropped when set to an empty string.
 * @attr icon - The icon of the resting state.
 * @attr successIcon - The icon shown after the value has been copied.
 * @attr errorIcon - The icon shown when the value could not be copied.
 * @attr feedbackDuration - The milliseconds the outcome is shown before the button returns to its resting state.
 * @attr disabled - Disables the button.
 * @attr dense - Reduces the size of the button.
 *
 * @slot icon - The content of the resting state.
 * @slot success-icon - The content shown after the value has been copied.
 * @slot error-icon - The content shown when the value could not be copied.
 *
 * @cssprop --mo-copy-icon-button-success-color - The color of the success state.
 * @cssprop --mo-copy-icon-button-error-color - The color of the error state.
 *
 * @fires copy - Dispatched with the text which has been written to the clipboard.
 * @fires copyError - Dispatched with the reason the text could not be written to the clipboard.
 */
@component('mo-copy-icon-button')
export class CopyIconButton extends Component {
	@event() readonly copy!: EventDispatcher<string>
	@event() readonly copyError!: EventDispatcher<Error>

	@property() value = ''
	@property() label?: string
	@property() icon: MaterialIcon = 'content_copy'
	@property() successIcon: MaterialIcon = 'check'
	@property() errorIcon: MaterialIcon = 'error_outline'
	@property({ type: Number }) feedbackDuration = 1500
	@disabledProperty() disabled = false
	@property({ type: Boolean, reflect: true }) dense = false

	@state() private announcement = ''

	@query('mo-swap') private readonly swap!: Swap
	@query('mo-icon-button') private readonly iconButton!: IconButton

	override focus(...parameters: Parameters<Component['focus']>) {
		this.updateComplete.then(() => this.iconButton.focus(...parameters))
	}

	override blur(...parameters: Parameters<Component['blur']>) {
		this.updateComplete.then(() => this.iconButton.blur(...parameters))
	}

	static override get styles() {
		return css`
			:host {
				display: inline-block;
				/* Anchors the status message, which is taken out of the flow so that it cannot affect the button. */
				position: relative;
			}

			/* The icon-button alone refusing pointer events would leave them to the host, which listens for the click. */
			:host([disabled]) {
				pointer-events: none;
			}

			mo-icon {
				font-size: inherit;
			}

			/* Colouring the slot rather than its fallback icon reaches custom content handed to it just the same. */
			slot[name=success-icon] {
				color: var(--mo-copy-icon-button-success-color, var(--mo-color-green));
			}

			slot[name=error-icon] {
				color: var(--mo-copy-icon-button-error-color, var(--mo-color-red));
			}

			[role=status] {
				position: absolute;
				width: 1px;
				height: 1px;
				overflow: hidden;
				clip-path: inset(50%);
				white-space: nowrap;
			}
		`
	}

	protected override get template() {
		return html`
			<mo-icon-button ?disabled=${this.disabled} ?dense=${this.dense}
				${this.label === '' ? html.nothing : tooltip(this.label ?? t('Copy'))}
			>
				<mo-swap slot='icon' .flashDuration=${this.feedbackDuration} @change=${this.handleValueChange}>
					<slot name='icon'>
						<mo-icon icon=${this.icon}></mo-icon>
					</slot>
					<slot slot='success' name='success-icon'>
						<mo-icon icon=${this.successIcon}></mo-icon>
					</slot>
					<slot slot='error' name='error-icon'>
						<mo-icon icon=${this.errorIcon}></mo-icon>
					</slot>
				</mo-swap>
			</mo-icon-button>

			<div role='status'>${this.announcement}</div>
		`
	}

	/** Listening on the host rather than the icon-button also makes "click()" on the element itself copy. */
	@eventListener('click')
	protected async handleClick() {
		if (this.disabled) {
			return
		}
		try {
			if (!this.value) {
				throw new Error('There is no value to copy.')
			}
			await navigator.clipboard.writeText(this.value)
			this.copy.dispatch(this.value)
			await this.swap.flash('success')
		} catch (error) {
			this.copyError.dispatch(error instanceof Error ? error : new Error(String(error)))
			await this.swap.flash('error')
		}
	}

	/**
	 * The outcome is only conveyed by an icon, which leaves assistive technology with nothing to announce.
	 * Deriving the message from the value the swap actually shows keeps both in step.
	 */
	private readonly handleValueChange = (event: CustomEvent<string>) => {
		switch (event.detail) {
			case 'success':
				this.announcement = t('Copied')
				break
			case 'error':
				this.announcement = t('Could not copy')
				break
			default:
				this.announcement = ''
				break
		}
	}
}

declare global {
	interface HTMLElementTagNameMap {
		'mo-copy-icon-button': CopyIconButton
	}
}