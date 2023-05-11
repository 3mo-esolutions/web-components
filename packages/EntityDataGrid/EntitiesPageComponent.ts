/* eslint-disable @typescript-eslint/no-unused-vars */
import { css } from '@a11d/lit'
import { PageComponent, PageParameters } from '@a11d/lit-application'

export abstract class EntitiesPageComponent<_TEntity extends object, T extends PageParameters = void> extends PageComponent<T> {
	static override get styles() {
		return css`
			mo-card {
				--mo-card-body-padding: 0px;
				position: relative;
			}
		`
	}
}