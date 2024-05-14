import { type HTMLTemplateResult, property } from '@a11d/lit'
import { DataGridColumnComponent } from '../DataGridColumnComponent.js'
import { DataGridColumn, type DataGridColumnAlignment } from '../../DataGridColumn.js'

export abstract class DataGridColumnNumberBase<TData> extends DataGridColumnComponent<TData, number> {
	@property() sumHeading: string | undefined = undefined
	@property() override textAlign: DataGridColumnAlignment = 'end'

	override get column() {
		return new DataGridColumn({
			...super.column,
			sumHeading: this.sumHeading,
			getSumTemplate: this.getSumTemplate.bind(this),
		})
	}

	protected getNumber(value: number | undefined) {
		return Number.isFinite(value) ? value : undefined
	}

	abstract getSumTemplate(sum: number): HTMLTemplateResult
}