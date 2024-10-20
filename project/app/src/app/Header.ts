import { computed, tags } from "@purifyjs/core";
import { router } from "~/app/router";
import { RssSvg } from "~/assets/svgs/RssSvg";
import { css, scope } from "~/lib/css";
import { Router } from "~/lib/router/mod";
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

	return header()
		.use(scope(HeaderCss))
		.children(
			div()
				.role("tablist")
				.children(
					a()
						.role("tab")
						.href("#/")
						.title("Home Feed")
						.attributes({ "aria-controls": "header-tabpanel-home" })
						.ariaSelected(Router.pathname.derive((pathname) => (pathname === "/" ? "true" : "false")))
						.tabIndex(Router.pathname.derive((pathname) => (pathname === "/" ? 0 : -1)))
						.children(RssSvg()),
					hr(),
				),
			div()
				.role("tabpanel")
				.id("header-tabpanel-home")
				.tabIndex(0)
				.ariaLabel("Home Feed")
				.children("Feed List Here"),
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

		[role="tab"] {
			display: block grid;
			inline-size: 3em;

			border-radius: 50%;
			overflow: clip;

			background-color: color-mix(in srgb, var(--base), var(--pop) 20%);
			padding: 0.75em;
		}

		[role="tab"][aria-selected="true"] {
			background-color: var(--pop);
			color: var(--base);
		}
	}

	[role="tabpanel"] {
		grid-area: tabpanel;

		padding-inline: 1em;
		padding-block: 1em;

		background-color: color-mix(in srgb, var(--base), var(--pop) 7.5%);
	}
`;
