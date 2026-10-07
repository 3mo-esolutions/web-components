import { Component, component, css, eventListener, html, ifDefined, isServer, property, query } from '@a11d/lit'

type CloudflareStreamApi = {
	play(): Promise<void>
	pause(): Promise<void>
}

export type CloudflareStreamAutoPause =
	| 'when-not-in-viewport'
	| 'when-quarter-in-viewport'
	| 'when-half-in-viewport'

const getViewportShallPausePredicate = (scale: number) => (rect: DOMRect) => {
	const scaledHeight = Math.ceil(rect.height * (1 - scale))
	return (
		rect.top > scaledHeight * -1
		&& rect.left >= 0
		&& rect.bottom <= (window.innerHeight || document.documentElement.clientHeight) + scaledHeight
		&& rect.right <= (window.innerWidth || document.documentElement.clientWidth)
	) === false
}

/**
 * A Cloudflare Stream video player, embedded at a 16:9 ratio.
 *
 * @element mo-cloudflare-stream
 *
 * @attr source - The URL of the video's Cloudflare Stream player iframe.
 * @attr autoPause - When the video pauses as it is scrolled out of view: `when-not-in-viewport`, `when-quarter-in-viewport` or `when-half-in-viewport`. It plays again when it returns.
 */
@component('mo-cloudflare-stream')
export class CloudflareStream extends Component {
	private static readonly shallPauseByStrategy = new Map<CloudflareStreamAutoPause, ReturnType<typeof getViewportShallPausePredicate>>([
		['when-not-in-viewport', getViewportShallPausePredicate(0)],
		['when-quarter-in-viewport', getViewportShallPausePredicate(0.25)],
		['when-half-in-viewport', getViewportShallPausePredicate(0.5)],
	])

	static override get styles() {
		return css`
			:host {
				display: block;
				position: relative;
				aspect-ratio: 16 / 9;
				width: 100%;
				user-select: none;
			}

			iframe {
				border: none;
				position: absolute;
				top: 0;
				height: 100%;
				width: 100%;
			}
		`
	}

	@property() source?: string
	@property({ updated(this: CloudflareStream) { this.autoPauseIfNecessary() } }) autoPause?: CloudflareStreamAutoPause

	@query('iframe') readonly iframeElement!: HTMLIFrameElement

	static {
		if (!isServer) {
			import('./cloudflarestream-sdk.js')
		}
	}

	private _stream?: CloudflareStreamApi
	// Created once the SDK, which is loaded asynchronously, has defined "Stream":
	private get stream() {
		return this._stream ??= (globalThis as { Stream?: (iframe: HTMLIFrameElement) => CloudflareStreamApi }).Stream?.(this.iframeElement)
	}

	/* eslint-disable @html-eslint/use-baseline */

	protected override get template() {
		return html`
			<iframe src=${ifDefined(this.source)}
				allowfullscreen
				?hidden=${!this.source}
				allow='accelerometer; gyroscope; autoplay; encrypted-media; picture-in-picture;'
			></iframe>
		`
	}

	@eventListener({ type: 'scroll', target: window, options: { passive: true } })
	@eventListener({ type: 'resize', target: window, options: { passive: true } })
	protected autoPauseIfNecessary() {
		if (this.autoPause) {
			const rect = this.getBoundingClientRect()
			const shallPause = CloudflareStream.shallPauseByStrategy.get(this.autoPause)?.(rect) ?? false
			if (shallPause) {
				this.stream?.pause()
			} else {
				this.stream?.play()
			}
		}
	}
}

declare global {
	interface HTMLElementTagNameMap {
		'mo-cloudflare-stream': CloudflareStream
	}
}
