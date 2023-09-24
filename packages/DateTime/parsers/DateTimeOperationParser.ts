import { DateTimeParser } from './DateTimeParser.js'

type Unit = 'year' | 'month' | 'week' | 'day' | 'hour' | 'minute' | 'second' | 'millisecond'

export class DateTimeOperationParser extends DateTimeParser {
	private static readonly units = ['year', 'month', 'week', 'day', 'hour', 'minute', 'second', 'millisecond'] as const
	private static readonly splitterRegex = /^\s*(?<operation>[+-])\s*(?<number>\d+)?\s*(?<unitSuffix>[^\d\s.,-\/\\]+)?$/u

	private readonly unitBySuffixes = new Map<string, Unit>()

	constructor(...parameters: ConstructorParameters<typeof DateTimeParser>) {
		super(...parameters)
		this.extractUnitBySuffixes()
	}

	private extractUnitBySuffixes() {
		for (const unit of DateTimeOperationParser.units) {
			this.addUnitBySuffixForFormatter(new Intl.NumberFormat(this.language, { style: 'unit', unit, unitDisplay: 'long' }))
			this.addUnitBySuffixForFormatter(new Intl.NumberFormat(this.language, { style: 'unit', unit, unitDisplay: 'short' }))
			this.addUnitBySuffixForFormatter(new Intl.NumberFormat(this.language, { style: 'unit', unit, unitDisplay: 'narrow' }))
		}
	}

	private addUnitBySuffixForFormatter(formatter: Intl.NumberFormat) {
		const unit = formatter.resolvedOptions().unit as Unit
		for (const parts of [formatter.formatToParts(1), formatter.formatToParts(2)]) {
			const suffix = parts
				.find(part => part.type === 'unit')
				?.value
				.trim()
				.replace('.', '')
				.toLocaleLowerCase()

			if (suffix) {
				this.unitBySuffixes.set(suffix, unit)
			}
		}
	}

	parse(text: string, referenceDate = new DateTime) {
		const { operation, number, unitSuffix } = text.match(DateTimeOperationParser.splitterRegex)?.groups ?? {}

		const signedNumber = Number(`${operation}${number}`)
		const unit = this.getUnit(unitSuffix)

		if (!unit || isNaN(signedNumber)) {
			return undefined
		}

		switch (unit) {
			case 'year': return referenceDate.add({ years: signedNumber })
			case 'month': return referenceDate.add({ months: signedNumber })
			case 'week': return referenceDate.add({ weeks: signedNumber })
			case 'day': return referenceDate.add({ days: signedNumber })
			case 'hour': return referenceDate.add({ hours: signedNumber })
			case 'minute': return referenceDate.add({ minutes: signedNumber })
			case 'second': return referenceDate.add({ seconds: signedNumber })
			case 'millisecond': return referenceDate.add({ milliseconds: signedNumber })
		}
	}

	private getUnit(suffix?: string) {
		suffix = suffix?.trim()?.toLocaleLowerCase()
		return !suffix ? 'day' : this.unitBySuffixes.get(suffix)
	}
}