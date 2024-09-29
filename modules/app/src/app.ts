import { computed, fragment, tags } from "purify-js";

import { zeroPadBytes } from "ethers";
import { FeedViewer } from "~/features/post/FeedViewer";
import { PostForm } from "~/features/post/PostForm";
import { currentWalletDetail } from "~/features/wallet/util.s";
import { rootSheet } from "~/styles";
import { Bytes32Hex } from "~/utils/hex";
import { trackPromise } from "./features/progress/utils";
import { WalletList } from "./features/wallet/WalletList";
import { css } from "./utils/style";

const { div, button, img } = tags;

trackPromise("Infinite Job", "", new Promise(() => {}));

function App() {
	const host = div();
	const shadow = host.element.attachShadow({ mode: "open" });
	shadow.adoptedStyleSheets.push(rootSheet, appSheet);

	computed((add) => {
		const details = add(currentWalletDetail).val;
		const signer = details ? add(details.signer).val : null;
		if (!signer) return null;
		const myFeedId = Bytes32Hex.parse(zeroPadBytes(signer.address, 32));
		return FeedViewer(myFeedId);
	});

	shadow.append(
		fragment(
			PostForm(),
			computed((add) => {
				const details = add(currentWalletDetail).val;
				const signer = details ? add(details.signer).val : null;
				if (!signer) return null;
				const myFeedId = Bytes32Hex.parse(zeroPadBytes(signer.address, 32));
				return FeedViewer(myFeedId);
			}),
			computed((add) => {
				const details = add(currentWalletDetail).val;
				const signer = details ? add(details.signer).val : null;
				if (signer) {
					return ["Connected Wallet: ", signer.address];
				}
				return "Not Connected";
			}),
			WalletList(),
		),
	);

	return host;
}

const appSheet = css`
	:host {
		display: grid;
		gap: 0.8em;
		padding: 0.8em;
		grid-template-columns: minmax(0, 30em);
		justify-content: center;
	}
`;

document.body.append(App().element);
