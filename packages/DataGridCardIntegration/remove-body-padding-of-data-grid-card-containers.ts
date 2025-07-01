import { ReactiveElement } from '@a11d/lit'
import type { DataGrid } from '@3mo/data-grid'
import type { Card } from '@3mo/card'

const key = '__remove-body-padding-of-data-grid-card-containers__' as any

let CardConstructor: typeof Card | undefined = undefined
let DataGridConstructor: typeof DataGrid | undefined = undefined

ReactiveElement.addInitializer(async instance => {
	DataGridConstructor ??= customElements.get('mo-data-grid') as typeof DataGrid
	CardConstructor ??= customElements.get('mo-card') as typeof Card

	if (!DataGridConstructor || !CardConstructor) {
		// eslint-disable-next-line no-console
		console.warn('Cannot apply integration of @3mo/data-grid and @3mo/card as one of the components is not registered')
		return
	}

	if (instance instanceof DataGridConstructor) {
		const dataGrid = instance
		await dataGrid.updateComplete
		dataGrid.dispatchEvent(new CustomEvent(key, { bubbles: true, composed: true, cancelable: true, detail: dataGrid }))
	}

	if (instance instanceof CardConstructor) {
		const card = instance as Card

		const handle = (e: CustomEvent<DataGrid<any>>) => {
			e.stopPropagation()
			const hasTop = e.detail.hasToolbar && !!card.renderRoot.querySelector('slot[name=header][data-empty]')
			const hasBottom = card['slotController'].getAssignedElements('').length > 1
			const hasPadding = !!getComputedStyle(card).getPropertyValue('--mo-card-body-padding')
			if (!hasPadding) {
				card.style.setProperty('--mo-card-body-padding', `${hasTop ? 1 : 0}rem 0 ${hasBottom ? 1 : 0}rem`)
			}
		}

		card.addController({
			hostConnected: () => card.addEventListener(key, handle),
			hostDisconnected: () => card.removeEventListener(key, handle),
		})
	}
})