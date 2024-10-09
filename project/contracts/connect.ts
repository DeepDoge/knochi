import { Contract, ContractRunner } from "ethers";
import type { TypedContract } from "typify-contracts/types/ethers6/typedContract";
import { PostIndexer_ABI } from "./artifacts/PostIndexer";
import { PostStore_ABI } from "./artifacts/PostStore";
import { PostStore_Plain_ABI } from "./artifacts/PostStore_Plain";

export namespace PostStore {
	export type Contract = TypedContract<PostStore_ABI>;
	export function connect(runner: ContractRunner, address: string) {
		return new Contract(address, PostStore_ABI).connect(runner) as Contract;
	}
}

export namespace PostStore_Plain {
	export type Contract = TypedContract<PostStore_Plain_ABI>;
	export function connect(runner: ContractRunner, address: string) {
		return new Contract(address, PostStore_Plain_ABI).connect(runner) as Contract;
	}
}

export namespace PostIndexer {
	export type Contract = TypedContract<PostIndexer_ABI>;
	export function connect(runner: ContractRunner, address: string) {
		return new Contract(address, PostIndexer_ABI).connect(runner) as Contract;
	}
}
