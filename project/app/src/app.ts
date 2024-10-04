import "./styles";

import { zeroPadBytes } from "ethers";
import { computed, tags } from "purify-js";
import { FeedViewer } from "~/features/post/FeedViewer";
import { PostForm } from "~/features/post/PostForm";
import { currentWalletDetail } from "~/features/wallet/utils";
import { Bytes32Hex } from "~/utils/hex";
import { AddressAvatar } from "./features/address/AddressAvatar";
import { AddressText } from "./features/address/AddressText";
import { css, scopeCss } from "./utils/style";

const { div } = tags;

function App() {
	computed((add) => {
		const details = add(currentWalletDetail).val;
		const signer = details ? add(details.signer).val : null;
		if (!signer) return null;
		const myFeedId = Bytes32Hex.parse(zeroPadBytes(signer.address, 32));
		return FeedViewer(myFeedId);
	});

	return div()
		.id("app")
		.use(scopeCss(AppStyle))
		.children(
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
					return ["Connected Wallet: ", AddressAvatar(signer.address), AddressText(signer.address)];
				}
				return "Not Connected";
			}),
		);
}

const AppStyle = css`
	:scope {
		display: block grid;
		gap: 0.8em;
		padding: 0.8em;
		grid-template-columns: minmax(0, 30em);
		justify-content: center;
	}
`;

document.body.append(App().element);
