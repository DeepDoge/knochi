import { awaited, tags } from "@purifyjs/core";
import { FeedGroupIconSvg } from "~/app/feed/components/FeedGroupIconSvg.ts";
import { postDb } from "~/app/feed/database/client.ts";
import { feedGroupSearchParam } from "~/app/feed/routes.ts";
import { router } from "~/app/router.ts";
import { TrashcanSvg } from "~/assets/svgs/TrashcanSvg.ts";
import { Router } from "~/domains/router/mod.ts";
import { WalletAddress, WalletAvatarSvg } from "~/domains/wallet/mod.ts";
import { css, useScope } from "~/shared/css.ts";
import { useClass } from "~/shared/effects/useClass.ts";

const { div, strong, small, button, a, header } = tags;

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

		const itemAnchor = a({ class: "item" }).href(href).title(item.style.label);

		if (item.style.type === "profile") {
			const itemStyle = item.style;
			const ariaCurrent = router.route.derive((route) =>
				route?.name === "profile" && route.data.address === itemStyle.address ?
					"page"
				:	"false",
			);
			return itemAnchor
				.effect(useClass("profile"))
				.ariaCurrent(ariaCurrent)
				.children(
					WalletAvatarSvg(itemStyle.address),
					strong().children(itemStyle.label),
					small().children(WalletAddress(itemStyle.address)),
				);
		}

		if (item.style.type === "feed") {
			const ariaCurrent = router.route.derive((route) =>
				route?.name === "feed" && route.data.feedId === item.feedId ? "page" : "false",
			);

			return itemAnchor
				.effect(useClass("feed"))
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
		display: block grid;
		grid-template-columns: 1fr 1.5em;
		gap: 0.5em;
		align-items: center;

		padding-block: 1em;
		padding-inline: 1em;
		border-block-end: solid 1px color-mix(in srgb, var(--base), var(--pop) 10%);
	}

	.item {
		display: block grid;
		grid-template-columns: 1.5em auto;
		gap: 0.5em;
		padding: 1em;

		&[aria-current="page"] {
			background-color: color-mix(in srgb, transparent, currentColor 5%);
		}

		&.profile {
			grid-template-columns: 1.5em auto;
			grid-template-areas:
				"icon strong"
				"icon small";

			svg {
				grid-area: icon;
			}

			strong {
				grid-area: strong;
			}

			small {
				grid-area: small;
			}
		}
	}
`;
