import { Component, component, css, eventListener, html, ifDefined, property, query } from '@a11d/lit'
import './cloudflarestream-sdk.js'

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

	private stream?: CloudflareStreamApi

	protected override initialized() {
		// @ts-expect-error Stream will be injected globally
		this.stream = Stream(this.iframeElement)
	}

	protected override get template() {
		return html`
			<iframe src=${ifDefined(this.source)}
				?hidden=${!this.source}
				allow='accelerometer; gyroscope; autoplay; encrypted-media; picture-in-picture;'
				allowfullscreen
			></iframe>
		`
	}

	@eventListener({ type: 'scroll', target: window })
	@eventListener({ type: 'resize', target: window })
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