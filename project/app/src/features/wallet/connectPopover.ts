import { awaited, computed, tags } from "purify-js";
import { currentConfig } from "~/features/config/state";
import { SearchParamsSignal } from "~/features/router/url";
import { css, scopeCss } from "~/utils/style";
import { WalletList } from "./WalletList";

const { div, strong } = tags;

const host = div().id("connect-wallet").popover("auto");
export const connectWalletPopoverElement = host.element;

export const connectWalletSearchParam = new SearchParamsSignal<`${number}` | "auto">("connect");
const searchParamNetwork = computed(async (add) => {
	const indexOrNaN = Number(add(connectWalletSearchParam).val);
	if (isNaN(indexOrNaN)) return null;

	const config = await add(currentConfig).val;
	return config.networks[indexOrNaN] ?? null;
});

host.children(
	strong().textContent("Connect Wallet"),
	searchParamNetwork.derive((network) =>
		awaited(
			network.then((network) => {
				return WalletList({ network, onDone: () => host.element.hidePopover() });
			}),
			"Loading...",
		),
	),
);

host.use(() =>
	connectWalletSearchParam.follow((value) => {
		if (value) {
			host.element.showPopover();
		} else {
			host.element.hidePopover();
		}
	}, true),
);
host.ontoggle((event) => {
	if (!(event instanceof ToggleEvent)) return;

	if (event.newState === "open") {
		if (connectWalletSearchParam.val) return;
		connectWalletSearchParam.val = "auto";
	} else {
		connectWalletSearchParam.val = null;
	}
});

host.use(
	scopeCss(css`
		:scope:popover-open {
			display: block grid;
			align-content: start;

			inline-size: min(100%, 40em);
			padding: 4em;
			gap: 1em;

			background-color: var(--base);
			color: var(--pop);
			border: solid color-mix(in srgb, var(--base), var(--pop) 10%);
		}

		strong {
			font-size: 2em;
			&::after {
				content: ":";
			}
		}
	`),
);
