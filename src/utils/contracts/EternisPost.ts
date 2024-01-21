import { EternisPost_ABI } from "@contracts/artifacts/EternisPost"
import { Contract, JsonRpcSigner } from "ethers"
import type { TypedContract } from "typify-contracts/types/ethers6/typedContract"

export function EternisPost_connect(signer: JsonRpcSigner) {
	return new Contract(
		"0x23446DdCe60FB29B0265412eCB60B5feB76058CD",
		EternisPost_ABI,
		signer,
	) as TypedContract<EternisPost_ABI>
}
