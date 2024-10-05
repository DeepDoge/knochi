import { tags } from "purify-js";
import { SearchParamsSignal } from "~/features/router/url";
import { css, scopeCss } from "~/utils/style";
import { WalletList } from "./WalletList";

const { dialog, div, strong } = tags;

const styleCss = css`
	:scope {
		inline-size: min(100%, 35em);

		background-color: var(--base);
		color: var(--accent);
		border: solid color-mix(in srgb, var(--base), var(--accent) 10%);
	}

	.body {
		display: block grid;
		align-content: start;
	}

	strong {
		font-size: 2em;
	}

	.list {
		padding-block: 2em;
	}
`;

const host = dialog().use(scopeCss(styleCss));
host.children(
	div({ class: "body" }).children(
		strong().textContent("Connect Wallet"),
		div({ class: "list" }).children(WalletList({ onFinally: () => host.element.close() })),
	),
);
host.onclose((event) => {
	event.preventDefault();
	searchParam.val = null;
});

document.body.append(host.element);

const searchParam = new SearchParamsSignal<"true">("connect");
searchParam.follow((value) => {
	if (value === "true") {
		host.element.showModal();
	} else {
		host.element.close();
	}
}, true);

export { searchParam as connectWalletSearchParam };
export const connectWalletShowModalHref = searchParam.toHref("true");
