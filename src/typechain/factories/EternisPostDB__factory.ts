/* Autogenerated file. Do not edit manually. */
/* tslint:disable */
/* eslint-disable */
import type { Provider, TransactionRequest } from "@ethersproject/providers"
import { Contract, ContractFactory, Overrides, Signer, utils } from "ethers"
import type { PromiseOrValue } from "../common"
import type { EternisPostDB, EternisPostDBInterface } from "../EternisPostDB"

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
	{
		inputs: [
			{
				internalType: "bytes",
				name: "postData",
				type: "bytes",
			},
		],
		name: "post",
		outputs: [],
		stateMutability: "nonpayable",
		type: "function",
	},
	{
		inputs: [],
		name: "postIndex",
		outputs: [
			{
				internalType: "uint256",
				name: "",
				type: "uint256",
			},
		],
		stateMutability: "view",
		type: "function",
	},
] as const

const _bytecode =
	"0x608060405234801561001057600080fd5b506102fc806100206000396000f3fe608060405234801561001057600080fd5b50600436106100365760003560e01c80632b4a70f71461003b578063baf9b36914610059575b600080fd5b610043610075565b60405161005091906100e8565b60405180910390f35b610073600480360381019061006e9190610172565b61007b565b005b60005481565b7f6fe74bf1413104b8b6754bb19a6e039c8e7d77e0602199af6cb819a9d3784e3d6000808154809291906100ae906101ee565b9190505583836040516100c393929190610294565b60405180910390a15050565b6000819050919050565b6100e2816100cf565b82525050565b60006020820190506100fd60008301846100d9565b92915050565b600080fd5b600080fd5b600080fd5b600080fd5b600080fd5b60008083601f8401126101325761013161010d565b5b8235905067ffffffffffffffff81111561014f5761014e610112565b5b60208301915083600182028301111561016b5761016a610117565b5b9250929050565b6000806020838503121561018957610188610103565b5b600083013567ffffffffffffffff8111156101a7576101a6610108565b5b6101b38582860161011c565b92509250509250929050565b7f4e487b7100000000000000000000000000000000000000000000000000000000600052601160045260246000fd5b60006101f9826100cf565b91507fffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff820361022b5761022a6101bf565b5b600182019050919050565b600082825260208201905092915050565b82818337600083830152505050565b6000601f19601f8301169050919050565b60006102738385610236565b9350610280838584610247565b61028983610256565b840190509392505050565b60006040820190506102a960008301866100d9565b81810360208301526102bc818486610267565b905094935050505056fea264697066735822122046206b568d8f385b414eee141633ca53fbcea0db5392964bc56477f788dea28164736f6c63430008120033"

type EternisPostDBConstructorParams = [signer?: Signer] | ConstructorParameters<typeof ContractFactory>

const isSuperArgs = (xs: EternisPostDBConstructorParams): xs is ConstructorParameters<typeof ContractFactory> => xs.length > 1

export class EternisPostDB__factory extends ContractFactory {
	constructor(...args: EternisPostDBConstructorParams) {
		if (isSuperArgs(args)) {
			super(...args)
		} else {
			super(_abi, _bytecode, args[0])
		}
	}

	override deploy(overrides?: Overrides & { from?: PromiseOrValue<string> }): Promise<EternisPostDB> {
		return super.deploy(overrides || {}) as Promise<EternisPostDB>
	}
	override getDeployTransaction(overrides?: Overrides & { from?: PromiseOrValue<string> }): TransactionRequest {
		return super.getDeployTransaction(overrides || {})
	}
	override attach(address: string): EternisPostDB {
		return super.attach(address) as EternisPostDB
	}
	override connect(signer: Signer): EternisPostDB__factory {
		return super.connect(signer) as EternisPostDB__factory
	}

	static readonly bytecode = _bytecode
	static readonly abi = _abi
	static createInterface(): EternisPostDBInterface {
		return new utils.Interface(_abi) as EternisPostDBInterface
	}
	static connect(address: string, signerOrProvider: Signer | Provider): EternisPostDB {
		return new Contract(address, _abi, signerOrProvider) as EternisPostDB
	}
}