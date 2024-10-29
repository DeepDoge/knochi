import { tags } from "@purifyjs/core";
import { feedGroupFormDialogSearchParam } from "~/app/feed/feedGroupFormDialog";
import { feedGroupSearchParam } from "~/app/feed/feedGroupSearchParam";
import { CreateFolderSvg } from "~/assets/svgs/CreateFolderSvg";
import { RssSvg } from "~/assets/svgs/RssSvg";
import { FeedGroupIcon } from "~/features/post/components/FeedGroupIcon";
import { postDb } from "~/features/post/database/client";
import { css, scope } from "~/lib/css";

const { div, hr, a } = tags;

export function FeedGroupTabList(
	groups: ReturnType<typeof postDb.lastVersion.models.FeedGroup.parser>[],
) {
	return div()
		.use(scope(FeedGroupTabListCss))
		.role("tablist")
		.children(
			(() => {
				const id = "~";
				const current = feedGroupSearchParam.derive((value) => value === id || !value);
				return a()
					.role("tab")
					.href("#/")
					.title("Home Feed")
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
					.children(FeedGroupIcon(group.name));
			}),
		);
}

const FeedGroupTabListCss = css`
	:scope {
		display: block grid;
		align-content: start;
		gap: 0.5em;
		overflow: overlay;

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

		&.add {
			background-color: transparent;
			color: var(--pop);
			padding: 0.5em;
			border: dashed color-mix(in srgb, currentColor, transparent 75%) 0.25em;
		}
	}
`;
