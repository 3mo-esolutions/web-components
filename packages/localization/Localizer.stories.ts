import type { Meta, StoryObj } from '@storybook/web-components-vite'
import { html } from '@a11d/lit'
import { useState } from 'storybook/preview-api'
import { Localizer } from './index.js'

export default {
	title: 'Foundations / Localization',
} satisfies Meta

Localizer.dictionaries.add({
	en: {
		'You have ${count:pluralityNumber} new messages': [
			'You have ${count} new message',
			'You have ${count} new messages',
		],
	},
	de: {
		'Home': 'Startseite',
		'Inbox (${count:number})': 'Posteingang (${count})',
		'Count': 'Anzahl',
		'Updated on ${date:Date}': 'Aktualisiert am ${date}',
		'You have ${count:pluralityNumber} new messages': [
			'Sie haben ${count} neue Nachricht',
			'Sie haben ${count} neue Nachrichten',
		],
	},
	fa: {
		'Home': 'خانه',
		'Count': 'تعداد',
		'Inbox (${count:number})': 'صندوق ورودی (${count})',
		'You have ${count:pluralityNumber} new messages': 'شما ${count} پیام جدید دارید',
		'Updated on ${date:Date}': 'بروزرسانی شده در ${date}',
	},
})

/** Switch the language in the toolbar to see the translations; a right-to-left language also turns the page around. */
export const Default: StoryObj = {
	render: () => {
		const [count, setCount] = useState(1)
		return html`
			<mo-flex gap='16px' style='max-width: 360px'>
				<mo-flex direction='horizontal' gap='20px'>
					<mo-anchor>${t('Home')}</mo-anchor>
					<mo-anchor>${t('Inbox (${count:number})', { count })}</mo-anchor>
				</mo-flex>
				<mo-field-number label=${t('Count')} .value=${count} @change=${(event: CustomEvent<number | undefined>) => setCount(event.detail ?? 0)}></mo-field-number>
				<span>${t('You have ${count:pluralityNumber} new messages', { count })}</span>
				<span style='opacity: 0.5'>${t('Updated on ${date:Date}', { date: new Date() })}</span>
			</mo-flex>
		`
	},
}