import { tags } from "@purifyjs/core";
import { FeedGroupIconSvg } from "~/features/feed/components/FeedGroupIconSvg";
import { feedDB } from "~/features/feed/database/client";
import { feedGroupFormDialogSearchParam } from "~/features/feed/feedGroupFormDialog";
import { feedGroupSearchParam } from "~/features/feed/routes";
import { CreateFolderSvg } from "~/shared/svgs/CreateFolderSvg";
import { RssSvg } from "~/shared/svgs/RssSvg";
import { css, useScope } from "~/shared/utils/css";

const { div, hr, a } = tags;

export function FeedGroupTabList(
	groups: ReturnType<typeof feedDB.lastVersion.models.FeedGroup.parser>[],
) {
	return div()
		.effect(useScope(FeedGroupTabListCss))
		.role("tablist")
		.children(
			(() => {
				const id = "~";
				const current = feedGroupSearchParam.derive((value) => value === id || !value);
				return a()
					.role("tab")
					.href("#/")
					.title("My Feed")
					.attributes({ "aria-controls": "header-tabpanel-home" })
					.ariaSelected(current.derive(String))
					.tabIndex(current.derive((current) => (current ? 0 : -1)))
					.children(RssSvg());
			})(),
			hr(),
			a({ class: "add" })
				.href(feedGroupFormDialogSearchParam.toHref("create"))
				.ariaLabel("Create Feed Group")
				.title("Create Group")
				.children(CreateFolderSvg()),
			groups.map((group) => {
				const href = feedGroupSearchParam.toHref(group.groupId);
				const current = feedGroupSearchParam.derive((value) => value === group.groupId);
				return a({ class: "full" })
					.role("tab")
					.href(href)
					.title(group.name)
					.attributes({ "aria-controls": "header-tabpanel-home" })
					.ariaSelected(current.derive(String))
					.tabIndex(current.derive((current) => (current ? 0 : -1)))
					.children(FeedGroupIconSvg(group));
			}),
		);
}

const FeedGroupTabListCss = css`
	:scope {
		display: block grid;
		align-content: start;
		gap: 0.5em;
		overflow-y: auto;
		scrollbar-width: none;

		padding-inline: 0.5em;
		padding-block: 1em;

		background-color: color-mix(in srgb, var(--base), var(--pop) 5%);
	}

	:is([role="tab"], a) {
		display: block grid;
		inline-size: 3em;
		aspect-ratio: 1;
		padding: 0.75em;
		&.full {
			padding: 0.2em;
		}

		border-radius: 50%;
		overflow: clip;

		background-color: color-mix(in srgb, var(--base), var(--pop) 20%);

		&[aria-selected="true"] {
			background-color: var(--pop);
			color: var(--base);
		}
	}

	.add {
		background-color: transparent;
		color: var(--pop);
		padding: 0.5em;
		border: dashed color-mix(in srgb, currentColor, transparent 75%) 0.25em;
	}
`;
