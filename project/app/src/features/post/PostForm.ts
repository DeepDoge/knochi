import { IKnochiSender } from "@root/contracts/connect";
import { zeroPadBytes } from "ethers";
import { awaited, computed, ref, tags } from "purify-js";
import { currentConfig } from "~/features/config/state";
import { PostContent } from "~/features/post/utils";
import { trackPromise } from "~/features/progress/utils";
import { connectWalletSearchParam } from "~/features/wallet/popover";
import { currentWalletDetail, getOrRequestSigner } from "~/features/wallet/utils";
import { bind } from "~/utils/actions/bind";
import { css, scopeCss } from "~/utils/style";
import { uniqueId } from "~/utils/unique";

const { form, div, textarea, button, small, hr, a, input, details, summary, ul, li, label } = tags;

export function PostForm() {
	const host = div({ role: "form" }).use(scopeCss(PostFormCss));

	const text = ref("");
	const textEncoded = text.derive((text) =>
		PostContent.toBytes([{ type: PostContent.Part.TypeMap.Text, value: text }]),
	);
	const textByteLength = textEncoded.derive((textEncoded) => textEncoded.byteLength);

	const configAwaited = currentConfig.derive((config) => awaited(config));
	const config = computed((add) => add(add(configAwaited).val).val);

	const proxyContracts = config.derive((config) => config?.networks[0].contracts.KnochiProxies ?? null);
	const proxyContractEntries = proxyContracts.derive((proxyContracts) =>
		proxyContracts ? Object.entries(proxyContracts) : null,
	);
	const currentProxyKey = ref("");
	host.element.onConnect(() =>
		proxyContractEntries.follow((entries) => (currentProxyKey.val = entries?.[0]?.[0] ?? ""), true),
	);
	const currentProxy = computed((add) => add(proxyContracts).val?.[add(currentProxyKey).val] ?? null);

	const postForm = form()
		.id(uniqueId("post-form"))
		.hidden(true)
		.onsubmit((event) => {
			event.preventDefault();

			const promise = (async () => {
				const config = await currentConfig.val;

				const network = config.networks[0];

				const indexerAddress = network.contracts.KnochiIndexer;
				if (!indexerAddress) return;

				const proxyAddress = currentProxy.val;
				if (!proxyAddress) return;

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
				const proxyContract = IKnochiSender.connect(signer, proxyAddress);

				const tx = await proxyContract.post(
					indexerAddress,
					[zeroPadBytes(signer.address, 32)],
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
		}).element;

	host.children(
		postForm,
		div({ class: "fields" }).children(
			div({ class: "field input" }).children(
				textarea({ form: postForm.id })
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
			computed((add) => {
				const wallet = add(currentWalletDetail).val;
				const signer = wallet ? add(wallet.signer).val : null;

				const targetNetworkIndex = 0;
				const targetNetwork = add(config).val?.networks[targetNetworkIndex] ?? null;

				if (!signer || !wallet) {
					return a({ class: "button" })
						.href(connectWalletSearchParam.toHref(`${targetNetworkIndex}`))
						.textContent("Connect Wallet");
				}

				/* 	const network = wallet ? add(wallet.network).val : null;

				if (network?.chainId !== targetNetwork?.chainId) {
					return button({ class: "button" })
						.onclick(() => getOrRequestSigner({ wallet, network: targetNetwork }))
						.textContent("Switch Network");
				} */

				return button({ form: postForm.id, class: "button" })
					.type("submit")
					.disabled(currentProxy.derive((currentProxy) => !currentProxy))
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
		min-height: 2em;
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
