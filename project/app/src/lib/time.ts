import { language } from "~/lib/language";

const intervals = [
	[60, "second"], // seconds to minutes
	[60, "minute"], // minutes to hours
	[24, "hour"], // hours to days
	[7, "day"], // days to weeks
	[4.34524, "week"], // weeks to months (average month length)
	[12, "month"], // months to years
	[Number.POSITIVE_INFINITY, "year"], // beyond years
] as const satisfies [number, Intl.RelativeTimeFormatUnit][];

type IntervalUnit = (typeof intervals)[number][1];

export function getRelativeTime(date: Date, locale: string): string {
	const relativeTimeFormat = new Intl.RelativeTimeFormat(locale, { numeric: "auto" });

	const now = Date.now();
	const targetTime = date.getTime();

	const differenceInSeconds = Math.round((targetTime - now) / 1000);

	let value = differenceInSeconds;
	let unit: IntervalUnit = "second";

	for (const [interval, currentUnit] of intervals) {
		if (Math.abs(value) < interval) {
			unit = currentUnit;
			break;
		}
		value /= interval;
	}

	return relativeTimeFormat.format(Math.round(value), unit);
}

export function getRelativeTimeSignal(date: Date) {
	return language.derive((language) => getRelativeTime(date, language));
}
