import { component, html, css, ifDefined, unsafeCSS, style, property, state } from '@a11d/lit'
import { Notification, NotificationComponent, NotificationType } from '@a11d/lit-application'
import { MaterialIcon } from '@3mo/icon'
import { Snackbar as MwcSnackbar } from '@material/mwc-snackbar'
import { PeriodicTimer } from './PeriodicTimer.js'

@component('mo-snackbar')
@NotificationComponent.defaultComponent()
export class Snackbar extends NotificationComponent {
	private static readonly defaultDuration = 5_000

	private static readonly offsetY = 8

	private static readonly defaultTimerPeriodByType = new Map<NotificationType, number>([
		[NotificationType.Info, 5_000],
		[NotificationType.Success, 5_000],
		[NotificationType.Warning, 10_000],
		[NotificationType.Error, 15_000],
	])

	private static readonly iconByType = new Map<NotificationType, MaterialIcon>([
		[NotificationType.Info, 'info'],
		[NotificationType.Success, 'check_circle'],
		[NotificationType.Warning, 'warning'],
		[NotificationType.Error, 'error'],
	])

	@property({ type: Object }) notification!: Notification

	@property({ type: Number }) offsetY = 0
	@property() text = ''
	@property({ reflect: true }) type = NotificationType.Info
	@property({ type: Boolean, updated(this: Snackbar) { setTimeout(() => this.recalculateOffset(), 0) } }) open = false

	recalculateOffset() {
		let offsetY = 0;
		[...document.querySelectorAll('mo-snackbar')].reverse().map((notification, i) => {
			if (!notification.open) {
				return
			}
			const rootNode = notification.shadowRoot?.firstElementChild?.shadowRoot?.firstElementChild as HTMLElement
			if (!rootNode) {
				return
			}
			if (i >= 5) {
				rootNode.style.opacity = '0'
				setTimeout(() => notification.dispose(), 200)
			}
			const height = rootNode?.getBoundingClientRect()?.height ?? 0
			rootNode.style.bottom = `-${height}px`
			offsetY -= height
			notification.offsetY = offsetY
			offsetY -= Snackbar.offsetY
		})
	}

	private timer?: PeriodicTimer
	private intervalId?: number

	static override get styles() {
		return css`
			:host {
				width: 100%;
			}

			:host([type=${unsafeCSS(NotificationType.Info)}]) {
				--mo-snackbar-color-base: var(--mo-color-blue-base);
			}

			:host([type=${unsafeCSS(NotificationType.Success)}]) {
				--mo-snackbar-color-base: var(--mo-color-green-base);
			}

			:host([type=${unsafeCSS(NotificationType.Warning)}]) {
				--mo-snackbar-color-base: var(--mo-color-yellow-base);
			}

			:host([type=${unsafeCSS(NotificationType.Error)}]) {
				--mo-snackbar-color-base: var(--mo-color-red-base);
			}
		`
	}

	protected override get template() {
		return html`
			<mwc-snackbar timeoutMs='-1' labelText=${this.text}
				${style({ '--y-offset': `${this.offsetY}px` })}
				?open=${this.open}
				@mouseover=${() => this.timer?.pause()}
				@mouseout=${() => this.timer?.run()}
				@MDCDrawer:opened=${() => this.timer?.run()}
				@MDCDrawer:closed=${() => this.timer?.dispose()}
			>
				${this.iconTemplate}
				${this.actionsTemplate}
				${this.dismissIconButtonTemplate}
				${this.progressBarTemplate}
			</mwc-snackbar>
		`
	}

	protected get iconTemplate() {
		return !this.type ? html.nothing : html`
			<mo-icon slot='icon'
				icon=${ifDefined(Snackbar.iconByType.get(this.type))}
				${style({ color: 'rgba(var(--mo-snackbar-color-base), 0.75)' })}
			></mo-icon>
		`
	}

	protected get dismissIconButtonTemplate() {
		return html`
			<mo-icon-button slot='dismiss' icon='close'
				${style({ color: 'var(--mo-color-background)', fontSize: '18px' })}
				@click=${() => this.dispose()}
			></mo-icon-button>
		`
	}

	protected get actionsTemplate() {
		return html`
			${this.notification?.actions?.map(action => html`
				<mo-button slot='action' @click=${() => action.handleClick()}>${action.title}</mo-button>
			`)}
		`
	}

	protected get progressBarTemplate() {
		return !this.timer ? html.nothing : html`
			<mo-linear-progress slot='progress' progress=${1 - this.timer.remainingTimeToNextTick / this.timer.interval + 0.075}></mo-linear-progress>
		`
	}

	private dispose() {
		this.timer?.dispose()
		this.open = false
	}

	async show() {
		this.text = this.notification.message
		this.type = this.notification.type ?? NotificationType.Info
		const typeDuration = !this.type ? undefined : Snackbar.defaultTimerPeriodByType.get(this.type)
		const duration = typeDuration ?? Snackbar.defaultDuration
		this.timer = new PeriodicTimer(duration)
		this.timer.run()
		this.intervalId = window.setInterval(() => this.requestUpdate(), 100)
		await this.updateComplete
		this.open = true
		await this.timer?.waitForNextTick()
		this.open = false
		this.text = ''
		window.clearInterval(this.intervalId)
	}
}

MwcSnackbar.elementStyles.push(css`
	slot[name=icon] {
		display: flex;
		height: 100%;
		align-items: center;
		justify-content: center;
		padding-inline-start: 8px;
	}

	slot[name=progress] {
		display: block;
		position: absolute;
		bottom: 0;
		inset-inline-start: 0;
		inset-inline-end: 0px;
		width: 100%;
	}

	slot[name=progress]::slotted(*) {
		width: 100%;
	}

	.mdc-snackbar {
		transform: translateY(var(--y-offset));
		transition: transform 0.3s, opacity 0.2s;
	}

	.mdc-snackbar__surface {
		background-color: var(--mo-color-foreground);
	}

	.mdc-snackbar__label {
		padding-inline-start: 8px;
		color: rgba(var(--mo-color-background-base), 0.87)
	}
` as any)

MwcSnackbar.addInitializer(snackbar => snackbar.addController(new class {
	private get surfaceElement() {
		return snackbar.renderRoot.querySelector('.mdc-snackbar__surface')
	}

	async hostConnected() {
		await snackbar.updateComplete
		this.addIconSlot()
		this.addProgressBarSlot()
	}

	private addIconSlot() {
		const slot = document.createElement('slot')
		slot.name = 'icon'
		this.surfaceElement?.insertBefore(slot, this.surfaceElement.firstChild)
	}

	private addProgressBarSlot() {
		const slot = document.createElement('slot')
		slot.name = 'progress'
		this.surfaceElement?.append(slot)
	}
}))

declare global {
	interface HTMLElementTagNameMap {
		'mo-snackbar': Snackbar
	}
}