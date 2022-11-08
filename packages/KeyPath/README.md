# KeyPath

A set of type-safe utilities for working with objects and their properties with support for array members.

- `getKeyPath` - A type-safe function to get a key-path.
- `getValueByKeyPath` - A function to extract the value by a given key-path.
- `setValueByKeyPath` - A function to set the value by a given key-path.

```ts
const customer = {
	name: 'John Doe',
	addresses: [
		{ street: '123 Main St', city: 'Anytown' },
		{ street: '456 Elm St', city: 'Anytown' },
	] as const,
}

const keyPath = getKeyPath<typeof customer>('addresses.0.street') // 'addresses.0.street'
const value = getValueByKeyPath(customer, 'addresses.0.street') // '123 Main St'
setValueByKeyPath(customer, 'addresses.0.street', '180 Azadi St')
/*
{
	name: 'John Doe',
	addresses: [
		{ street: '180 Azadi St', city: 'Anytown' },
		{ street: '456 Elm St', city: 'Anytown' },
	] as const,
}
*/
```