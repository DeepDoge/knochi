import { Contract, ContractRunner } from "ethers";
import type { TypedContract } from "typify-contracts/types/ethers6/typedContract";
import { IKnochiIndexer_ABI } from "./artifacts/IKnochiIndexer";
import { IKnochiSender_ABI } from "./artifacts/IKnochiSender";
import { IKnochiStore_ABI } from "./artifacts/IKnochiStore";

export namespace IKnochiSender {
	export type Contract = TypedContract<IKnochiSender_ABI>;
	export function connect(runner: ContractRunner, address: string) {
		return new Contract(address, IKnochiSender_ABI).connect(runner) as Contract;
	}
}

export namespace IKnochiStore {
	export type Contract = TypedContract<IKnochiStore_ABI>;
	export function connect(runner: ContractRunner, address: string) {
		return new Contract(address, IKnochiStore_ABI).connect(runner) as Contract;
	}
}

export namespace IKnochiIndexer {
	export type Contract = TypedContract<IKnochiIndexer_ABI>;
	export function connect(runner: ContractRunner, address: string) {
		return new Contract(address, IKnochiIndexer_ABI).connect(runner) as Contract;
	}
}
