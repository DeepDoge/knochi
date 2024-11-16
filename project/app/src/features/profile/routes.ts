import { FeedGroupAddFormPopoverButton } from "~/features/feed/components/FeedGroupAddFormPopoverButton";
import { Feed } from "~/features/feed/Feed";
import { ProfileView } from "~/features/profile/ProfileView";
import { config } from "~/shared/config";
import { Router } from "~/shared/router";
import { Address } from "~/shared/schemas/primatives";
import { css, useScope } from "~/shared/utils/css";

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
		renderHeaderEnd(data) {
			const { address, postsFeed } = data;
			return postsFeed.derive((postsFeed) =>
				FeedGroupAddFormPopoverButton({
					values: {
						feedId: postsFeed.id,
						style: { type: "profile", address, label: "posts" },
					},
				})
					.effect(useScope(profilePageHeaderEndCss))
					.textContent("add to group"),
			);
		},
		title() {
			return "Profile";
		},
	}),
};

const profilePageHeaderEndCss = css`
	:scope {
		font-size: 0.6em;
	}
`;
