import { Contract, ContractRunner } from "ethers";
import type { TypedContract } from "typify-contracts/types/ethers6/typedContract";
import { IEternisIndexer_ABI } from "./artifacts/IEternisIndexer";
import { IEternisProxy_ABI } from "./artifacts/IEternisProxy";

export namespace IEternisProxy {
	export function connect(runner: ContractRunner, address: string) {
		return new Contract(address, IEternisProxy_ABI).connect(runner) as TypedContract<IEternisProxy_ABI>;
	}
}

export namespace IEternisIndexer {
	export function connect(runner: ContractRunner, address: string) {
		return new Contract(address, IEternisIndexer_ABI).connect(runner) as TypedContract<IEternisIndexer_ABI>;
	}
}
