import { awaited, computed, tags } from "@purifyjs/core";
import { feedGroupFormDialogSearchParam } from "~/app/feed/feedGroupFormDialog";
import { feedGroupSearchParam } from "~/app/feed/routes";
import { FeedGroupTabList } from "~/app/header/FeedGroupTabList";
import { FeedGroupTabPanel } from "~/app/header/FeedGroupTabPanel";
import { router } from "~/app/router";
import { postDb } from "~/features/feed/database/client";
import { css, useScope } from "~/shared/css";
import { Address } from "~/shared/solidity/primatives";
import { WalletAddress } from "~/shared/wallet/components/WalletAddress";
import { WalletAvatarSvg } from "~/shared/wallet/components/WalletAvatarSvg";
import { connectWallet } from "~/shared/wallet/connectDialog";
import { currentWalletDetail } from "~/shared/wallet/utils";

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
		.effect(useScope(HeaderCss))
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
							const ariaCurrent = router.route.derive((route) =>
								route?.name === "profile" && route.data.address === signerAddress ?
									"page"
								:	"false",
							);

							return div({ class: "content" }).children(
								a()
									.ariaCurrent(ariaCurrent)
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
	:scope {
		display: block grid;
		grid-template-areas:
			"tablist	.		tabpanel"
			".			.		."
			"profile	profile	profile";
		grid-template-columns: auto 0 1fr;
		grid-template-rows: 1fr 0 auto;
	}

	@keyframes hide-header-scroll {
		to {
			scale: 0.95;
			translate: 100% 0;
		}
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

		a[aria-current="page"] {
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
