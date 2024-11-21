import { Signal, tags } from "@purifyjs/core";
import {
	SelectedSender,
	SelectSenderPopover,
} from "~/features/feed/components/SelectSenderPopover";
import { css, useScope } from "~/shared/utils/css";
import { match } from "~/shared/utils/signals/match";

const { button, img } = tags;

export function SelectSenderButton(params: {
	selectedSender: Signal.State<SelectedSender | null>;
}) {
	const { selectedSender } = params;

	const selectSenderPopover = SelectSenderPopover({
		onChange(sender) {
			selectedSender.val = sender;
		},
	});

	const selectSenderButton = button()
		.type("button")
		.effect(useScope(SelectSenderButtonCss))
		.ariaDescription("Currently selected sender contract, click to change.")
		.effect((element) => {
			element.after(selectSenderPopover.element);
			return () => selectSenderPopover.remove();
		})
		.children(
			match(selectedSender)
				.if((sender) => sender === null)
				.then(() => "Select Sender")
				.else((sender) =>
					sender.derive((sender) => [img().src(sender.network.iconSrc), sender.key]),
				),
		);

	selectSenderButton.popoverTargetElement(selectSenderPopover.element);
	selectSenderPopover.anchorElement(selectSenderButton.element);

	return selectSenderButton;
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
