import { fragment, tags } from "purify-js";
import { trackPromise } from "~/features/progress/utils";
import { rootSheet } from "~/styles";
import { css } from "~/utils/style";
import { getOrRequestSigner, walletDetails } from "./util.s";

const { div, span, button, img, picture, ul, li } = tags;

export function WalletList(params?: { onFinally?: () => unknown }) {
	const host = div();
	const shadow = host.element.attachShadow({ mode: "open" });
	shadow.adoptedStyleSheets.push(rootSheet, walletListSheet);

	const children = fragment(
		walletDetails.derive((walletDetails) =>
			ul().children(
				walletDetails.map((walletDetail) => {
					return li().children(
						button({ style: `--icon: url(${walletDetail.info.icon})` })
							.onclick(() => {
								trackPromise(
									["Connect Wallet"],

									span({
										style: [
											"display: grid",
											"grid-auto-flow:column",
											"justify-content:start",
											"align-items:center",
											"gap:0.5em",
										].join(";"),
									}).children(
										img({
											style: ["inline-size:1.5em", "aspect-ratio:1", "display:inline-block"].join(
												";",
											),
										}).src(walletDetail.info.icon),
										span().textContent(walletDetail.info.name),
									),
									getOrRequestSigner(walletDetail).finally(() => params?.onFinally?.()),
								);
							})
							.children(
								div({ class: "box" }).children(picture().children(img().src(walletDetail.info.icon))),
								span({ class: "name" }).title(walletDetail.info.name).children(walletDetail.info.name),
							),
					);
				}),
			),
		),
	);

	shadow.append(children);
	return host;
}

const walletListSheet = css`
	:host {
		display: grid;
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

		display: grid;
		text-align: center;
		gap: 0.25em;

		.name {
			overflow: hidden;
			text-overflow: ellipsis;
			text-wrap: nowrap;
		}

		.box {
			display: grid;
			grid-template-columns: minmax(0, 5em);
			place-content: center;

			background-color: color-mix(in srgb, var(--base), var(--accent) 5%);
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
