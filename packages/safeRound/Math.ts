import { safeRound } from './safeRound.js'

Math.safeRound = safeRound

declare global {
	interface Math {
		safeRound(number: number, decimals?: number): number
	}
}