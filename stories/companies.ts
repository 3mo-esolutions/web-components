import '@3mo/date-time'

export type Company = { readonly id: number, readonly name: string, readonly city: string, readonly country: string }

/** Companies from the same shows as the `people`. */
export const companies: ReadonlyArray<Company> = [
	{ id: 1, name: 'E Corp', city: 'New York', country: 'US' },
	{ id: 2, name: 'Allsafe Cybersecurity', city: 'New York', country: 'US' },
	{ id: 3, name: 'Two Whales Diner', city: 'Seattle', country: 'US' },
	{ id: 4, name: 'Serenity Freight', city: 'Toronto', country: 'CA' },
	{ id: 5, name: 'Ankh-Morpork Post Office', city: 'London', country: 'GB' },
	{ id: 6, name: 'Château Picard', city: 'Paris', country: 'FR' },
	{ id: 7, name: 'Arkadia Hydroponics', city: 'Hamburg', country: 'DE' },
	{ id: 8, name: 'Blackwell Academy', city: 'Seattle', country: 'US' },
	{ id: 9, name: 'Moving Castle Architects', city: 'Wien', country: 'AT' },
	{ id: 10, name: 'Aburaya Bathhouse', city: 'Kōbe', country: 'JP' },
]

export type Invoice = {
	readonly id: number
	readonly customer: string
	readonly date: DateTime
	readonly total: number
	readonly positions: ReadonlyArray<string>
}

const orders: ReadonlyArray<readonly [customer: string, total: number, positions: ReadonlyArray<string>]> = [
	['E Corp', 3390, ['1 × Rack cabinet', '8 × Patch panel', '24 × Patch cable', '2 × Cooling unit']],
	['Two Whales Diner', 219.4, ['40 × Coffee beans (kg)', '1 × Pie dish set']],
	['Serenity Freight', 1204.5, ['12 × Steel plate', '4 × Weld seam sealant', '1 × Delivery surcharge']],
	['Ankh-Morpork Post Office', 88.4, ['2,000 × Stamp', '6 × Ink pad']],
	['Château Picard', 762.75, ['300 × Wine bottle', '1 × Cork press']],
	['Arkadia Hydroponics', 429.9, ['2 × Grow light', '1 × Nutrient pump']],
	['Allsafe Cybersecurity', 1580, ['4 × Hardware security key', '1 × Penetration test']],
	['Moving Castle Architects', 312, ['1 × Drafting table', '3 × Blueprint roll']],
]

/** Eighty invoices over the last months, newest first. */
export const invoices: ReadonlyArray<Invoice> = Array.from({ length: 80 }, (_, index) => {
	const [customer, total, positions] = orders[index % orders.length]!
	const date = new Date()
	date.setDate(date.getDate() - index * 3)
	return { id: 24080 - index, customer, date: new DateTime(date.toISOString().slice(0, 10)), total: Math.round(total * (1 + (index % 7) / 10) * 100) / 100, positions }
})

export type Department = { readonly id: number, readonly name: string, readonly headcount: number, readonly teams?: ReadonlyArray<Department> }

/** Departments with their teams. */
export const departments: ReadonlyArray<Department> = [
	{
		id: 1, name: 'Engineering', headcount: 24, teams: [
			{ id: 11, name: 'Platform', headcount: 9, teams: [{ id: 111, name: 'Build', headcount: 4 }, { id: 112, name: 'Runtime', headcount: 5 }] },
			{ id: 12, name: 'Product', headcount: 15 },
		],
	},
	{ id: 2, name: 'Sales', headcount: 11, teams: [{ id: 21, name: 'Inbound', headcount: 6 }] },
	{ id: 3, name: 'Support', headcount: 7 },
]
