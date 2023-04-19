import { $ } from "master-ts/library/$"

export const oneSecondTick = $.readable((set) => {
	const interval = setInterval(() => set(Date.now()), 1000)
	return () => clearInterval(interval)
})

export const tenSecondsTick = $.readable((set) => {
	const interval = setInterval(() => set(Date.now()), 10000)
	return () => clearInterval(interval)
})

export const oneMinuteTick = $.readable((set) => {
	const interval = setInterval(() => set(Date.now()), 60000)
	return () => clearInterval(interval)
})

export const tenMinutesTick = $.readable((set) => {
	const interval = setInterval(() => set(Date.now()), 600000)
	return () => clearInterval(interval)
})

export const oneHourTick = $.readable((set) => {
	const interval = setInterval(() => set(Date.now()), 3600000)
	return () => clearInterval(interval)
})
