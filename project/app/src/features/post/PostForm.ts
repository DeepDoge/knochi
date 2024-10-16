import { awaited, computed, ref, tags } from "@purifyjs/core";
import { PostIndexer, PostStore_Plain } from "@root/contracts/connect";
import { connectWalletDialog } from "~/app";
import { SelectSenderButton } from "~/features/post/SelectSenderButton";
import { SelectedSender } from "~/features/post/SelectSenderPopover";
import { PostContent } from "~/features/post/utils/PostContent";
import { trackPromise } from "~/features/progress/utils";
import { currentWalletDetail, getOrRequestSigner } from "~/features/wallet/utils";
import { WalletAddress } from "~/features/wallet/WalletAddress";
import { bind } from "~/utils/actions/bind";
import { css, scope } from "~/utils/style";

const { form, div, textarea, button, small, hr, a } = tags;

export function PostForm() {
	const text = ref("");
	const textEncoded = text.derive((text) =>
		PostContent.toBytes([{ type: PostContent.Part.TypeMap.Text, value: text }]),
	);
	const textByteLength = textEncoded.derive((textEncoded) => textEncoded.byteLength);

	const selectedSender = ref<SelectedSender | null>(null);
	const currentSender = selectedSender.derive(
		(sender) => sender?.network.contracts.PostStores.Plain[sender.key] ?? null,
	);

	const host = form()
		.use(scope(PostFormCss))
		.onsubmit((event) => {
			event.preventDefault();

			const promise = (async () => {
				const network = selectedSender.val?.network ?? null;
				if (!network) return;

				const indexerAddress = network.contracts.PostIndexer;
				if (!indexerAddress) return;

				const senderAddress = currentSender.val;
				if (!senderAddress) return;

				const wallet = currentWalletDetail.val;
				if (!wallet) {
					alert("Please connect your wallet");
					return;
				}

				const signer = await getOrRequestSigner({ wallet, network });
				if (!signer) {
					alert("Something went wrong");
					return;
				}

				const indexerContract = PostIndexer.connect(signer, indexerAddress);
				const postStoreContract = PostStore_Plain.connect(signer, senderAddress);

				if (!(await indexerContract.checkPermission(signer.address, senderAddress))) {
					await trackPromise(
						"Grant Permission",
						["Index posts in behalf of you", WalletAddress(senderAddress)],
						indexerContract.grantPermission(senderAddress),
					);
				}

				const tx = await postStoreContract.post(
					indexerAddress,
					[`0x00${signer.address.slice(2)}${"00".repeat(32 - 1 - 20)}`],
					textEncoded.val,
				);
			})();

			trackPromise(
				awaited(
					promise.then(() => "Posted Content"),
					"Posting Content...",
				),
				null,
				promise,
			);
		})
		.children(
			div({ class: "fields" }).children(
				div({ class: "field input" }).children(
					textarea()
						.name("content")
						.required(true)
						.ariaLabel("Post content")
						.placeholder("Just say it...")
						.use(bind(text, "value", "input"))
						.oninput((event) => {
							const textarea = event.currentTarget;
							textarea.style.height = "auto";
							textarea.style.height = `${textarea.scrollHeight}px`;
						}),
				),
			),
			div({ class: "actions" }).children(
				small().children(textByteLength, " bytes"),
				hr(),
				SelectSenderButton({ selectedSender }),
				computed(() => {
					const wallet = currentWalletDetail.val;
					const signer = wallet ? wallet.signer.val : null;

					if (!signer || !wallet) {
						return a({ class: "button" })
							.href(
								computed(() => {
									const value = selectedSender.val?.network.chainId ?? "open";
									return connectWalletDialog.searchParam.toHref(`${value}`).val;
								}),
							)
							.textContent("Connect Wallet");
					}

					return button({ class: "button" })
						.type("submit")
						.disabled(currentSender.derive((sender) => !sender))
						.children("Publish");
				}),
			),
		);

	return host;
}

const PostFormCss = css`
	:scope {
		display: block grid;
		gap: 0.8em;
	}

	.fields {
		display: block grid;
		gap: 0.8em;
	}

	.field {
		display: block grid;
		gap: 0.2em;

		& small {
			justify-self: end;
		}
	}

	.actions {
		display: block grid;
		grid-auto-flow: column;
		justify-content: end;
		align-items: center;
		gap: 0.8em;
	}

	textarea {
		resize: none;
		min-block-size: 2em;
		font-size: 1.25em;
		overflow-x: hidden;
		overflow-wrap: break-word;
	}

	details:has(> ul) {
		ul {
			position: absolute;
			inset-block-start: calc(100% + 0.5em);
			inset-inline-end: 0;
			color: var(--back);
			background-color: var(--front);
			list-style: none;
			padding: 0.4em;
			border-radius: var(--radius);
		}
	}
`;
