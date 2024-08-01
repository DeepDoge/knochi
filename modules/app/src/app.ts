import { computed, css, fragment, sheet, tags } from "purified-js";

import { zeroPadBytes } from "ethers";
import { FeedViewer } from "~/features/post/FeedViewer";
import { PostForm } from "~/features/post/PostForm";
import { getOrRequestSigner, signer } from "~/features/wallet";
import { globalSheet } from "~/styles";
import { Bytes32Hex } from "~/utils/hex";
import { trackPromise } from "./features/progress/utils";

const { div, button } = tags;

trackPromise("Infinite Job", new Promise(() => {}));

function App() {
	const host = div();
	const shadow = host.element.attachShadow({ mode: "open" });
	shadow.adoptedStyleSheets.push(globalSheet, appSheet);

	shadow.append(
		fragment(
			PostForm(),
			computed(() => {
				if (!signer.val) return null;
				const myFeedId = Bytes32Hex.parse(zeroPadBytes(signer.val.address, 32));
				return FeedViewer(myFeedId);
			}),
			computed(() =>
				signer.val ?
					["Connected Wallet: ", signer.val.address]
				:	button()
						.onclick(() => trackPromise("Connect Wallet", getOrRequestSigner()))
						.textContent("Connect Wallet"),
			),
		),
	);

	return host;
}

const appSheet = sheet(css`
	:host {
		display: grid;
		gap: 1em;
		padding: 1em;
		grid-template-columns: minmax(0, 30em);
		justify-content: center;
	}
`);

document.body.append(App().element);
