import { getAddress } from "ethers";
import { tags } from "purify-js";
import { AddressHex } from "~/utils/hex";
import { css, scopeCss } from "~/utils/style";

const { span } = tags;

export function AddressText(address: AddressHex, suffixLength = 3) {
	address = getAddress(address); // Format address

	const prefix = address.slice(0, -suffixLength);
	const suffix = address.slice(-suffixLength);

	return span()
		.use(scopeCss(AddressTextStyle))
		.children(span({ class: "prefix" }).textContent(prefix), span({ class: "suffix" }).textContent(suffix));
}

const AddressTextStyle = css`
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
