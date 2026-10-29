import { createMetadataDecorator } from '@a11d/metadata'
import type { MaterialIcon } from '@3mo/icon'

/**
 * Attaches an icon to a class, typically a routable component, which navigation links fall back to.
 *
 * Importing the package also makes it available as the global `icon`.
 */
export const icon = createMetadataDecorator('icon') as {
	(value: MaterialIcon): (target: Constructor<any>) => void
	get(constructor: Constructor<any>): MaterialIcon | undefined
	readonly override: symbol
	resolve(instance: object): MaterialIcon | undefined
}

globalThis.icon = icon

declare global {
	var icon: typeof import('./icon.js').icon
}
