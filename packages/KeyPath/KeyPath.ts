/* eslint-disable no-var */
function getKeyPath<T>(keyPath: KeyPathOf<T>) {
	return keyPath
}

function getValueByKeyPath<T, KeyPath extends KeyPathOf<T>>(object: T, keyPath: KeyPath): KeyPathValueOf<T, KeyPath> {
	return !keyPath ? undefined : keyPath
		.split('.')
		.reduce((value: any, key) => value === undefined || value === null ? value : value[key], object)
}

function setValueByKeyPath<T, KeyPath extends KeyPathOf<T>>(object: T, keyPath: KeyPath, value: KeyPathValueOf<T, KeyPath>) {
	const keys = keyPath.split('.')
	const lastKey = keys[keys.length - 1]!
	const otherKeysButLast = keys.slice(0, keys.length - 1)
	const lastObject = getValueByKeyPath(object, otherKeysButLast.join('.') as KeyPath) ?? object as any
	if (lastObject !== undefined || lastObject !== null) {
		lastObject[lastKey] = value
	}
}

type GetKeyPathFunction = typeof getKeyPath
type GetValueByKeyPathFunction = typeof getValueByKeyPath
type SetValueByKeyPathFunction = typeof setValueByKeyPath

globalThis.getKeyPath = getKeyPath
globalThis.getValueByKeyPath = getValueByKeyPath
globalThis.setValueByKeyPath = setValueByKeyPath

declare global {
	var getKeyPath: GetKeyPathFunction
	var getValueByKeyPath: GetValueByKeyPathFunction
	var setValueByKeyPath: SetValueByKeyPathFunction

	type KeyPathOf<T> =
		object extends T ? string :
		T extends ReadonlyArray<any> ? Extract<keyof T, `${number}`> | SubKeyPathOf<T, Extract<keyof T, `${number}`>> :
		T extends object ? Extract<keyof T, string> | SubKeyPathOf<T, Extract<keyof T, string>> :
		never

	type KeyPathValueOf<T, KeyPath extends string = KeyPathOf<T>> =
		KeyPath extends keyof T ? T[KeyPath] :
		KeyPath extends `${infer K}.${infer R}` ? K extends keyof T ? KeyPathValueOf<T[K], R> : unknown :
		unknown
}

type SubKeyPathOf<T, K extends string> = K extends keyof T ? `${K}.${KeyPathOf<T[K]>}` : never