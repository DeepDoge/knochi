import { computed, ref, tags } from "@purifyjs/core";
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
import { awaited } from "~/shared/utils/signals/awaited";
import { unroll } from "~/shared/utils/signals/unroll";
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

	const connected = computed(() => Boolean(currentWalletDetail.val?.signer.val));
	const busy = ref(false);
	const disabled = computed(() => !connected.val || !sender.val || busy.val);

	return form()
		.ariaBusy(busy.derive(String))
		.ariaLabel("Post content")
		.effect(useScope(PostFormCss))
		.onsubmit(async (event) => {
			event.preventDefault();
			if (!sender.val) return;
			busy.val = true;
			await publish({ feedIds, sender: sender.val, contentBytes: contentBytes.val }).catch(
				console.error,
			);
			busy.val = false;
			text.val = "";
		})
		.children(
			label()
				.ariaLabel("post content")
				.children(
					textarea()
						.disabled(disabled)
						.effect(useAutoSize())
						.required(true)
						.placeholder("Just say it...")
						.effect(useBind(text, "value", "input")),

					div({ class: "actions" }).children(
						connected.derive((connected) => {
							if (connected) {
								return button()
									.type("submit")
									.ariaLabel("Publish")
									.title("Publish")
									.disabled(disabled)
									.children(SendSvg());
							}

							const href = sender
								.derive((sender) => `${sender?.network.chainId ?? "open"}`)
								.derive((value) => connectWallet.searchParam.toHref(value))
								.pipe(unroll);

							return a({ class: "connect button" })
								.href(href)
								.textContent("Sign In/Up");
						}),
					),
				),
			footer().children(
				div({ class: "sender" }).children(SelectSenderButton({ selectedSender: sender })),
				small({ class: "bytes" })
					.ariaLabel("content byte size")
					.children(contentByteLength, " bytes"),
			),
		);
}

const PostFormCss = css`
	:scope {
		display: block grid;
		background-color: color-mix(in srgb, var(--base), var(--pop) 1.5%);
		backdrop-filter: blur(3px);

		padding-inline: 1em;
		padding-block: 0.5em;
		gap: 0.5em;
	}

	footer {
		display: block grid;
		grid-auto-flow: column;
		justify-content: space-between;
		align-items: center;
	}

	.connect {
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

		background-color: color-mix(in srgb, var(--base), var(--pop) 5%);

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
