import { computed, fragment, tags } from "purified-js";
import { trackPromise } from "~/features/progress/utils";
import { globalSheet } from "~/styles";
import { css } from "~/utils/style";
import { getOrRequestSigner, walletDetails } from "./util.s";

const { div, span, button, img } = tags;

export function WalletList() {
	const host = div();
	const shadow = host.element.attachShadow({ mode: "open" });
	shadow.adoptedStyleSheets.push(globalSheet, walletListSheet);

	const children = fragment(
		computed(() =>
			walletDetails.val.map((walletDetail) => {
				return button()
					.role("button")
					.onclick(() => trackPromise("Connect Wallet", getOrRequestSigner(walletDetail)))
					.children(img().src(walletDetail.info.icon), span().children(walletDetail.info.name));
			}),
		),
	);

	shadow.append(children);
	return host;
}

const walletListSheet = css`
	:host {
		display: grid;
		row-gap: 0.8em;
		grid-template-columns: 1fr [icon-start] 1.5em [icon-end] 0.4em [name-start] auto [name-end] 1fr;
	}

	button {
		display: grid;
		grid-column: 1 / -1;
		grid-template-columns: subgrid;
		align-items: center;

		img {
			grid-column: icon;
			inline-size: 100%;
			block-size: 100%;
			object-fit: contain;
		}
		span {
			grid-column: name;
		}
	}
`;
