import { Component, component, css, eventListener, html, ifDefined, property, query } from '@a11d/lit'

type CloudflareStreamApi = {
	play(): Promise<void>
	pause(): Promise<void>
}

@component('mo-cloudflare-stream')
export class CloudflareStream extends Component {
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
		const rect = this.getBoundingClientRect()
		const isHalfInViewPort =
			rect.top > Math.ceil(rect.height / 2) * -1 &&
			rect.left >= 0 &&
			rect.bottom <= (window.innerHeight || document.documentElement.clientHeight) + Math.ceil(rect.height / 2) &&
			rect.right <= (window.innerWidth || document.documentElement.clientWidth)

		if (isHalfInViewPort) {
			this.stream?.play()
		} else {
			this.stream?.pause()
		}
	}

	@property() source?: string

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
				allowfullscreen>
			</iframe>
		`
	}
}

declare global {
	interface HTMLElementTagNameMap {
		'mo-cloudflare-stream': CloudflareStream
	}
}