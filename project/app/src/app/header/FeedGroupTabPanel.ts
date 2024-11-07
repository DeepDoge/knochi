import { awaited, tags } from "@purifyjs/core";
import { feedGroupSearchParam } from "~/app/feed/feedGroupSearchParam";
import { router } from "~/app/router";
import { TrashcanSvg } from "~/assets/svgs/TrashcanSvg";
import { FeedGroupIconSvg } from "~/features/feed/components/FeedGroupIcon";
import { postDb } from "~/features/feed/database/client";
import { css, useScope } from "~/lib/css";
import { Router } from "~/lib/router/mod";
import { WalletAddress } from "~/lib/wallet/components/WalletAddress";
import { WalletAvatarSvg } from "~/lib/wallet/components/WalletAvatarSvg";

const { div, strong, button, a, header } = tags;

export function FeedGroupTabPanel(
	group: ReturnType<typeof postDb.lastVersion.models.FeedGroup.parser>,
) {
	const items = postDb.find("FeedGroupItem").byIndex("groupId", "=", group.groupId);

	function renderItem(item: Awaited<typeof items>[number]) {
		const searchParams = new URLSearchParams(location.search);
		searchParams.set(feedGroupSearchParam.name, item.groupId);
		const href = Router.hrefFrom(
			item.style.type === "profile" ?
				router.routes.profile.toPathname({ address: item.style.address })
			:	router.routes.feed.toPathname({ feedId: item.feedId }),
			searchParams,
		);

		const itemAnchor = a().href(href).title(item.style.label);

		if (item.style.type === "profile") {
			const itemStyle = item.style;
			const ariaCurrent = router.route.derive((route) =>
				route?.name === "profile" && route.data.address === itemStyle.address ?
					"page"
				:	"false",
			);
			return itemAnchor
				.effect(useScope(FeedGroupTabPanelItemCss))
				.ariaCurrent(ariaCurrent)
				.children(WalletAvatarSvg(itemStyle.address), WalletAddress(itemStyle.address));
		}

		if (item.style.type === "feed") {
			const ariaCurrent = router.route.derive((route) =>
				route?.name === "feed" && route.data.feedId === item.feedId ? "page" : "false",
			);

			return itemAnchor
				.effect(useScope(FeedGroupTabPanelItemCss))
				.ariaCurrent(ariaCurrent)
				.children(FeedGroupIconSvg(group), item.style.label);
		}

		item.style satisfies never;
		return itemAnchor.textContent("Unknown Feed Type");
	}

	return div()
		.effect(useScope(FeedGroupTabPanelCss))
		.role("tabpanel")
		.id("header-tabpanel-home")
		.tabIndex(0)
		.ariaLabel("Home Feed")
		.children(
			header().children(
				strong().textContent(group.name),
				button({ style: "color:var(--fail)" })
					.ariaLabel("Delete Group")
					.title("Delete")
					.children(TrashcanSvg()),
			),
			awaited(items.then((items) => items.map(renderItem))),
		);
}

const FeedGroupTabPanelItemCss = css`
	:scope {
		display: grid;
		grid-template-columns: 1.5em auto;
		gap: 0.5em;
		padding: 1em;
	}

	:scope[aria-current="page"] {
		background-color: color-mix(in srgb, transparent, currentColor 5%);
	}
`;

const FeedGroupTabPanelCss = css`
	:scope {
		display: block grid;
		align-content: start;

		background-color: color-mix(in srgb, var(--base), var(--pop) 7.5%);
	}

	strong {
		overflow: hidden;
		white-space: nowrap;
		text-overflow: ellipsis;
	}

	header {
		display: grid;
		grid-template-columns: 1fr 1.5em;
		gap: 0.5em;
		align-items: center;

		padding-block: 1em;
		padding-inline: 1em;
		border-block-end: solid 1px color-mix(in srgb, var(--base), var(--pop) 10%);
	}
`;
