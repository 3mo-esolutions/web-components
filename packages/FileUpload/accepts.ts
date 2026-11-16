/** Whether a file matches a comma-separated list of MIME types and file extensions, as the "accept" attribute of a file input. */
export function accepts(file: File, accept?: string) {
	const tokens = accept?.split(',').map(token => token.trim().toLowerCase()).filter(Boolean) ?? []
	const name = file.name.toLowerCase()
	const type = file.type.toLowerCase()
	return tokens.length === 0 || tokens.some(token => {
		if (token.startsWith('.')) {
			return name.endsWith(token)
		}
		if (token.endsWith('/*')) {
			return type.startsWith(token.slice(0, -1))
		}
		return type === token
	})
}
