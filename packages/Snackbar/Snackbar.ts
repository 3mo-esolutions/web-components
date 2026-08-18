import { component, html, css, ifDefined, unsafeCSS, property, query } from '@a11d/lit'
import { type Notification, NotificationComponent, NotificationType } from '@a11d/lit-application'
import { type MaterialIcon } from '@3mo/icon'
import { PeriodicTimer } from './PeriodicTimer.js'
import { SnackbarStackController } from './SnackbarStackController.js'
// eslint-disable-next-line no-duplicate-imports
import '@3mo/icon'
import '@3mo/icon-button'
import '@3mo/button'
import '@3mo/linear-progress'
import '@3mo/theme'

/**
 * A short update about an app process, shown at the anchored edge of the screen.
 *
 * @attr open - Whether the snack-bar is currently shown
 * @attr type - The notification type which controls the accent color and icon
 *
 * @cssprop --mo-snackbar-color - The accent color of the snack-bar. Defaults to a color derived from the notification type.
 *
 * @csspart surface - The snack-bar's surface
 */
@component('mo-snackbar')
@NotificationComponent.defaultComponent()
export class Snackbar extends NotificationComponent {
	private static readonly defaultDuration = 5_000
	private static readonly exitAnimationDuration = 250

	private static readonly dataByType = new Map<NotificationType, { icon: MaterialIcon, defaultTimerPeriod: number }>([
		[NotificationType.Info, { icon: 'info', defaultTimerPeriod: 5_000 }],
		[NotificationType.Success, { icon: 'check_circle', defaultTimerPeriod: 5_000 }],
		[NotificationType.Warning, { icon: 'warning', defaultTimerPeriod: 10_000 }],
		[NotificationType.Error, { icon: 'error', defaultTimerPeriod: 15_000 }],
	])

	readonly stack = new SnackbarStackController(this)

	@property({ type: Object }) notification!: Notification

	@property() text = ''
	@property({ reflect: true }) type = NotificationType.Info
	@property({ type: Boolean, updated(this: Snackbar) { this.stack.requestLayoutUpdate() } }) open = false

	@query('[part=surface]') readonly surface!: HTMLElement

	private timer?: PeriodicTimer
	private updateIntervalId?: number
	private closeResolve?: () => void

	/** Holds the timer while the stack is expanded, as an expanded stack is one that is being read. */
	handleStackExpandedChange(expanded: boolean) {
		if (expanded) {
			this.timer?.pause()
		} else {
			this.timer?.run()
		}
	}

	static override get styles() {
		return css`
			:host {
				position: fixed;
				inset-inline: 8px;
				inset-block-end: 8px;
				display: flex;
				justify-content: center;
				pointer-events: none;
			}

			:host([type=${unsafeCSS(NotificationType.Info)}]) {
				--mo-snackbar-color: var(--mo-color-blue);
			}

			:host([type=${unsafeCSS(NotificationType.Success)}]) {
				--mo-snackbar-color: var(--mo-color-green);
			}

			:host([type=${unsafeCSS(NotificationType.Warning)}]) {
				--mo-snackbar-color: var(--mo-color-yellow);
			}

			:host([type=${unsafeCSS(NotificationType.Error)}]) {
				--mo-snackbar-color: var(--mo-color-red);
			}

			[part=surface] {
				position: relative;
				box-sizing: border-box;
				overflow: hidden;
				display: flex;
				align-items: center;
				min-height: 48px;
				min-width: min(344px, 100%);
				max-width: min(672px, 100%);
				background-color: var(--mo-color-foreground);
				color: color-mix(in srgb, var(--mo-color-background), transparent 13%);
				border-radius: var(--mo-border-radius);
				box-shadow: var(--mo-shadow-deep);
				font-size: 0.875rem;
				line-height: 1.25rem;
				transform-origin: center bottom;
				/* Falls back to the state a snack-bar enters from, so that it does not travel before the stack has placed it */
				transform: translateY(var(--mo-snackbar-y, 24px)) scale(var(--mo-snackbar-scale, 0.9));
				opacity: var(--mo-snackbar-opacity, 0);
				transition: transform 0.3s, opacity 0.2s, width 0.3s, height 0.3s;
				pointer-events: auto;

				@media (prefers-reduced-motion: reduce) {
					transition: none;
				}

				&:not([data-open]) {
					transform: translateY(calc(var(--mo-snackbar-y, 12px) + 12px)) scale(var(--mo-snackbar-scale, 0.9));
					opacity: 0;
					pointer-events: none;
				}
			}

			.content {
				display: flex;
				align-items: center;
				gap: 8px;
				width: 100%;
				padding-block: 6px;
				padding-inline: 12px 6px;
				transition: opacity 0.15s;
			}

			[part=surface][data-collapsed] .content {
				opacity: 0;
			}

			/* A collapsed snack-bar is clamped to the size of the stack's base, so its own content cannot be laid out in it */

			.label {
				flex: 1;
				padding-block: 4px;
			}

			mo-icon {
				color: color-mix(in srgb, var(--mo-snackbar-color), transparent 10%);
			}

			mo-icon-button {
				color: var(--mo-color-background);
				font-size: 18px;
			}

			mo-linear-progress {
				position: absolute;
				inset-block-end: 0;
				inset-inline: 0;
				height: 3px;
				--mo-linear-progress-accent-color: var(--mo-snackbar-color);
				--mo-linear-progress-track-color: color-mix(in srgb, var(--mo-snackbar-color), transparent 75%);
			}
		`
	}

	protected override get template() {
		const role = this.type === NotificationType.Error || this.type === NotificationType.Warning ? 'alert' : 'status'
		return html`
			<div part='surface' role=${role} ?data-open=${this.open}>
				<div class='content'>
					${this.iconTemplate}
					<span class='label'>${this.text}</span>
					${this.actionsTemplate}
					${this.dismissIconButtonTemplate}
					${this.progressBarTemplate}
				</div>
			</div>
		`
	}

	protected get iconTemplate() {
		return !this.type ? html.nothing : html`
			<mo-icon icon=${ifDefined(Snackbar.dataByType.get(this.type)?.icon)}></mo-icon>
		`
	}

	protected get dismissIconButtonTemplate() {
		return html`
			<mo-icon-button icon='close' @click=${() => this.close()}></mo-icon-button>
		`
	}

	protected get actionsTemplate() {
		return html`
			${this.notification?.actions?.map(action => html`
				<mo-button @click=${() => action.handleClick()}>${action.title}</mo-button>
			`)}
		`
	}

	protected get progressBarTemplate() {
		return !this.timer ? html.nothing : html`
			<mo-linear-progress progress=${1 - this.timer.remainingTimeToNextTick / this.timer.interval + 0.075}></mo-linear-progress>
		`
	}

	close() {
		this.closeResolve?.()
	}

	async show() {
		this.text = this.notification.message
		this.type = this.notification.type ?? NotificationType.Info
		const typeDuration = !this.type ? undefined : Snackbar.dataByType.get(this.type)?.defaultTimerPeriod
		const duration = typeDuration ?? Snackbar.defaultDuration
		const actionsAddedDuration = (this.notification.actions?.length ?? 0) * 2500
		const timer = this.timer = new PeriodicTimer(duration + actionsAddedDuration)
		this.updateIntervalId = window.setInterval(() => this.requestUpdate(), 100)
		await this.updateComplete
		this.open = true
		const dismissal = timer.waitForNextTick()
		if (this.stack.expanded) {
			timer.pause()
		}
		await Promise.race([
			dismissal,
			new Promise<void>(resolve => this.closeResolve = resolve),
		])
		window.clearInterval(this.updateIntervalId)
		timer.dispose()
		this.timer = undefined
		this.open = false
		await new Promise(resolve => setTimeout(resolve, Snackbar.exitAnimationDuration))
	}
}

declare global {
	interface HTMLElementTagNameMap {
		'mo-snackbar': Snackbar
	}
}