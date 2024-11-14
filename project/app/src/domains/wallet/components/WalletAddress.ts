import { tags } from "@purifyjs/core";
import { css, useScope } from "~/shared/css.ts";
import { Address } from "~/shared/solidity/primatives.ts";

const { span } = tags;

export function WalletAddress(address: Address, suffixLength = 3) {
	const prefix = address.slice(0, -suffixLength);
	const suffix = address.slice(-suffixLength);

	return span()
		.effect(useScope(AddressTextCss))
		.children(
			span({ class: "prefix" }).textContent(prefix),
			span({ class: "suffix" }).textContent(suffix),
		);
}

const AddressTextCss = css`
	:scope {
		display: inline grid;
		grid-auto-flow: column;
		justify-content: start;
		align-items: center;
		white-space: nowrap;
	}

	.prefix {
		overflow: hidden;
		text-overflow: ellipsis;
	}
`;
