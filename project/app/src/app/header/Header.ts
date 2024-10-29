import { awaited, computed, tags } from "@purifyjs/core";
import { feedGroupFormDialogSearchParam } from "~/app/feed/feedGroupFormDialog";
import { feedGroupSearchParam } from "~/app/feed/feedGroupSearchParam";
import { FeedGroupTabList } from "~/app/header/FeedGroupTabList";
import { FeedGroupTabPanel } from "~/app/header/FeedGroupTabPanel";
import { router } from "~/app/router";
import { postDb } from "~/features/post/database/client";
import { css, scope } from "~/lib/css";
import { Address } from "~/lib/solidity/primatives";
import { WalletAddress } from "~/lib/wallet/components/WalletAddress";
import { WalletAvatarSvg } from "~/lib/wallet/components/WalletAvatarSvg";
import { connectWallet } from "~/lib/wallet/connectDialog";
import { currentWalletDetail } from "~/lib/wallet/utils";

const { div, header, a, section } = tags;

export function Header() {
	const signerAddress = computed(() => {
		const detail = currentWalletDetail.val;
		if (!detail) return null;
		const signer = detail.signer.val;
		return signer?.address ? Address().parse(signer.address) : null;
	});

	const groupsPromise = feedGroupFormDialogSearchParam.derive(Boolean).derive(() => {
		return postDb.find("FeedGroup").many({ by: "index", order: "prev" });
	});

	return header()
		.use(scope(HeaderCss))
		.children(
			groupsPromise
				.derive((groups) =>
					groups.then((groups) => [
						FeedGroupTabList(groups).attributes({ style: "grid-area:tablist" }),
						feedGroupSearchParam
							.derive((value) => groups.find((group) => group.groupId === value))
							.derive((group) => group ?? { name: "home", groupId: "~", index: -1 })
							.derive((group) =>
								FeedGroupTabPanel(group).attributes({
									style: "grid-area:tabpanel",
								}),
							),
					]),
				)
				.derive(awaited),
			section({ class: "profile" })
				.ariaLabel("Profile")
				.children(
					signerAddress.derive((signerAddress) => {
						if (signerAddress) {
							return div({ class: "content" }).children(
								a()
									.ariaCurrent(
										router.route.derive((route) =>
											(
												route?.name === "profile" &&
												route.data.address === signerAddress
											) ?
												"page"
											:	null,
										),
									)
									.href(router.routes.profile.toHref({ address: signerAddress }))
									.title("My Wallet")
									.children(WalletAvatarSvg(signerAddress)),
								WalletAddress(signerAddress),
							);
						} else {
							return a({ class: "button" })
								.href(connectWallet.searchParam.toHref("auto"))
								.children("connect wallet");
						}
					}),
				),
		);
}

const HeaderCss = css`
	a {
		color: inherit;
	}

	:scope {
		display: block grid;
		grid-template-areas:
			"tablist	.		tabpanel"
			".			.		."
			"profile	profile	profile";
		grid-template-columns: auto 0 1fr;
		grid-template-rows: 1fr 0 auto;
	}

	section.profile {
		grid-area: profile;

		display: block grid;
		padding-block: 1em;
		padding-inline: 1em;
		background-color: color-mix(in srgb, var(--base), var(--pop) 10%);

		a:has(svg) {
			display: block grid;
		}

		a[aria-current] {
			border: solid currentColor 0.2em;
			padding: 0.15em;
			border-radius: 50%;
		}

		.content {
			display: block grid;
			grid-template-columns: 2.5em 1fr;
			gap: 0.5em;
			align-items: center;
		}
	}
`;
