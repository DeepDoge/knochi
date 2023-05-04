import type { BigNumber, BytesLike, Contract, ContractTransaction, Overrides as Overrides_ } from "ethers"
import type { Booleans, ComposeLeft, Fn, Match, Objects, Pipe, Tuples, _ } from "hotscript"

export type TypifyContract<TAbi extends Abi> = Contract & {
	functions: Pipe<TAbi, [Tuples.Filter<Booleans.Extends<{ type: "function" }>>, Tuples.Map<ToFunction>, Tuples.ToUnion, Objects.FromEntries]>
	// filters: Pipe<TAbi, [Tuples.Filter<Booleans.Extends<{ type: "event" }>>, ]>
}

type PromiseOrValue<T> = T | Promise<T>

interface ToPromise extends Fn {
	return: Promise<this["arg0"]>
}

interface ToType extends Fn {
	$type: this["arg0"]
	return: Pipe<
		this["$type"],
		[
			Match<
				[
					Match.With<`${"u" | ""}int${number | ""}` | `${"u" | ""}fixed`, BigNumber>,
					Match.With<`bytes${number | ""}`, PromiseOrValue<BytesLike>>,
					Match.With<"string", string>,
					Match.With<"bool", boolean>,
					Match.With<"address", string>,
					Match.With<_, unknown>
				]
			>
		]
	>
}

type Overrides = Overrides_ & { from?: PromiseOrValue<string> } & {}

interface ToFunction extends Fn {
	$name: this["arg0"]["name"]
	$inputs: this["arg0"]["inputs"]
	$outputs: this["arg0"]["outputs"]

	$inputsAsArgs: Pipe<this["$inputs"], [Tuples.Map<ComposeLeft<[Objects.Get<"type">, ToType]>>]>
	$outputsAsTuple: Pipe<this["arg0"]["outputs"], [Tuples.Map<ComposeLeft<[Objects.Get<"type">, ToType]>>]>

	return: [
		this["$name"],
		(
			...args: Pipe<[overrides?: Overrides], [Tuples.Concat<this["$inputsAsArgs"]>]>
		) => Pipe<
			this["$outputsAsTuple"]["length"],
			[
				Match<
					[
						Match.With<0, ContractTransaction>,
						Match.With<1, Pipe<this["$outputsAsTuple"], [Tuples.Head]>>,
						Match.With<_, this["$outputsAsTuple"]>
					]
				>,
				ToPromise
			]
		>
	]
}

export type Abi = readonly Abi.Item[]
export namespace Abi {
	export type Item = FunctionItem | EventItem

	type Argument = {
		type: string
		name: string
		internalType: string
	}

	export type FunctionItem = {
		type: FunctionItem.Type
		name: string
		inputs: readonly FunctionItem.Input[]
		outputs: readonly FunctionItem.Output[]
		stateMutability: FunctionItem.StateMutability
	}
	export namespace FunctionItem {
		export type Type = "function" | "constructor"
		export type Input = Argument & {}
		export type Output = Argument & {}
		export type StateMutability = "pure" | "view" | "constant" | "nonpayable" | "payable"
	}

	export type EventItem = {
		type: EventItem.Type
		name: string
		inputs: readonly EventItem.Input[]
		anonymous: boolean
	}
	export namespace EventItem {
		export type Type = "event"
		export type Input = Argument & { indexed: boolean }
	}
}
