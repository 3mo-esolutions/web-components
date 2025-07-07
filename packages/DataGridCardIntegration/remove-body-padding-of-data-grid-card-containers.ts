import { DataGrid } from '@3mo/data-grid'
import { Card } from '@3mo/card'

const key = '__remove-body-padding-of-data-grid-card-containers__' as any

DataGrid.addInitializer(async instance => {
	const dataGrid = instance
	await dataGrid.updateComplete
	dataGrid.dispatchEvent(new CustomEvent(key, { bubbles: true, composed: true, cancelable: true, detail: dataGrid }))
})

Card.addInitializer(instance => {
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
})