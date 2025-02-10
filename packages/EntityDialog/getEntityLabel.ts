import { Localizer } from '@3mo/localization'

Localizer.dictionaries.add('de', { 'Entity': 'Eintrag' })

export function getEntityLabel<T extends object>(entity: T) {
	return entity.toString === Object.prototype.toString ? t('Entity') : entity.toString() || t('Entity')
}