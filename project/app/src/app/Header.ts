import { awaited, computed, fragment, tags } from "@purifyjs/core";
import { router } from "~/app/router";
import { CreateFolderSvg } from "~/assets/svgs/CreateFolderSvg";
import { RssSvg } from "~/assets/svgs/RssSvg";
import { SingleLetterSvg } from "~/assets/svgs/SingleLetterSvg";
import { feedGroupFormDialogSearchParam } from "~/features/post/components/FeedGroupForm";
import { postDb } from "~/features/post/database/client";
import { css, scope } from "~/lib/css";
import { Address } from "~/lib/solidity/primatives";
import { WalletAddress } from "~/lib/wallet/components/WalletAddress";
import { WalletAvatarSvg } from "~/lib/wallet/components/WalletAvatarSvg";
import { connectWallet } from "~/lib/wallet/connectDialog";
import { currentWalletDetail } from "~/lib/wallet/utils";

const { div, header, a, hr, section } = tags;

export function Header() {
	const signerAddress = computed(() => {
		const detail = currentWalletDetail.val;
		if (!detail) return null;
		const signer = detail.signer.val;
		return signer?.address ? Address().parse(signer.address) : null;
	});

	const groupsPromise = feedGroupFormDialogSearchParam.derive(Boolean).derive(() => postDb.find("FeedGroup").many());

	return header()
		.use(scope(HeaderCss))
		.children(
			div()
				.role("tablist")
				.children(
					(() => {
						const id = "";
						const href = router.routes.group.toHref({ groupId: id });
						const current = router.route.derive(
							(route) => route?.name === "group" && route.data.groupId === id,
						);
						return a()
							.role("tab")
							.href(href)
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
					groupsPromise
						.derive(async (groupsPromise) => {
							const groups = await groupsPromise;

							return groups.map((group) => {
								const href = router.routes.group.toHref({ groupId: group.groupId });
								const current = router.route.derive(
									(route) => route?.name === "group" && route.data.groupId === group.groupId,
								);
								return a()
									.role("tab")
									.href(href)
									.title(group.name)
									.attributes({ "aria-controls": "header-tabpanel-home" })
									.ariaSelected(current.derive(String))
									.tabIndex(current.derive((current) => (current ? 0 : -1)))
									.children(SingleLetterSvg(group.name.at(0)?.toUpperCase() ?? "X"));
							});
						})
						.derive(awaited),
				),
			div()
				.role("tabpanel")
				.id("header-tabpanel-home")
				.tabIndex(0)
				.ariaLabel("Home Feed")
				.children(
					groupsPromise
						.derive(async (groupsPromise) => {
							const groups = await groupsPromise;
							const group = router.route.derive((route) =>
								route?.name === "group" ?
									(groups.find((group) => group.groupId === route.data.groupId) ?? null)
								:	null,
							);

							return group.derive((group) => {
								if (!group) {
									return "Not Found";
								}

								const feeds = postDb
									.find("Feed")
									.byIndex("groupId", "=", group.groupId, Infinity)
									.then((feeds) => {
										return feeds.map((feed) => {
											return div().textContent(feed.feedId);
										});
									});

								return fragment(group.name, awaited(feeds));
							});
						})
						.derive(awaited),
				),
			section({ class: "profile" })
				.ariaLabel("Profile")
				.children(
					signerAddress.derive((signerAddress) => {
						if (signerAddress) {
							return div({ class: "content" }).children(
								a()
									.ariaCurrent(
										router.route.derive((route) =>
											route?.name === "profile" && route.data.address === signerAddress ?
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
								.children("Connect Wallet");
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

	[role="tablist"] {
		grid-area: tablist;

		display: block grid;
		align-content: start;
		gap: 0.5em;
		overflow: overlay;

		padding-inline: 0.5em;
		padding-block: 1em;

		background-color: color-mix(in srgb, var(--base), var(--pop) 5%);

		:is([role="tab"], a) {
			display: block grid;
			inline-size: 3em;
			aspect-ratio: 1;
			padding: 0.75em;

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
	}

	[role="tabpanel"] {
		grid-area: tabpanel;

		padding-inline: 1em;
		padding-block: 1em;

		background-color: color-mix(in srgb, var(--base), var(--pop) 7.5%);
	}
`;
