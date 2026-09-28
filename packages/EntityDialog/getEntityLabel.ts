import '@3mo/localization'

export function getEntityLabel<T extends object>(entity: T) {
	return entity.toString === Object.prototype.toString ? t('Entity') : entity.toString() || t('Entity')
}