import { awaited, computed, tags } from "@purifyjs/core";
import { Config, currentConfig } from "~/features/config/state";
import { SearchParamsSignal } from "~/features/router/url";
import { WalletList } from "~/features/wallet/WalletList";
import { clickClose } from "~/utils/actions/clickClose";
import { css, scope } from "~/utils/style";

const { dialog, form, strong } = tags;

export function createConnectWalletDialog(searchParamName: string) {
	const searchParam = new SearchParamsSignal<`${Config.Network.ChainId}` | "open">(searchParamName);

	const configAwaited = currentConfig.derive((config) => awaited(config));
	const config = computed(() => configAwaited.val.val);

	const searchParamNetwork = computed(() => {
		const searchParamValue = searchParam.val;
		if (!searchParamValue) return null;

		try {
			const chainId = BigInt(searchParamValue);
			return config.val?.networks[`${chainId}`] ?? null;
		} catch {
			return null;
		}
	});

	const connectWalletDialog = dialog()
		.use(clickClose())
		.use(scope(ConnectWalletDialogCss))
		.use((element) =>
			searchParam.follow((value) => {
				if (value) {
					element.showModal();
				} else {
					element.close();
				}
			}, true),
		)
		.onclose(() => {
			searchParam.val = null;
		})
		.children(
			strong().children("Connect Wallet"),
			form()
				.method("dialog")
				.children(
					searchParamNetwork.derive((network) =>
						WalletList({
							network,
							onDone() {
								connectWalletDialog.element.close();
							},
						}),
					),
				),
		);

	function connect() {
		document.body.append(connectWalletDialog.element);

		return () => {
			connectWalletDialog.element.close();
			connectWalletDialog.element.remove();
		};
	}

	function open(chainId?: Config.Network.ChainId | null) {
		searchParam.val = chainId ? String(chainId) : null;
	}

	return { searchParam, connect, open };
}

const ConnectWalletDialogCss = css`
	:scope {
		align-content: start;

		inline-size: min(100%, 40em);
		padding: 4em;
		gap: 1em;

		background-color: var(--base);
		color: var(--pop);
		&[open] {
			display: block grid;
		}
	}

	strong {
		font-size: 2em;
		&::after {
			content: ":";
		}
	}
`;
