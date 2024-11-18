export function fractalHash(n: bigint, seed: bigint) {
	let x = n ^ seed; // XOR the seed with the index (as a bigint)
	x = (x * 0x517cc1b727220a95n) & 0xffffffffffffffffn; // Multiply and truncate, still as bigint
	x = (x ^ (x >> 32n)) & 0xffffffffffffffffn; // XOR and shift for more randomness
	return x;
}
