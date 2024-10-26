import { Signal, tags } from "@purifyjs/core";
import { clickClose } from "~/lib/actions/clickClose";
import { closeOnDisconnect } from "~/lib/actions/closeOnDisconnect";
import { Config } from "~/lib/config";
import { css, scope } from "~/lib/css";
import { WalletList } from "~/lib/wallet/components/WalletList";

const { dialog, form, strong } = tags;

export function ConnectWalletDialog(params: {
	network: Signal<Config.Network | null>;
	isOpen: Signal<boolean>;
	close(): void;
}) {
	const { network, isOpen, close } = params;

	return dialog()
		.use(scope(ConnectWalletDialogCss))
		.use(clickClose())
		.use(closeOnDisconnect())
		.use((element) =>
			isOpen.follow((isOpen) => {
				if (isOpen) {
					element.showModal();
				} else {
					element.close();
				}
			}, true),
		)
		.onclose((event) => {
			event.preventDefault();
			close();
		})
		.children(
			strong().children("connect wallet"),
			form()
				.method("dialog")
				.children(network.derive((network) => WalletList({ network, onConnect: close }))),
		);
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
