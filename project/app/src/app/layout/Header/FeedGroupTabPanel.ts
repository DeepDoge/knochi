import { tags } from "@purifyjs/core";
import { feedDB } from "~/features/feed/database/client";
import { feedGroupSearchParam } from "~/features/feed/routes";
import { ProfileRoute } from "~/features/profile/routes";
import { Router } from "~/shared/router";
import { HomeSvg } from "~/shared/svgs/HomeSvg";
import { TrashcanSvg } from "~/shared/svgs/TrashcanSvg";
import { SignalOrValue } from "~/shared/types/signal";
import { css, useScope } from "~/shared/utils/css";
import { awaited } from "~/shared/utils/signals/awaited";
import { WalletAvatarSvg } from "~/shared/wallet/components/WalletAvatarSvg";

const { div, strong, button, a, header } = tags;

export function FeedGroupTabPanel(
	group: ReturnType<typeof feedDB.lastVersion.models.FeedGroup.parser>,
) {
	const items = feedDB.find("FeedGroupItem").byIndex("groupId", "=", group.groupId);

	function renderItem(params: {
		icon: SignalOrValue<SVGSVGElement>;
		name: SignalOrValue<string>;
		pathname: string;
	}) {
		const searchParams = new URLSearchParams(location.search);
		searchParams.set(feedGroupSearchParam.name, group.groupId);
		const href = Router.hrefFrom(params.pathname, searchParams);

		return a({ class: "item" })
			.href(href)
			.title(params.name)
			.ariaCurrent(
				Router.pathname.derive((pathname) =>
					pathname === params.pathname ? "page" : "false",
				),
			)
			.children(params.icon, strong().children(params.name));
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
			renderItem({
				icon: Router.pathname.derive((pathname) =>
					pathname === "" ? HomeSvg({ filled: true }) : HomeSvg({ filled: false }),
				),
				name: "All",
				pathname: "",
			}),
			awaited(
				items.then((items) =>
					items.map(({ style }) =>
						style.type === "profile" ?
							renderItem({
								icon: WalletAvatarSvg(style.address),
								name: style.address,
								pathname: new ProfileRoute(style.address).pathname,
							})
						:	null,
					),
				),
			),
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
		align-items: center;
		gap: 0.5em;
		padding: 1em;

		&[aria-current="page"] {
			background-color: color-mix(in srgb, transparent, currentColor 5%);
		}
	}
`;
