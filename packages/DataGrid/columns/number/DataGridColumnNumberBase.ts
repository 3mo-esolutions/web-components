import { type HTMLTemplateResult, property } from '@a11d/lit'
import { DataGridColumn } from '../DataGridColumn.js'
import type { DataGridColumnAlignment } from '../../ColumnDefinition.js'

export abstract class DataGridColumnNumberBase<TData> extends DataGridColumn<TData, number> {
	@property() sumHeading: string | undefined = undefined
	@property() override textAlign: DataGridColumnAlignment = 'end'

	override get definition() {
		return {
			...super.definition,
			sumHeading: this.sumHeading,
			getSumTemplate: this.getSumTemplate.bind(this),
		}
	}

	protected getNumber(value: number | undefined) {
		return Number.isFinite(value) ? value : undefined
	}

	abstract getSumTemplate(sum: number): HTMLTemplateResult
}