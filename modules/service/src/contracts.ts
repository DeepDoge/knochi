import { IEternisIndexer_ABI, IEternisProxy_ABI } from "@modules/contracts";
import { Contract, ContractRunner } from "ethers";
import type { TypedContract } from "typify-contracts/types/ethers6/typedContract";
import { Address } from "./types";

export namespace IEternisProxy {
	export function connect(runner: ContractRunner, address: Address) {
		return new Contract(address, IEternisProxy_ABI).connect(runner) as TypedContract<IEternisProxy_ABI>;
	}
}

export namespace IEternisIndexer {
	export function connect(runner: ContractRunner, address: Address) {
		return new Contract(address, IEternisIndexer_ABI).connect(runner) as TypedContract<IEternisIndexer_ABI>;
	}
}
