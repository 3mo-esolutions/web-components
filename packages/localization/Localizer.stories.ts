import type { Meta, StoryObj } from '@storybook/web-components'
import { bind, component, Component, html, state } from '@a11d/lit'
import p from './package.json'
import './index.js'
import { Localizer, type LanguageCode } from './index.js'

export default { title: 'Localization', package: p } as Meta

Localizer.dictionaries.add('en', {
	'You have ${count:pluralityNumber} new messages': [
		'You have ${count} new message',
		'You have ${count} new messages',
	]
})

Localizer.dictionaries.add('de', {
	'Home': 'Startseite',
	'Inbox (${count:number})': 'Posteingang (${count})',
	'Count': 'Anzahl',
	'Updated on ${date:Date}': 'Aktualisiert am ${date}',
	'Language': 'Sprache',
	'You have ${count:pluralityNumber} new messages': [
		'Sie haben ${count} neue Nachricht',
		'Sie haben ${count} neue Nachrichten',
	]
})

Localizer.dictionaries.add('fa', {
	'Home': 'خانه',
	'Count': 'تعداد',
	'Inbox (${count:number})': 'صندوق ورودی (${count})',
	'You have ${count:pluralityNumber} new messages': 'شما ${count} پیام جدید دارید',
	'Updated on ${date:Date}': 'بروزرسانی شده در ${date}',
	'Language': 'زبان',
})

@component('story-localizer')
export class StoryLocalizer extends Component {
	@state() count = 1

	protected override get template() {
		return html`
			<mo-flex>
				<mo-flex direction='horizontal' alignItems='center' justifyContent='space-between'>
					<mo-flex direction='horizontal' gap='20px'>
						<mo-anchor>${t('Home')}</mo-anchor>
						<mo-anchor>${t('Inbox (${count:number})', { count: this.count })}</mo-anchor>
					</mo-flex>
					<mo-flex direction='horizontal' gap='8px'>
						<mo-field-number label=${t('Count')} ${bind(this, 'count')}></mo-field-number>
						<mo-field-select label=${t('Language')}
							value=${Localizer.languages.current}
							@change=${(e: CustomEvent<LanguageCode>) => Localizer.languages.current = e.detail}
						>
							<mo-option value='en'>English</mo-option>
							<mo-option value='de'>Deutsch</mo-option>
							<mo-option value='fa'>فارسی</mo-option>
						</mo-field-select>
					</mo-flex>
				</mo-flex>
				<mo-flex alignItems='center' justifyContent='center' gap='14px' style='height: 400px'>
					<mo-icon icon='inbox'></mo-icon>
					${t('You have ${count:pluralityNumber} new messages', { count: this.count })}
					<span style='opacity: 0.3'>${t('Updated on ${date:Date}', { date: new Date() })}</span>
				</mo-flex>
			</mo-flex>
		`
	}
}

export const Default: StoryObj = {
	render: () => html`<story-localizer></story-localizer>`
}

globalThis.Localizer = Localizer