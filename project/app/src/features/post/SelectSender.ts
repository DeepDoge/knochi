import { awaited, computed, fragment, ref, tags } from "purify-js";
import { Config, currentConfig } from "~/features/config/state";

const { div, button, ul, li, img } = tags;

export type SelectedSender<T extends Config.Network = Config.Network> = {
	network: T;
	key: keyof T["contracts"]["KnochiSenders"];
};
export function SelectSender(params: { onChange: <T extends Config.Network>(selected: SelectedSender<T>) => unknown }) {
	const selectedSender = ref<SelectedSender | null>(null);

	const configAwaited = currentConfig.derive((config) => awaited(config));
	const config = computed((add) => add(add(configAwaited).val).val);

	const selectPopover = div()
		.id("select-sender")
		.popover("auto")
		.children(
			"Select Sender",
			ul().children(
				config.derive((config) => {
					if (!config) {
						return "Loading...";
					}

					return config.networks.map((network) => {
						return li().children(
							network.name,
							ul().children(
								Object.entries(network.contracts.KnochiSenders).map(([key, address]) => {
									return li().children(
										button()
											.onclick(() => {
												selectedSender.val = { network, key };
												selectPopover.element.hidePopover();
											})
											.children(key, address),
									);
								}),
							),
						);
					});
				}),
			),
		);

	const selectButton = button({ class: "button" })
		.popoverTargetElement(selectPopover.element)
		.popoverTargetAction("show")
		.children(
			selectedSender.derive((sender) => {
				if (!sender) {
					return "Select Sender";
				}

				return [img().src(sender.network.logoSrc), sender.key];
			}),
		);

	selectButton.use(() =>
		selectedSender.follow((sender) => {
			if (!sender) return;
			params.onChange(sender);
		}),
	);

	return fragment(selectButton, selectPopover);
}
