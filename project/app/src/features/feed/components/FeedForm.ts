import { awaited, computed, ref, tags } from "@purifyjs/core";
import { PostIndexer, PostStore_Plain } from "@root/contracts/connect";
import { SelectSenderButton } from "~/features/feed/components/SelectSenderButton";
import { SelectedSender } from "~/features/feed/components/SelectSenderPopover";
import { PostContent } from "~/features/post/PostContent";
import { config } from "~/shared/config";
import { trackPromise } from "~/shared/progress";
import { FeedId } from "~/shared/schemas/feed";
import { SendSvg } from "~/shared/svgs/SendSvg";
import { css, useScope } from "~/shared/utils/css";
import { useAutoSize } from "~/shared/utils/effects/useAutoSize";
import { useBind } from "~/shared/utils/effects/useBind";
import { unroll } from "~/shared/utils/unroll";
import { WalletAddress } from "~/shared/wallet/components/WalletAddress";
import { connectWallet } from "~/shared/wallet/connectDialog";
import { currentWalletDetail, getOrRequestSigner } from "~/shared/wallet/utils";

const { form, footer, label, div, textarea, button, small, a } = tags;

async function publish(params: {
	feedIds: readonly FeedId[];
	sender: SelectedSender;
	contentBytes: Uint8Array;
}) {
	const { feedIds, sender, contentBytes } = params;

	const promise = (async () => {
		const network = sender.network ?? null;
		if (!network) return;

		const indexerAddress = network.contracts.PostIndexer;
		if (!indexerAddress) return;

		const senderAddress = network.contracts.PostStores.Plain[sender.key] ?? null;
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

		await postStoreContract.post(indexerAddress, feedIds, contentBytes);
	})();

	await trackPromise(
		awaited(
			promise.then(() => "Posted Content"),
			"Posting Content...",
		),
		null,
		promise,
	);
}

export function FeedForm(feedIds: readonly FeedId[]) {
	const host = form();

	const senders = config.derive((config) => {
		const networks = Object.values(config.networks);
		return networks
			.map((network) =>
				Object.entries(network.contracts.PostStores.Plain).map(([key]) => {
					return { network, key };
				}),
			)
			.flat();
	});
	// TODO: Later select default sender based on localStorage data
	// You might even keep this as a global signal value.
	// And follow changes via broadcasting between tabs and etc...
	// In that case select sender would be a modal rather than popover since its global
	const defaultSender = senders.derive((senders) => senders.at(0) ?? null);

	const sender = ref<SelectedSender | null>(null, (set) => defaultSender.follow(set, true));

	const text = ref("");
	const postContent = text.derive<PostContent>((text) => [
		{ type: PostContent.Part.TypeMap.Text, value: text },
	]);
	const contentBytes = postContent.derive(PostContent.toBytes);
	const contentByteLength = contentBytes.derive((bytes) => bytes.byteLength);

	host.ariaLabel("Post content")
		.effect(useScope(PostFormCss))
		.onsubmit((event) => {
			event.preventDefault();
			if (!sender.val) return;
			publish({ feedIds, sender: sender.val, contentBytes: contentBytes.val });
		})
		.children(
			label()
				.ariaLabel("post content")
				.children(
					textarea()
						.effect(useAutoSize())
						.required(true)
						.placeholder("Just say it...")
						.effect(useBind(text, "value", "input")),

					div({ class: "actions" }).children(
						computed(() => Boolean(currentWalletDetail.val?.signer.val)).derive(
							(connected) => {
								if (connected) {
									return button()
										.type("submit")
										.ariaLabel("Publish")
										.title("Publish")
										.disabled(sender.derive((sender) => !sender))
										.children(SendSvg());
								}

								const href = sender.derive((sender) =>
									connectWallet.searchParam.toHref(
										`${sender?.network.chainId ?? "open"}`,
									),
								);
								return a({ class: "button" })
									.href(unroll(href))
									.textContent("connect wallet");
							},
						),
					),
				),
			footer().children(
				div({ class: "sender" }).children(SelectSenderButton({ selectedSender: sender })),
				small({ class: "bytes" })
					.ariaLabel("content byte size")
					.children(contentByteLength, " bytes"),
			),
		);

	return host;
}

const PostFormCss = css`
	:scope {
		display: block grid;
		background-color: color-mix(in srgb, var(--base), var(--pop) 7.5%);

		padding-inline: 1em;
		padding-block: 0.5em;
		gap: 0.5em;
	}

	footer {
		display: block grid;
		grid-auto-flow: column;
		justify-content: space-between;
		align-items: center;
		font-size: 0.75em;
	}

	label {
		display: block grid;
		grid-template-columns: 1fr auto;
		&:has(button[type="submit"]) {
			grid-template-columns: 1fr 1.5em;
		}
		gap: 0.5em;
		padding: 0.5em;

		background-color: color-mix(in srgb, var(--base), var(--pop) 10%);

		.actions {
			align-self: start;

			display: block grid;
			grid-auto-flow: column;
			align-items: center;
		}

		textarea {
			align-self: center;

			resize: none;
			min-block-size: 0;
			max-block-size: 65svb;
			overflow-x: hidden;
			overflow-wrap: break-word;
			scrollbar-width: thin;

			padding-inline-start: 0.5em;
		}
	}
`;
