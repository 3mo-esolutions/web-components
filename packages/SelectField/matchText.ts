/** Case and accents folded away, so text compares the way a reader sees it. */
function fold(text: string) {
	return text.normalize('NFD').replaceAll(/\p{M}/gu, '').toLowerCase()
}

/** Whether the text holds every word of the keyword, in any order and however it is spaced. */
export function textMatches(text: string | null | undefined, keyword: string) {
	const content = fold(text ?? '').replaceAll(/\s+/g, '')
	return !!content && fold(keyword).split(/\s+/).every(word => content.includes(word))
}

/** Whether both read the same, whatever their case, accents and spacing. */
export function textEquals(text: string, other: string) {
	const compact = (value: string) => fold(value).replaceAll(/\s+/g, ' ').trim()
	return compact(text) === compact(other)
}
