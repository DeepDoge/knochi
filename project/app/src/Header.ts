import { computed, tags } from "purify-js";
import { HomeSvg } from "~/assets/svgs/HomeSvg";
import { UserSvg } from "~/assets/svgs/UserSvg";
import { currentWalletDetail } from "~/features/wallet/utils";
import { css, scopeCss } from "~/utils/style";
import { currentPathname } from "../router/url";
import { WalletAvatarSvg } from "../wallet/WalletAvatarSvg";
import { connectWalletSearchParam, connectWalletShowModalHref } from "../wallet/modal";

const { header, a, nav, ul, li, section } = tags;

export function Header() {
	const signerAddress = computed((add) => {
		const detail = add(currentWalletDetail).val;
		if (!detail) return null;
		const signer = add(detail.signer).val;
		return signer?.address ?? null;
	});

	return header()
		.use(scopeCss(HeaderCss))
		.children(
			section()
				.ariaLabel("Home")
				.children(
					a()
						.href("#/")
						.title("Home")
						.children(currentPathname.derive((pathname) => HomeSvg({ filled: pathname === "/" }))),
				),
			nav().children(
				ul().children(
					li().children(
						a()
							.href("#/")
							.title("Home")
							.children(currentPathname.derive((pathname) => HomeSvg({ filled: pathname === "/" }))),
					),
					li().children(
						a()
							.href("#/")
							.title("Home")
							.children(currentPathname.derive((pathname) => HomeSvg({ filled: pathname === "/" }))),
					),
					li().children(
						a()
							.href("#/")
							.title("Home")
							.children(currentPathname.derive((pathname) => HomeSvg({ filled: pathname === "/" }))),
					),
				),
			),
			section({ class: "profile" })
				.ariaLabel("Profile")
				.children(
					signerAddress.derive((signerAddress) => {
						if (signerAddress) {
							return a()
								.ariaCurrent(
									currentPathname.derive((pathname) =>
										pathname === `/${signerAddress}` ? "page" : null,
									),
								)
								.href(`#/${signerAddress}`)
								.title("My Wallet")
								.children(WalletAvatarSvg(signerAddress));
						} else {
							return a()
								.href(connectWalletShowModalHref)
								.title("Connect Wallet")
								.children(
									connectWalletSearchParam.derive((searchParam) =>
										UserSvg({ filled: searchParam === "true" }),
									),
								);
						}
					}),
				),
		);
}

const HeaderCss = css`
	:scope {
		display: block grid;
		grid-template-columns: minmax(0, 1fr) auto minmax(min-content, 1fr);
		padding-inline: 1.5em;
		padding-block: 0.5em;
		--gap: 1em;
		gap: var(--gap);

		container-type: inline-size;
		@container (inline-size >= 40em) {
			background-image: linear-gradient(to top, var(--base), transparent);
		}
		@container (inline-size < 40em) {
			background-color: color-mix(in srgb, transparent, var(--base) 90%);
			border-block-start: solid 0.1em color-mix(in srgb, transparent, currentColor 25%);
		}
	}

	a:has(svg) {
		display: grid;
		grid-template-columns: 2.5em;
		color: inherit;
	}

	section {
		display: block grid;
		gap: var(--gap);
	}

	section.profile {
		justify-content: end;

		a[aria-current] {
			outline: solid currentColor 0.2em;
			outline-offset: 0.15em;
			border-radius: 50%;
		}
	}

	nav {
		ul,
		li {
			display: contents;
		}

		display: grid;
		grid-auto-flow: column;
		justify-content: space-around;
		gap: var(--gap);
	}
`;
