import { Signal, tags } from "@purifyjs/core";
import { FeedGroupAddFormPopoverButton } from "~/features/feed/components/FeedGroupAddFormPopoverButton";
import { Feed } from "~/features/feed/Feed";
import { ProfileView } from "~/features/profile/ProfileView";
import { config } from "~/shared/config";
import { Route } from "~/shared/router";
import { Address } from "~/shared/schemas/primatives";
import { css, useScope } from "~/shared/utils/css";
import { usePart } from "~/shared/utils/effects/usePart";
import { WalletAddress } from "~/shared/wallet/components/WalletAddress";

const { div, strong, small } = tags;

export type ProfileRouteData = { address: Address; postsFeed: Signal<Feed> };
export class ProfileRoute extends Route<ProfileRouteData> {
	constructor(address: Address) {
		const pathname = address;
		const data = ProfileRoute.parsePathname(pathname);
		super(pathname, data);
	}

	public static parsePathname(pathname: string): ProfileRouteData {
		return Address()
			.transform((address) => ({
				address,
				postsFeed: config.derive((config) => Feed.ProfilePosts({ address, config })),
			}))
			.parse(pathname);
	}

	public override title() {
		return this.data.address;
	}

	public override render() {
		const { address, postsFeed } = this.data;
		return postsFeed.derive((postsFeed) => ProfileView({ address, postsFeed }));
	}

	static #headerCss = css`
		[data-part="address"] {
			max-inline-size: 10em;
		}

		[data-part="button"] {
			font-size: 0.7em;
			padding-block: 0.2em;
		}
	`;
	public override renderHeader() {
		const { address, postsFeed } = this.data;
		return div({ style: "display:contents" })
			.effect(useScope(ProfileRoute.#headerCss))
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
	}
}
