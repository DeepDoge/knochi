import { tags } from "@purifyjs/core";
import { FeedGroupAddFormPopoverButton } from "~/features/feed/components/FeedGroupAddFormPopoverButton";
import { Feed } from "~/features/feed/Feed";
import { ProfileView } from "~/features/profile/ProfileView";
import { config } from "~/shared/config";
import { Router } from "~/shared/router";
import { Address } from "~/shared/schemas/primatives";
import { css, useScope } from "~/shared/utils/css";
import { usePart } from "~/shared/utils/effects/usePart";
import { WalletAddress } from "~/shared/wallet/components/WalletAddress";

const { div, strong, small } = tags;

export const profileRoutes = {
	profile: new Router.Route({
		fromPathname(pathname) {
			return Address()
				.transform((address) => ({
					address,
					postsFeed: config.derive((config) => Feed.ProfilePosts({ address, config })),
				}))
				.parse(pathname);
		},
		toPathname(data: { address: Address }) {
			return data.address;
		},
		render(data) {
			const { address, postsFeed } = data;
			return postsFeed.derive((postsFeed) => ProfileView({ address, postsFeed }));
		},
		renderHeader(data) {
			const { address, postsFeed } = data;
			return div({ style: "display:contents" })
				.effect(useScope(profileHeaderCss))
				.children(
					[
						small().textContent("Profile:"),
						strong().children(WalletAddress(address).effect(usePart("address"))),
					],
					postsFeed.derive((postsFeed) =>
						FeedGroupAddFormPopoverButton({
							values: {
								feedId: postsFeed.id,
								style: { type: "profile", address, label: "posts" },
							},
						})
							.effect(usePart("button"))
							.textContent("Watch"),
					),
				);
		},
		title() {
			return "Profile";
		},
	}),
};

const profileHeaderCss = css`
	[data-part="address"] {
		max-inline-size: 10em;
	}

	[data-part="button"] {
		font-size: 0.7em;
		padding-block: 0.2em;
	}
`;
