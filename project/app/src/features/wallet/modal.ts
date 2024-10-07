import { tags } from "purify-js";
import { SearchParamsSignal } from "~/features/router/url";
import { css, scopeCss } from "~/utils/style";
import { WalletList } from "./WalletList";

const { div, strong } = tags;

const styleCss = css`
	:scope {
		display: block grid;
		align-content: start;

		inline-size: min(100%, 40em);
		padding: 4em;
		gap: 1em;

		background-color: var(--base);
		color: var(--accent);
		border: solid color-mix(in srgb, var(--base), var(--accent) 10%);
	}

	strong {
		font-size: 2em;
		&::after {
			content: ":";
		}
	}
`;

const host = div().use(scopeCss(styleCss)).popover("");
host.children(strong().textContent("Connect Wallet"), WalletList({ onFinally: () => host.element.hidePopover() }));

const searchParam = new SearchParamsSignal<"open">("connect");
host.use(() =>
	searchParam.follow((value) => {
		if (value === "open") {
			host.element.showPopover();
		} else {
			host.element.hidePopover();
		}
	}, true),
);
host.ontoggle((event) => {
	if (!(event instanceof ToggleEvent)) return;
	searchParam.val = event.newState === "open" ? "open" : null;
});

document.body.append(host.element);

export const connectWalletShowModalHref = searchParam.toHref("open");
