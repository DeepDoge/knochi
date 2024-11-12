import { Signal, tags } from "@purifyjs/core";
import { Config } from "~/shared/config";
import { css, useScope } from "~/shared/css";
import { useClickClose } from "~/shared/effects/useClickClose";
import { useCloseOnDisconnect } from "~/shared/effects/useCloseOnDisconnect";
import { WalletList } from "~/shared/wallet/components/WalletList";

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
