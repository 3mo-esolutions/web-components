import type { Meta, StoryObj } from '@storybook/web-components'
import { html } from '@a11d/lit'
import p from './package.json'
import './index.js'

export default {
	title: 'Collapsible List Item',
	component: 'mo-collapsible-list-item',
	package: p,
} as Meta

export const Collapsible: StoryObj = {
	render: () => html`
		<mo-card heading='Navigation Menu' style='--mo-card-body-padding: 0px'>
			<mo-list>
				<mo-list-item>
					<mo-icon style='opacity: 0.66' icon='home'></mo-icon>
					Home
				</mo-list-item>

				<mo-collapsible-list-item>
					<mo-list-item>
						<mo-icon style='opacity: 0.66' icon='inventory_2'></mo-icon>
						Sales
					</mo-list-item>
					<mo-list-item slot='details' style='padding-inline-start: 56px; height: 40px'>Products</mo-list-item>
					<mo-collapsible-list-item slot='details'>
						<mo-list-item style='padding-inline-start: 56px; height: 40px'>Inventory</mo-list-item>
						<mo-list-item slot='details' style='padding-inline-start: 80px; color: var(--mo-color-gray); height: 35px'>Inbound</mo-list-item>
						<mo-list-item slot='details' style='padding-inline-start: 80px; color: var(--mo-color-gray); height: 35px'>Outbound</mo-list-item>
					</mo-collapsible-list-item>
					<mo-list-item slot='details' style='padding-inline-start: 56px; height: 40px'>Categories</mo-list-item>
					<mo-list-item slot='details' style='padding-inline-start: 56px; height: 40px'>Brands</mo-list-item>
				</mo-collapsible-list-item>
			</mo-list>
		</mo-card>
	`
}

export const WithSelection: StoryObj = {
	render: () => html`
		<style>
			mo-collapsible-list-item:has(mo-selectable-list-item[selected]) > mo-list-item:not([slot]) {
				border: 2px dashed var(--mo-color-yellow);
			}
		</style>
		<mo-card id='with-selection' heading='Navigation Menu' style='--mo-card-body-padding: 0px'>
			<mo-selectable-list>
				<mo-selectable-list-item>
					<mo-icon style='opacity: 0.66' icon='home'></mo-icon>
					Home
				</mo-selectable-list-item>

				<mo-collapsible-list-item>
					<mo-list-item>
						<mo-icon style='opacity: 0.66' icon='inventory_2'></mo-icon>
						Sales
					</mo-list-item>
					<mo-selectable-list-item slot='details' style='padding-inline-start: 56px; height: 40px'>Products</mo-selectable-list-item>
					<mo-collapsible-list-item slot='details'>
						<mo-list-item style='padding-inline-start: 56px; height: 40px'>Inventory</mo-list-item>
						<mo-selectable-list-item slot='details' style='padding-inline-start: 80px; color: var(--mo-color-gray); height: 35px'>Inbound</mo-selectable-list-item>
						<mo-selectable-list-item slot='details' style='padding-inline-start: 80px; color: var(--mo-color-gray); height: 35px'>Outbound</mo-selectable-list-item>
					</mo-collapsible-list-item>
					<mo-selectable-list-item slot='details' style='padding-inline-start: 56px; height: 40px'>Categories</mo-selectable-list-item>
					<mo-selectable-list-item slot='details' style='padding-inline-start: 56px; height: 40px'>Brands</mo-selectable-list-item>
				</mo-collapsible-list-item>
			</mo-selectable-list>
		</mo-card>
	`
}