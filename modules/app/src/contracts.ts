import { IEternisProxy_ABI } from "@modules/contracts/artifacts/IEternisProxy";
import { Contract, ContractRunner } from "ethers";
import type { TypedContract } from "typify-contracts/types/ethers6/typedContract";

export namespace IEternisProxy {
	export const defaultAddress = "0xF225e8487F125241D2f4DDF62B23D8D5c4C1501c";

	export function connect(runner: ContractRunner, address = defaultAddress) {
		return new Contract(address, IEternisProxy_ABI).connect(runner) as TypedContract<IEternisProxy_ABI>;
	}
}

export namespace IEternisIndexer {
	export const defaultAddress = "0xd49E00Fd389EFb92a200988dF21B10ba44a413A3";

	export function connect(runner: ContractRunner, address = defaultAddress) {
		return new Contract(address, IEternisProxy_ABI).connect(runner) as TypedContract<IEternisProxy_ABI>;
	}
}
