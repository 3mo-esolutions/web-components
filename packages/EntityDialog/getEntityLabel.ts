import { label } from '@a11d/metadata'
import { Localizer } from '@3mo/localization'

Localizer.dictionaries.add('de', { 'Entity': 'Eintrag' })

export function getEntityLabel<T extends object>(entity: T) {
	const _label = label.get(entity.constructor as Constructor<T>) || t('Entity')
	const _string = entity.toString === Object.prototype.toString ? undefined : (entity.toString() || undefined)
	return [_label, _string ? `"${_string}"` : undefined].filter(Boolean).join(' ')
}