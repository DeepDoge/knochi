import { Signal, tags } from "@purifyjs/core";
import { Config } from "~/lib/config";
import { css, useScope } from "~/lib/css";
import { useClickClose } from "~/lib/effects/useClickClose";
import { useCloseOnDisconnect } from "~/lib/effects/useCloseOnDisconnect";
import { WalletList } from "~/lib/wallet/components/WalletList";

const { dialog, form, strong } = tags;

export function ConnectWalletDialog(params: {
	network: Signal<Config.Network | null>;
	isOpen: Signal<boolean>;
	close(): void;
}) {
	const { network, isOpen, close } = params;

	return dialog()
		.effect(useScope(ConnectWalletDialogCss))
		.effect(useClickClose())
		.effect(useCloseOnDisconnect())
		.effect((element) =>
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
