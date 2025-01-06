import type { Meta, StoryObj } from '@storybook/web-components'
import { html } from '@a11d/lit'
import p from './package.json'
import './index.js'
import { EntityDialogComponent } from './index.js'
import { type EntityId } from '../FetchableDialog/FetchableDialogComponent.js'

export default {
	title: 'Entity Dialog',
	component: 'mo-entity-dialog',
	package: p,
} as Meta

@label(t('Data'))
class Data {
	id!: number
	name!: string

	constructor(init?: Partial<Data>) {
		Object.assign(this, init)
	}

	toString() {
		return this.name
	}
}

class DialogData extends EntityDialogComponent<Data> {
	protected override entity = new Data()
	protected override fetch = (id: EntityId) => new Promise<Data>(resolve => setTimeout(() => resolve(new Data({ id: Number(id), name: 'Test' })), 1000))
	protected override save = (entity: Data) => new Promise<Data>(resolve => setTimeout(() => resolve(entity), 1000))
	protected override delete = () => new Promise<void>(resolve => setTimeout(() => resolve(), 1000))

	protected override get template() {
		const { bind } = this.entityBinder
		return html`
			<mo-entity-dialog>
				<mo-field-number disabled label='Id' ${bind('id')}></mo-field-number>
				<mo-field-text label='Name' ${bind({ keyPath: 'name', event: 'input' })}></mo-field-text>
			</mo-entity-dialog>
		`
	}
}

customElements.define('story-dialog-data', DialogData)

export const DialogComponent: StoryObj = {
	render: () => html`
		<mo-button @click=${() => new DialogData({ id: 1 }).confirm()}>Open</mo-button>
	`,
}