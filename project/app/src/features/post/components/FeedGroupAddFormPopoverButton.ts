import { ref, tags } from "@purifyjs/core";
import { FeedGroupAddForm } from "~/features/post/components/FeedGroupAddForm";
import { postDb } from "~/features/post/database/client";
import { css, useScope } from "~/lib/css";

const { div, button, strong } = tags;

export function FeedGroupAddFormPopoverButton(params: {
	values: Parameters<typeof FeedGroupAddForm>[0]["values"];
}) {
	const open = ref(false);

	const popover = div()
		.effect(useScope(PopoverCss))
		.popover("auto")
		.ontoggle((event) => {
			if (!(event instanceof ToggleEvent)) return;
			open.val = event.newState === "open";
		})
		.children(
			strong().textContent("add to group"),
			open.derive((open) => {
				if (!open) return null;

				return FeedGroupAddForm({
					values: params.values,
					groups: postDb.find("FeedGroup").many({ by: "index", order: "prev" }),
					onDone() {
						popover.element.hidePopover();
					},
				});
			}),
		);

	return button()
		.effect(() => {
			document.body.append(popover.element);
			return () => {
				popover.element.remove();
			};
		})
		.popoverTargetElement(popover.element);
}

const PopoverCss = css`
	:scope:popover-open {
		display: block grid;
		inline-size: min(100%, 30em);
		gap: 2em;
		padding: 4em;

		background-color: var(--base);
		color: var(--pop);
	}

	strong {
		font-size: 2em;
	}
`;
