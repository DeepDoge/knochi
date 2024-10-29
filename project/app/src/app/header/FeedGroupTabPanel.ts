import { awaited, tags } from "@purifyjs/core";
import { feedGroupSearchParam } from "~/app/feed/feedGroupSearchParam";
import { router } from "~/app/router";
import { TrashcanSvg } from "~/assets/svgs/TrashcanSvg";
import { postDb } from "~/features/post/database/client";
import { css, scope } from "~/lib/css";
import { Router } from "~/lib/router/mod";

const { div, strong, button, a } = tags;

export function FeedGroupTabPanel(
	group: ReturnType<typeof postDb.lastVersion.models.FeedGroup.parser>,
) {
	const items = postDb.find("FeedGroupItem").byIndex("groupId", "=", group.groupId);

	return div()
		.use(scope(FeedGroupTabPanelCss))
		.role("tabpanel")
		.id("header-tabpanel-home")
		.tabIndex(0)
		.ariaLabel("Home Feed")
		.children(
			strong().textContent(group.name),
			button({ style: "color:var(--fail)" })
				.ariaLabel("Delete Group")
				.title("Delete")
				.children(TrashcanSvg()),
			awaited(
				items.then((items) => {
					return items.map((item) => {
						const searchParams = new URLSearchParams(location.search);
						searchParams.set(feedGroupSearchParam.name, item.groupId);
						const href = Router.hrefFrom(
							item.style.type === "profile" ?
								router.routes.profile.toPathname({ address: item.style.address })
							:	router.routes.feed.toPathname({ feedId: item.feedId }),
							searchParams,
						);

						return a().href(href).title(item.style.label).textContent(item.style.label);
					});
				}),
			),
		);
}

const FeedGroupTabPanelCss = css`
	a {
		color: inherit;
	}

	:scope {
		display: block grid;
		align-content: start;

		padding-inline: 1em;
		padding-block: 1em;

		background-color: color-mix(in srgb, var(--base), var(--pop) 7.5%);
	}

	strong {
		overflow: hidden;
		white-space: nowrap;
		text-overflow: ellipsis;
	}
`;
