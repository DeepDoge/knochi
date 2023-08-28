import { $ } from "master-ts/library/$"

export const oneSecondTick = $.readable<number>((set) => {
	set(Date.now())
	const interval = setInterval(() => set(Date.now()), 1000)
	return () => clearInterval(interval)
})

export const tenSecondsTick = $.readable<number>((set) => {
	set(Date.now())
	const interval = setInterval(() => set(Date.now()), 10000)
	return () => clearInterval(interval)
})

export const oneMinuteTick = $.readable<number>((set) => {
	set(Date.now())
	const interval = setInterval(() => set(Date.now()), 60000)
	return () => clearInterval(interval)
})

export const tenMinutesTick = $.readable<number>((set) => {
	set(Date.now())
	const interval = setInterval(() => set(Date.now()), 600000)
	return () => clearInterval(interval)
})

export const oneHourTick = $.readable<number>((set) => {
	set(Date.now())
	const interval = setInterval(() => set(Date.now()), 3600000)
	return () => clearInterval(interval)
})
