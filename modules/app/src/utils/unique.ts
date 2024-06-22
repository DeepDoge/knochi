let counter = 0n
export function uniqueId(prefix = "") {
	const random = Math.random().toString(16).substring(2)
	return `${prefix}-${random}-${counter++}`
}
