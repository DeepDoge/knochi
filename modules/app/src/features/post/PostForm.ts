import { IKnochiSender } from "@root/contracts/connect";
import { zeroPadBytes } from "ethers";
import { computed, fragment, ref, tags } from "purify-js";
import { config } from "~/features/config";
import { PostContent } from "~/features/post/utils";
import { getOrRequestSigner } from "~/features/wallet/util.s";
import { rootSheet } from "~/styles";
import { bind } from "~/utils/actions/bind";
import { css } from "~/utils/style";
import { uniqueId } from "~/utils/unique";

const { form, div, textarea, button, small, hr, input, details, summary, ul, li, label } = tags;

export function PostForm() {
	const host = div({ role: "form" });
	const shadow = host.element.attachShadow({ mode: "open" });
	shadow.adoptedStyleSheets.push(rootSheet, PostFormStyle);

	const text = ref("");
	const textEncoded = text.derive((text) =>
		PostContent.toBytes([{ type: PostContent.Part.TypeMap.Text, value: text }]),
	);
	const textByteLength = textEncoded.derive((textEncoded) => textEncoded.byteLength);

	const proxyContracts = config.derive((config) => config.networks[0].contracts.KnochiProxies);
	const proxyContractEntries = proxyContracts.derive((proxyContracts) => Object.entries(proxyContracts));
	const currentProxyKey = ref("");
	host.element.onConnect(() =>
		proxyContractEntries.follow((entries) => (currentProxyKey.val = entries[0]?.[0] ?? ""), true),
	);
	const currentProxy = computed((add) => add(proxyContracts).val[add(currentProxyKey).val]);

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
			const proxyContract = IKnochiSender.connect(signer, address);

			const tx = await proxyContract.post(
				config.val.networks[0].contracts.KnochiIndexer,
				[zeroPadBytes(signer.address, 32)],
				textEncoded.val,
			);
		}).element;

	shadow.append(
		fragment(
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
				button({ form: postForm.id, class: "button" })
					.type("submit")
					.disabled(currentProxy.derive((currentProxy) => !currentProxy))
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
