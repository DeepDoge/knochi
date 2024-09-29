import { tags } from "purify-js";
import { SearchParamsSignal } from "../router/url";
import { WalletList } from "./WalletList";

const css = String.raw;
const { dialog, style, div, strong } = tags;

const styleElement = () => styleElementPrototype.element.cloneNode(true) as HTMLStyleElement;
const styleElementPrototype = style().textContent(css`
	@scope to (.list > *) {
		:scope {
			inline-size: min(100%, 35em);

			background-color: var(--base);
			color: var(--accent);
			border: solid color-mix(in srgb, var(--base), var(--accent) 10%);
		}

		.body {
			display: grid;
			align-content: start;
		}

		strong {
			font-size: 2em;
			justify-self: center;
		}

		.list {
			padding-block: 2em;
		}
	}
`);

const host = dialog();
host.children(
	styleElement(),
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

const searchParam = new SearchParamsSignal("connect");
searchParam.follow((value) => {
	if (value === "true") {
		host.element.showModal();
	} else {
		host.element.close();
	}
}, true);

export const showConnectModalHref = searchParam.toHref("true");
