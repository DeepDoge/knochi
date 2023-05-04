import type { Address } from "@/utils/address"
import type { BigNumber, BytesLike, Contract, ContractInterface, ContractTransaction, Overrides } from "ethers"
import type { Booleans, Call, Fn, Objects, Pipe, Tuples } from "hotscript"

interface ToType extends Fn {
	$type: this["arg0"]["type"]
	return: this["$type"] extends `${"u" | ""}${"fixed" | "int"}${number | ""}`
		? BigNumber
		: this["$type"] extends `bytes${number | ""}`
		? Promise<BytesLike> | BytesLike
		: this["$type"] extends "string"
		? string
		: this["$type"] extends "bool"
		? boolean
		: this["$type"] extends "address"
		? Address
		: unknown
}

interface ToFunction extends Fn {
	$inputs: this["arg0"]["inputs"]
	$outputs: this["arg0"]["outputs"]

	$args: Call<Tuples.Map<ToType>, this["$inputs"]>
	return: [
		this["arg0"]["name"],
		(
			...args: readonly [...args: this["$args"], overrides?: Overrides & { from?: Promise<string> | string }]
		) => Promise<
			this["$outputs"] extends readonly []
				? ContractTransaction
				: this["$outputs"] extends readonly [any]
				? Call<Tuples.Map<ToType>, this["arg0"]["outputs"]>[0]
				: Call<Tuples.Map<ToType>, this["arg0"]["outputs"]>
		>
	]
}

export type TypifyContract<TAbi extends ContractInterface> = Contract & {
	functions: Pipe<TAbi, [Tuples.Filter<Booleans.Extends<{ type: "function" }>>, Tuples.Map<ToFunction>, Tuples.ToUnion, Objects.FromEntries]>
	// filters: Pipe<TAbi, [Tuples.Filter<Booleans.Extends<{ type: "event" }>>, ]>
}
