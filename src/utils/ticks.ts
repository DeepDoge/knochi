import { $ } from "master-ts/library/$"

export const secondTick = $.readable(Date.now(), (set) => {
	const interval = setInterval(() => set(Date.now()), 1000)
	return () => clearInterval(interval)
})

export const tenSecondsTick = $.readable(Date.now(), (set) => {
	const interval = setInterval(() => set(Date.now()), 10000)
	return () => clearInterval(interval)
})
