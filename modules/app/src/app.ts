import { computed, css, fragment, sheet, tags } from "purified-js";

import { zeroPadBytes } from "ethers";
import { FeedViewer } from "~/features/post/FeedViewer";
import { PostForm } from "~/features/post/PostForm";
import { currentWalletData } from "~/features/wallet/util.s";
import { globalSheet } from "~/styles";
import { Bytes32Hex } from "~/utils/hex";
import { trackPromise } from "./features/progress/utils";
import { WalletList } from "./features/wallet/WalletList";

const { div, button, img } = tags;

trackPromise("Infinite Job", new Promise(() => {}));

function App() {
	const host = div();
	const shadow = host.element.attachShadow({ mode: "open" });
	shadow.adoptedStyleSheets.push(globalSheet, appSheet);

	shadow.append(
		fragment(
			PostForm(),
			computed(() => {
				const signer = currentWalletData.val?.signer.val;
				if (!signer) return null;
				const myFeedId = Bytes32Hex.parse(zeroPadBytes(signer.address, 32));
				return FeedViewer(myFeedId);
			}),
			computed(() => {
				const signer = currentWalletData.val?.signer.val;
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

const appSheet = sheet(css`
	:host {
		display: grid;
		gap: 0.8em;
		padding: 0.8em;
		grid-template-columns: minmax(0, 30em);
		justify-content: center;
	}
`);

document.body.append(App().element);
