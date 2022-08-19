import { Component, component, css, eventListener, html, ifDefined, property, query } from '@a11d/lit'

type CloudflareStreamApi = {
	play(): Promise<void>
	pause(): Promise<void>
}

export const enum AutoPauseStrategy {
	WhenNotInViewport = 'when-not-in-viewport',
	WhenQuarterInViewport = 'when-quarter-in-viewport',
	WhenHalfInViewport = 'when-half-in-viewport',
}

@component('mo-cloudflare-stream')
export class CloudflareStream extends Component {
	private static getViewportShallPausePredicate(scale: number) {
		return (rect: DOMRect) => {
			const scaledHeight = Math.ceil(rect.height * (1 - scale))
			return (
				rect.top > scaledHeight * -1 &&
				rect.left >= 0 &&
				rect.bottom <= (window.innerHeight || document.documentElement.clientHeight) + scaledHeight &&
				rect.right <= (window.innerWidth || document.documentElement.clientWidth)
			) === false
		}
	}

	private static readonly shallPauseByStrategy = new Map([
		[AutoPauseStrategy.WhenNotInViewport, CloudflareStream.getViewportShallPausePredicate(0)],
		[AutoPauseStrategy.WhenQuarterInViewport, CloudflareStream.getViewportShallPausePredicate(0.25)],
		[AutoPauseStrategy.WhenHalfInViewport, CloudflareStream.getViewportShallPausePredicate(0.5)],
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

	@eventListener({ type: 'scroll', target: window })
	protected handleScroll() {
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

	@property() source?: string
	@property() autoPause?: AutoPauseStrategy

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
}

declare global {
	interface HTMLElementTagNameMap {
		'mo-cloudflare-stream': CloudflareStream
	}
}