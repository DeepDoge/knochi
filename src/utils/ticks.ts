import { signal } from "master-ts/core"

export const oneSecondTick = signal(Date.now(), (set) => {
	set(Date.now())
	const interval = setInterval(() => set(Date.now()), 1000)
	return () => clearInterval(interval)
})

export const tenSecondsTick = signal(Date.now(), (set) => {
	set(Date.now())
	const interval = setInterval(() => set(Date.now()), 10000)
	return () => clearInterval(interval)
})

export const oneMinuteTick = signal(Date.now(), (set) => {
	set(Date.now())
	const interval = setInterval(() => set(Date.now()), 60000)
	return () => clearInterval(interval)
})

export const tenMinutesTick = signal(Date.now(), (set) => {
	set(Date.now())
	const interval = setInterval(() => set(Date.now()), 600000)
	return () => clearInterval(interval)
})

export const oneHourTick = signal(Date.now(), (set) => {
	set(Date.now())
	const interval = setInterval(() => set(Date.now()), 3600000)
	return () => clearInterval(interval)
})
