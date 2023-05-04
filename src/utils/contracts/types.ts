import type { Address } from "@/utils/address"
import type { BigNumber, BytesLike, Contract, ContractInterface, ContractTransaction, Overrides } from "ethers"
import type { Booleans, ComposeLeft, Fn, Objects, Pipe, Tuples } from "hotscript"

type PromiseOrValue<T> = T | Promise<T>

interface ToType extends Fn {
	$type: this["arg0"]
	return: this["$type"] extends `${"u" | ""}int${number | ""}` | `${"u" | ""}fixed`
		? BigNumber
		: this["$type"] extends `bytes${number | ""}`
		? PromiseOrValue<BytesLike>
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

	$args: Pipe<this["$inputs"], [Tuples.Map<ComposeLeft<[Objects.Get<"type">, ToType]>>]>
	return: [
		this["arg0"]["name"],
		(
			...args: readonly [...args: this["$args"], overrides?: Overrides & { from?: PromiseOrValue<string> }]
		) => Promise<
			this["$outputs"] extends readonly []
				? ContractTransaction
				: this["$outputs"] extends readonly [any]
				? Pipe<this["arg0"]["outputs"], [Tuples.Map<ComposeLeft<[Objects.Get<"type">, ToType]>>, Tuples.At<0>]>
				: Pipe<this["arg0"]["outputs"], [Tuples.Map<ComposeLeft<[Objects.Get<"type">, ToType]>>]>
		>
	]
}

export type TypifyContract<TAbi extends ContractInterface> = Contract & {
	functions: Pipe<TAbi, [Tuples.Filter<Booleans.Extends<{ type: "function" }>>, Tuples.Map<ToFunction>, Tuples.ToUnion, Objects.FromEntries]>
	// filters: Pipe<TAbi, [Tuples.Filter<Booleans.Extends<{ type: "event" }>>, ]>
}
