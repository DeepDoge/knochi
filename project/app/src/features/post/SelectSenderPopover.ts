import { tags } from "@purifyjs/core";
import { Config, currentConfig } from "~/features/config/state";

const { div, button, ul, li } = tags;

export type SelectedSender = {
	network: Config.Network;
	key: string;
};

export function SelectSenderPopover(params: { onChange: (selectedSender: SelectedSender) => unknown }) {
	const popover = div()
		.popover("auto")
		.children("Select Sender", ul().children(currentConfig.derive(renderOptions)));

	function renderOptions(config: Config) {
		return Object.values(config.networks).map((network) =>
			li().children(
				network.name,
				ul().children(
					Object.entries(network.contracts.PostStores.Plain).map(([key, address]) => {
						return li().children(
							button()
								.type("button")
								.ariaDescription("Sender Option")
								.onclick(() => {
									popover.element.hidePopover();
									params.onChange({ network, key });
								})
								.children(key, address),
						);
					}),
				),
			),
		);
	}

	return popover;
}
