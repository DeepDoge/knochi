import { tags } from "@purifyjs/core";
import { JsonRpcSigner } from "ethers";
import { Config } from "~/lib/config";
import { css, scope } from "~/lib/css";
import { trackPromise } from "~/lib/progress/utils";
import { getOrRequestSigner, walletDetails } from "../utils";

const { div, span, button, img, picture, ul, li } = tags;

export function WalletList(params: {
	network: Config.Network | null;
	onConnect?: (signer: JsonRpcSigner) => unknown;
	onFinally?: () => unknown;
}) {
	return div()
		.use(scope(WalletListCss))
		.children(
			walletDetails.derive((walletDetails) =>
				ul().children(
					walletDetails.map((wallet) => {
						return li().children(
							button({ style: `--icon: url(${wallet.info.icon})` })
								.type("button")
								.onclick(() => {
									trackPromise(
										["Connect Wallet"],

										span({
											style: [
												"display: block grid",
												"grid-auto-flow:column",
												"justify-content:start",
												"align-items:center",
												"gap:0.5em",
											].join(";"),
										}).children(
											img({
												style: [
													"inline-size:1.5em",
													"aspect-ratio:1",
													"display:inline flow",
												].join(";"),
											}).src(wallet.info.icon),
											span().textContent(wallet.info.name),
										),
										getOrRequestSigner({ wallet, network: params.network })
											.then((signer) => params.onConnect?.(signer))
											.finally(() => params.onFinally?.()),
									);
								})
								.children(
									div({ class: "box" }).children(
										picture().children(img().src(wallet.info.icon)),
									),
									span({ class: "name" })
										.title(wallet.info.name)
										.children(wallet.info.name),
								),
						);
					}),
				),
			),
		);
}

const WalletListCss = css`
	:scope {
		display: block grid;
		gap: 0.5em;
		grid-template-columns: repeat(auto-fill, minmax(min(10em, 100%), 1fr));
	}

	ul,
	li {
		display: contents;
	}

	button {
		--hover: 0;
		&:hover {
			--hover: 1;
		}

		display: block grid;
		text-align: center;
		gap: 0.25em;

		.name {
			overflow: hidden;
			text-overflow: ellipsis;
			text-wrap: nowrap;
		}

		.box {
			display: block grid;
			grid-template-columns: minmax(0, 5em);
			place-content: center;

			background-color: color-mix(in srgb, var(--base), var(--pop) 5%);
			overflow: clip;
			padding: min(1.5em, 25%);
		}

		picture {
			position: relative;
			isolation: isolate;
			aspect-ratio: 1;

			img {
				position: absolute;
				inset: 0;
				inline-size: 100%;
				block-size: 100%;
				object-fit: contain;
			}

			&::before {
				content: "";
				position: absolute;
				inset: 0;
				background-image: var(--icon);
				background-size: contain;
				background-position: center;
				background-repeat: no-repeat;
				z-index: -1;

				filter: blur(1em);
				opacity: var(--hover);
				transition: 0.2s linear;
				transition-property: opacity;
			}
		}
	}
`;
