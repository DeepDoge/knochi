import { IEternisProxy } from "@root/contracts/connect";
import { zeroPadBytes } from "ethers";
import { computed, fragment, ref, tags } from "purified-js";
import { config } from "~/features/config";
import { PostContent } from "~/features/post/utils";
import { getOrRequestSigner } from "~/features/wallet/util.s";
import { globalSheet } from "~/styles";
import { css } from "~/utils/style";
import { uniqueId } from "~/utils/unique";

const { form, div, textarea, button, small, hr, input, details, summary, ul, li, label } = tags;

export function PostForm() {
	const host = div({ role: "form" });
	const shadow = host.element.attachShadow({ mode: "open" });
	shadow.adoptedStyleSheets.push(globalSheet, PostFormStyle);

	const text = ref("");
	const textEncoded = computed(() => PostContent.toBytes([{ type: PostContent.Part.TypeMap.Text, value: text.val }]));
	const textByteLength = computed(() => textEncoded.val.byteLength);

	const proxyContracts = computed(() => config.val.networks[0].contracts.EternisProxies);
	const proxyContractEntries = computed(() => Object.entries(proxyContracts.val));
	const currentProxyKey = ref("");
	host.element.onConnect(() =>
		proxyContractEntries.follow((entries) => (currentProxyKey.val = entries[0]?.[0] ?? ""), true),
	);
	const currentProxy = computed(() => proxyContracts.val[currentProxyKey.val]);

	const postForm = form()
		.id(uniqueId("post-form"))
		.hidden(true)
		.onsubmit(async (event) => {
			event.preventDefault();

			const address = currentProxy.val;
			if (!address) return;

			const signer = await getOrRequestSigner();
			if (!signer) {
				alert("Something went wrong");
				return;
			}
			const proxyContract = IEternisProxy.connect(signer, address);

			const tx = await proxyContract.post(
				config.val.networks[0].contracts.EternisIndexer,
				[zeroPadBytes(signer.address, 32)],
				textEncoded.val,
			);
		}).element;

	shadow.append(
		fragment(
			postForm,
			div({ class: "fields" }).children(
				div({ class: "field" }).children(
					textarea({ form: postForm.id })
						.role("textbox")
						.name("content")
						.required(true)
						.ariaLabel("Post content")
						.placeholder("Just say it...")
						.value(text)
						.oninput((event) => {
							const textarea = event.currentTarget;
							textarea.style.height = "auto";
							textarea.style.height = `calc(calc(${textarea.scrollHeight}px - 1em))`;
							text.val = textarea.value;
						}),
				),
			),
			div({ class: "actions" }).children(
				small().children(textByteLength, " bytes"),
				hr(),
				button({ form: postForm.id })
					.role("button")
					.type("submit")
					.disabled(computed(() => !currentProxy.val))
					.children("Post"),
			),
		),
	);

	return host;
}

const PostFormStyle = css`
	:host {
		display: grid;
		gap: 0.8em;
	}

	.fields {
		display: grid;
		gap: 0.8em;
	}

	.field {
		display: grid;
		gap: 0.2em;

		& small {
			justify-self: end;
		}
	}

	.actions {
		display: grid;
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
