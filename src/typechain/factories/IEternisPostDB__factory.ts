/* Autogenerated file. Do not edit manually. */
/* tslint:disable */
/* eslint-disable */

import type { Provider } from "@ethersproject/providers"
import { Contract, Signer, utils } from "ethers"
import type { IEternisPostDB, IEternisPostDBInterface } from "../IEternisPostDB"

const _abi = [
	{
		anonymous: false,
		inputs: [
			{
				indexed: false,
				internalType: "uint256",
				name: "postIndex",
				type: "uint256",
			},
			{
				indexed: false,
				internalType: "bytes",
				name: "postData",
				type: "bytes",
			},
		],
		name: "EternisPost",
		type: "event",
	},
] as const

export class IEternisPostDB__factory {
	static readonly abi = _abi
	static createInterface(): IEternisPostDBInterface {
		return new utils.Interface(_abi) as IEternisPostDBInterface
	}
	static connect(address: string, signerOrProvider: Signer | Provider): IEternisPostDB {
		return new Contract(address, _abi, signerOrProvider) as IEternisPostDB
	}
}
