import type { TypedContract } from "@nomadshiba/typed-contracts/ethers6";
import { BytesLike, Contract, ContractRunner } from "ethers";
import { Address, Hex } from "~/shared/solidity/primatives";
import { PostIndexer_ABI } from "./artifacts/PostIndexer";
import { PostStore_ABI } from "./artifacts/PostStore";
import { PostStore_Plain_ABI } from "./artifacts/PostStore_Plain";

type PrimativeTypeMap = TypedContract.PrimativeTypeMap & {
	[K in `bytes${bigint | ""}`]: {
		input: BytesLike;
		output: K extends `bytes${infer TLength}` ?
			TLength extends `${bigint}` ? Hex<TLength>
			: TLength extends "" ? Hex<`${bigint}`>
			: never
		:	never;
	};
} & {
	address: {
		output: Address;
	};
};

export namespace PostStore {
	export type Contract = TypedContract<PostStore_ABI, PrimativeTypeMap>;
	export function connect(runner: ContractRunner, address: string) {
		return new Contract(address, PostStore_ABI).connect(runner) as Contract;
	}
}

export namespace PostStore_Plain {
	export type Contract = TypedContract<PostStore_Plain_ABI, PrimativeTypeMap>;
	export function connect(runner: ContractRunner, address: string) {
		return new Contract(address, PostStore_Plain_ABI).connect(runner) as Contract;
	}
}

export namespace PostIndexer {
	export type Contract = TypedContract<PostIndexer_ABI, PrimativeTypeMap>;
	export function connect(runner: ContractRunner, address: string) {
		return new Contract(address, PostIndexer_ABI).connect(runner) as Contract;
	}
}
