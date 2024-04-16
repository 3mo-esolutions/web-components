import { css } from '@a11d/lit'
import { PageComponent, type PageParameters } from '@a11d/lit-application'

export abstract class PageSettings<T extends PageParameters = void> extends PageComponent<T> {
	static override get styles() {
		return css`
			mo-list-item, mo-checkbox-list-item, mo-radio-list-item, mo-switch-list-item {
				justify-content: space-between;
				font-size: medium;
				background: var(--mo-color-surface);
				border-radius: var(--mo-border-radius);
				box-shadow: var(--mo-shadow);
			}
		`
	}
}