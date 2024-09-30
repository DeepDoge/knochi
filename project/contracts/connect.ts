import { Contract, ContractRunner } from "ethers";
import type { TypedContract } from "typify-contracts/types/ethers6/typedContract";
import { IKnochiIndexer_ABI } from "./artifacts/IKnochiIndexer";
import { IKnochiSender_ABI } from "./artifacts/IKnochiSender";
import { IKnochiStore_ABI } from "./artifacts/IKnochiStore";

export namespace IKnochiSender {
	export function connect(runner: ContractRunner, address: string) {
		return new Contract(address, IKnochiSender_ABI).connect(runner) as TypedContract<IKnochiSender_ABI>;
	}
}

export namespace IKnochiStore {
	export function connect(runner: ContractRunner, address: string) {
		return new Contract(address, IKnochiStore_ABI).connect(runner) as TypedContract<IKnochiStore_ABI>;
	}
}

export namespace IKnochiIndexer {
	export function connect(runner: ContractRunner, address: string) {
		return new Contract(address, IKnochiIndexer_ABI).connect(runner) as TypedContract<IKnochiIndexer_ABI>;
	}
}
