import '@3mo/date-time'

/** A line of an order: a product, how much of it, and what it costs. */
export class Position {
	rank!: number
	code!: string
	name!: string
	quantity!: number
	unit!: string
	price!: number
	discount!: number
	taxRate!: number
	deliveryDate!: DateTime
	isSample!: boolean
	note!: string

	constructor(init: Partial<Position>) {
		Object.assign(this, init)
	}

	get amount() {
		return this.isSample ? 0 : Math.round(this.quantity * this.price * (100 - this.discount)) / 100
	}
}

const materials = ['Steel', 'Brass', 'Oak', 'Copper', 'Linen', 'Ceramic', 'Glass', 'Cork', 'Rubber', 'Walnut']

const products: ReadonlyArray<readonly [name: string, unit: string, price: number]> = [
	['Patch cable', 'pcs', 4.9],
	['Rack cabinet', 'pcs', 1290],
	['Cooling unit', 'pcs', 849.5],
	['Coffee beans', 'kg', 18.4],
	['Weld seam sealant', 'l', 23.75],
	['Ink pad', 'pcs', 6.2],
	['Wine bottle', 'pcs', 2.35],
	['Grow light', 'pcs', 139],
	['Nutrient pump', 'pcs', 212.9],
	['Drafting table', 'pcs', 468],
	['Blueprint roll', 'm', 3.1],
	['Hardware security key', 'pcs', 54],
	['Plate', 'm²', 71.6],
]

const day = 24 * 60 * 60 * 1000

/** As many positions as asked for, each a product in a material, the same ones on every call. */
export function positions(count: number) {
	return Array.from({ length: count }, (_, index) => {
		const [name, unit, price] = products[index % products.length]!
		const material = materials[(index * 7) % materials.length]!
		return new Position({
			rank: index + 1,
			code: `${material.slice(0, 2).toUpperCase()}-${String(10000 + index * 37).slice(-5)}`,
			name: `${material} ${name.toLowerCase()}`,
			quantity: 1 + (index * 13) % 48,
			unit,
			price,
			discount: index % 5 === 0 ? 10 : index % 11 === 0 ? 2.5 : 0,
			taxRate: index % 6 === 0 ? 7 : 19,
			deliveryDate: new DateTime(Date.UTC(2026, 2, 2) + (index % 40) * day),
			isSample: index % 17 === 0,
			note: index % 4 === 0 ? 'Deliver with the rest of the order' : '',
		})
	})
}
