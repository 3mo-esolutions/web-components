import { Component, component, css, event, html, ifDefined, property, query } from '@a11d/lit'
import { SheetController, type SheetRequestCloseSource } from './SheetController.js'
import type { SheetPlacement } from './SheetPlacement.js'

/**
 * An edge-anchored modal sheet surface rendered in the top layer via native `<dialog>`.
 * Supports modal backdrop, focus containment, CSS animations, and swipe-to-dismiss.
 *
 * @element mo-sheet
 *
 * @attr open - Whether the sheet is open.
 * @attr placement - The edge the sheet is anchored to: `block-end` (default), `block-start`, `inline-start` or `inline-end`.
 * @attr label - The accessible name of the sheet.
 *
 * @slot - Content of the sheet.
 * @slot handle - The grabber handle, replacing the default one. Only rendered for block placements.
 * @slot top-layer - Hosts elements which must stay interactive while the rest of the page is made inert by the sheet.
 *
 * @csspart dialog - The native dialog element, filling the viewport. Its `::backdrop` carries the scrim.
 * @csspart panel - The visible sheet surface.
 * @csspart handle - The default grabber handle.
 * @csspart content - The scrollable wrapper around the default slot.
 *
 * @cssprop --mo-sheet-size - The panel's size on its anchored axis: the maximum height for block placements, the width for inline placements.
 * @cssprop --mo-sheet-scrim - The backdrop color. Defaults to the theme's scrim color.
 * @cssprop --mo-sheet-border-radius - The corner radius of the panel's free edges.
 * @cssprop --mo-sheet-duration - How long the sheet takes to come and go. Defaults to `250ms`.
 * @cssprop --mo-sheet-easing - The easing of that motion. Defaults to Material's emphasized decelerate.
 *
 * @i18n "Close"
 *
 * @fires openChange - Dispatched with the new state whenever the sheet opens or closes.
 * @fires requestClose - Dispatched with the source before the sheet closes itself. Cancelable to keep the sheet open.
 */
@component('mo-sheet')
export class Sheet extends Component {
	@event() readonly openChange!: EventDispatcher<boolean>

	@property({
		type: Boolean,
		reflect: true,
		bindingDefault: true,
		event: 'openChange',
		updated(this: Sheet, open: boolean, previousOpen: boolean | undefined) {
			if (previousOpen !== undefined && previousOpen !== open) {
				this.openChange.dispatch(open)
			}
		}
	}) open = false

	@property({ reflect: true }) placement: SheetPlacement = 'block-end'
	@property() label?: string

	@query('dialog') readonly dialogElement!: HTMLDialogElement

	readonly controller = new SheetController(this, {
		autofocusTarget: () => this.querySelector<HTMLElement>('[autofocus]'),
	})

	protected requestClose(source: SheetRequestCloseSource) {
		return this.controller.requestClose(source)
	}

	static override get styles() {
		return css`
			:host {
				display: contents;
				--mo-sheet-travel-size: 100%;
			}

			/* Separate animations ensure settled sheets exit with full duration. */
			@keyframes slide-in {
				from { translate: var(--mo-sheet-motion-origin); }
			}

			@keyframes slide-out {
				from { translate: var(--mo-sheet-motion-origin); }
				to { translate: var(--_travel); }
			}

			@keyframes fade-in {
				from { opacity: 0; }
			}

			@keyframes fade-out {
				to { opacity: 0; }
			}

			dialog {
				position: fixed;
				/* dvb/dvi adapt to dynamic browser chrome changes. */
				inset: 0;
				block-size: 100dvb;
				inline-size: 100dvi;
				max-block-size: none;
				max-inline-size: none;
				margin: 0;
				padding: 0;
				border: none;
				background: transparent;
				color: var(--mo-color-foreground);
				overflow: clip;

				&::backdrop {
					background: var(--mo-sheet-scrim, var(--mo-color-scrim, rgb(0 0 0 / 0.32)));
				}

				&[open] {
					#panel { animation: slide-in var(--mo-sheet-duration, 250ms) var(--mo-sheet-easing, cubic-bezier(0.2, 0, 0, 1)); }
					&::backdrop { animation: fade-in var(--mo-sheet-duration, 250ms) var(--mo-sheet-easing, cubic-bezier(0.2, 0, 0, 1)); }
				}

				&[data-closing] {
					#panel { animation: slide-out var(--mo-sheet-duration, 250ms) var(--mo-sheet-easing, cubic-bezier(0.2, 0, 0, 1)) forwards; }
					&::backdrop { animation: fade-out var(--mo-sheet-duration, 250ms) var(--mo-sheet-easing, cubic-bezier(0.2, 0, 0, 1)) forwards; }
				}

				#panel {
					--mo-sheet-motion-origin: var(--_travel);
					position: absolute;
					display: flex;
					flex-direction: column;
					box-sizing: border-box;
					background: var(--mo-color-surface);
					box-shadow: var(--mo-shadow-deep);
				}

				&[data-placement^=block] #panel {
					inset-inline: 0;
					max-block-size: var(--mo-sheet-size, calc(100% - 2.5rem));
				}

				&[data-placement=block-end] #panel {
					--_travel: 0 var(--mo-sheet-travel-size);
					inset-block-end: 0;
					border-start-start-radius: var(--mo-sheet-border-radius, 1rem);
					border-start-end-radius: var(--mo-sheet-border-radius, 1rem);
					padding-block-end: env(safe-area-inset-bottom);
				}

				&[data-placement=block-start] #panel {
					--_travel: 0 calc(-1 * var(--mo-sheet-travel-size));
					inset-block-start: 0;
					border-end-start-radius: var(--mo-sheet-border-radius, 1rem);
					border-end-end-radius: var(--mo-sheet-border-radius, 1rem);
					padding-block-start: env(safe-area-inset-top);
				}

				&[data-placement^=inline] {
					#panel {
						inset-block: 0;
						inline-size: min(var(--mo-sheet-size, 20rem), calc(100% - 3rem));
						touch-action: pan-y;
					}

					slot[name=handle] {
						display: none;
					}
				}

				#panel[data-swipeability=swiping] {
					cursor: grabbing;
					user-select: none;
				}

				&[data-placement=inline-start] #panel {
					--_travel: calc(-1 * var(--mo-sheet-travel-size)) 0;
					inset-inline-start: 0;
					border-start-end-radius: var(--mo-sheet-border-radius, 1rem);
					border-end-end-radius: var(--mo-sheet-border-radius, 1rem);
				}

				&[data-placement=inline-end] #panel {
					--_travel: var(--mo-sheet-travel-size) 0;
					inset-inline-end: 0;
					border-start-start-radius: var(--mo-sheet-border-radius, 1rem);
					border-end-start-radius: var(--mo-sheet-border-radius, 1rem);
				}

				&:dir(rtl) {
					&[data-placement=inline-start] #panel { --_travel: var(--mo-sheet-travel-size) 0; }
					&[data-placement=inline-end] #panel { --_travel: calc(-1 * var(--mo-sheet-travel-size)) 0; }
				}
			}

			[part=handle] {
				all: unset;
				display: flex;
				justify-content: center;
				margin-inline: auto;
				padding-block: 0.5rem;
				padding-inline: 3rem;
				cursor: grab;
				touch-action: none;
				-webkit-tap-highlight-color: transparent;

				&::before {
					content: '';
					inline-size: 2rem;
					block-size: 0.25rem;
					border-radius: 0.125rem;
					background: var(--mo-color-gray-transparent);
				}

				&:focus-visible {
					outline: 2px solid var(--mo-color-accent);
					outline-offset: -6px;
					border-radius: 1rem;
				}
			}

			#content {
				flex: 1;
				min-block-size: 0;
				overflow: auto;
				overscroll-behavior: contain;
				scrollbar-width: thin;

				&::-webkit-scrollbar {
					width: 5px;
					height: 5px;
				}

				&::-webkit-scrollbar-thumb {
					background: rgba(128, 128, 128, 0.75);
				}
			}

			@media (prefers-reduced-motion: reduce) {
				dialog, dialog::backdrop, #panel {
					animation: none;
				}
			}
		`
	}

	protected override get template() {
		return html`
			<dialog part='dialog' aria-label=${ifDefined(this.label)} ${this.controller.dialog()}>
				<div id='panel' part='panel' ${this.controller.panel()}>
					<slot name='handle'>${this.handleTemplate}</slot>
					<div id='content' part='content'>
						<slot></slot>
					</div>
				</div>
				${this.topLayerTemplate}
			</dialog>
		`
	}

	protected get handleTemplate() {
		return html`
			<button part='handle' aria-label=${t('Close')} ${this.controller.handle()}></button>
		`
	}

	protected get topLayerTemplate() {
		return html`
			<slot name='top-layer'></slot>
		`
	}
}

declare global {
	interface HTMLElementTagNameMap {
		'mo-sheet': Sheet
	}
}