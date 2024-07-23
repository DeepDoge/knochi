import { IEternisProxy } from "@root/contracts/connect";
import { zeroPadBytes } from "ethers";
import { computed, css, fragment, ref, sheet, tags } from "purify-js";
import { PostContent } from "~/features/post/utils";
import { globalSheet } from "~/styles";
import { config } from "~/utils/config";
import { uniqueId } from "~/utils/unique";
import { getSigner } from "~/utils/wallet";

const { form, div, textarea, button, small, input, details, summary, ul, li, label } = tags;

export function PostForm() {
	const host = div({ role: "form" });
	const shadow = host.element.attachShadow({ mode: "open" });
	shadow.adoptedStyleSheets.push(globalSheet, PostFormStyle);

	const text = ref("");
	const textEncoded = computed(() => PostContent.toBytes([{ type: PostContent.Part.TypeMap.Text, value: text.val }]));

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

			const signer = await getSigner();
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
					small().children(
						computed(() => textEncoded.val.byteLength),
						" bytes",
					),
				),
			),
			div({ class: "actions" }).children(
				div()
					.role("group")
					.children(
						button({
							form: postForm.id,
						})
							.role("button")
							.type("submit")
							.disabled(computed(() => !currentProxy.val))
							.children("Post"),
						button()
							.role("button")
							.children(
								details().children(
									summary().children(),
									ul().children(
										computed(() =>
											proxyContractEntries.val.map(([key, address]) =>
												li().children(
													label().children(
														input()
															.type("radio")
															.name("proxy")
															.value(key)
															.checked(computed(() => currentProxyKey.val === key))
															.onchange(
																(event) =>
																	event.currentTarget.checked &&
																	(currentProxyKey.val = key),
															),
														key,
													),
												),
											),
										),
									),
								),
							),
					),
			),
		),
	);

	return host;
}

const PostFormStyle = sheet(css`
	:host {
		display: grid;
		gap: 1em;
	}

	.fields {
		display: grid;
		gap: 1em;
	}

	.field {
		display: grid;
		gap: 0.25em;

		& small {
			justify-self: end;
		}
	}

	.actions {
		display: grid;
		grid-auto-flow: column;
		justify-content: end;
		gap: 1em;
	}

	textarea {
		resize: none;
		min-height: 2em;
		font-size: 1.25em;
		overflow-x: hidden;
		overflow-wrap: break-word;
	}

	.actions [role="group"] {
		position: relative;
	}

	details:has(> ul) {
		ul {
			position: absolute;
			inset-block-start: calc(100% + 0.5em);
			inset-inline-end: 0;
			color: var(--back);
			background-color: var(--front);
			list-style: none;
			padding: 0.5em;
			border-radius: var(--radius);
		}
	}
`);
