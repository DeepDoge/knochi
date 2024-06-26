import { IEternisIndexer_ABI, IEternisProxy_ABI } from "@modules/contracts";
import { Contract, ContractRunner } from "ethers";
import type { TypedContract } from "typify-contracts/types/ethers6/typedContract";

export namespace IEternisProxy {
	export const defaultAddress = "0x4706f3d39e0634e9fb73c4a9a7c71cce22f7ba2f";

	export function connect(runner: ContractRunner, address = defaultAddress) {
		return new Contract(address, IEternisProxy_ABI).connect(runner) as TypedContract<IEternisProxy_ABI>;
	}
}

export namespace IEternisIndexer {
	export const defaultAddress = "0xD9506b33E141FFBf2A2A9F48B59dE7D1C6FfC795";

	export function connect(runner: ContractRunner, address = defaultAddress) {
		return new Contract(address, IEternisIndexer_ABI).connect(runner) as TypedContract<IEternisIndexer_ABI>;
	}
}
