import { getAddress } from "ethers";
import { fragment, tags } from "purify-js";
import { rootSheet } from "~/styles";
import { AddressHex } from "~/utils/hex";
import { css } from "~/utils/style";

const { span } = tags;

export function AddressText(address: AddressHex, suffixLength = 3) {
	address = getAddress(address); // Format address
	const host = span();
	const shadow = host.element.attachShadow({ mode: "open" });
	shadow.adoptedStyleSheets.push(rootSheet, styleSheet);

	const prefix = address.slice(0, -suffixLength);
	const suffix = address.slice(-suffixLength);

	shadow.append(
		fragment(span({ class: "prefix" }).textContent(prefix), span({ class: "suffix" }).textContent(suffix)),
	);

	return host;
}

const styleSheet = css`
	:host {
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
