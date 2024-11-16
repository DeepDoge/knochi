import { fragment, ref, Signal, tags } from "@purifyjs/core";
import {
	SelectedSender,
	SelectSenderPopover,
} from "~/features/feed/components/SelectSenderPopover";
import { css, useScope } from "~/shared/utils/css";

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
			/* .effect((element) => { // Missing browser support
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

const SelectSenderButtonCss = css`
	:scope {
		font-size: 0.75em;

		display: block grid;
		grid-template-columns: 0.75em auto;
		align-items: center;
		gap: 0.5em;
	}
`;
