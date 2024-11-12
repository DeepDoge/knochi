import { fragment, ref, Signal, tags } from "@purifyjs/core";
import {
	SelectedSender,
	SelectSenderPopover,
} from "~/features/feed/components/SelectSenderPopover";
import { css, useScope } from "~/shared/css";

const { button, img } = tags;

export function SelectSenderButton(params?: {
	selectedSender?: Signal.State<SelectedSender | null>;
	selectSenderPopover?: HTMLElement;
}) {
	const selectedSender = params?.selectedSender ?? ref<SelectedSender | null>(null);
	const selectSenderPopover =
		params?.selectSenderPopover ??
		SelectSenderPopover({
			onChange(sender) {
				selectedSender.val = sender;
			},
		}).element;

	return (
		button()
			.type("button")
			.effect(useScope(SelectSenderButtonCss))
			/* .effect((element) => {
			selectSenderPopover.anchorElement = element;
		}) */
			.ariaDescription("Currently selected sender contract, click to change.")
			.popoverTargetElement(selectSenderPopover)
			.effect((element) => {
				element.after(selectSenderPopover);
				return () => {
					selectSenderPopover.remove();
				};
			})
			.children(
				selectedSender.derive((sender) => {
					if (!sender) {
						return "Select Sender";
					}

					return fragment(img().src(sender.network.iconSrc), sender.key);
				}),
			)
	);
}

const SelectSenderButtonCss = css``;