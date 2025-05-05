import { Popover } from '@3mo/popover'

/**
 * A floating-ui middleware that closes the popover when it is out of the viewport.
 */
export function closeWhenOutOfViewport(options?: { readonly padding?: number }): import('@floating-ui/dom').Middleware {
	return {
		name: 'closeWhenOutOfViewport',
		options,
		async fn(state) {
			const { detectOverflow } = await import('@floating-ui/dom')
			const overflow = await detectOverflow(state)
			const { height, width } = state.rects.floating
			const popover = state.elements.floating
			if (popover instanceof Popover === false) {
				return {}
			}
			const padding = options?.padding ?? 0
			if (overflow.bottom > height - padding ||
				overflow.top > height - padding ||
				overflow.left > width - padding ||
				overflow.right > width - padding
			) {
				popover.open = false
			}
			return {}
		}
	}
}