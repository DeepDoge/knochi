import { ref, tags } from "@purifyjs/core";
import { FeedGroupAddForm } from "~/features/post/components/FeedGroupAddForm";
import { postDb } from "~/features/post/database/client";
import { Feed } from "~/features/post/lib/Feed";
import { css, scope } from "~/lib/css";

const { div, button } = tags;

export function FeedGroupAddFormPopoverButton(values: {
	feedId: Feed.Id;
	label: string;
	icon: string;
}) {
	const open = ref(false);

	const popover = div()
		.use(scope(PopoverCss))
		.popover("auto")
		.ontoggle((event) => {
			if (!(event instanceof ToggleEvent)) return;
			open.val = event.newState === "open";
		})
		.children(
			open.derive((open) => {
				if (!open) return null;

				return FeedGroupAddForm({
					values,
					groups: postDb.find("FeedGroup").many({ by: "index", order: "prev" }),
					onDone() {
						popover.element.hidePopover();
					},
				});
			}),
		);

	return button()
		.use(() => {
			document.body.append(popover.element);
			return () => {
				popover.element.remove();
			};
		})
		.popoverTargetElement(popover.element);
}

const PopoverCss = css`
	:scope {
		inline-size: min(100%, 30em);
		padding: 4em;

		background-color: var(--base);
		color: var(--pop);
	}
`;
