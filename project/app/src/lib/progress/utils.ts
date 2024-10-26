import { fragment, MemberOf, ref, tags } from "@purifyjs/core";
import { ErrorSvg } from "~/assets/svgs/ErrorSvg";
import { LoadingSvg } from "~/assets/svgs/LoadingSvg";
import { SuccessSvg } from "~/assets/svgs/SuccessSvg";
import { css, scope } from "~/lib/css";

const DELETE_TIMEOUT_MS = 5 * 1000;

const { ul, li, strong, small, progress } = tags;

const host = ul().id("progress-list");
export const progressListElement = host.element;

export function trackPromise<T extends Promise<unknown>>(
	strongMembers: MemberOf<HTMLElement>,
	smallMembers: MemberOf<HTMLElement> | null,
	promise: T,
) {
	const status = ref<"progress" | "success" | "fail">("progress");
	promise.then(() => {
		status.val = "success";
	});
	promise.catch(() => {
		status.val = "fail";
	});
	promise.finally(() => {
		setTimeout(() => {
			progressItem.element.remove();
		}, DELETE_TIMEOUT_MS);
	});

	const dynamic = status.derive<{
		icon: MemberOf<HTMLElement>;
		background: string;
		color: string;
		busy: boolean;
	}>((status) => {
		switch (status) {
			case "progress":
				return {
					icon: fragment(
						progress({ class: "visually-hidden" }).ariaLabel("Loading..."),
						LoadingSvg(),
					),
					background: "var(--pop)",
					color: "var(--base)",
					busy: true,
				};
			case "success":
				return {
					icon: fragment(
						progress({ class: "visually-hidden" })
							.value(1)
							.max(1)
							.ariaLabel("Completed"),
						SuccessSvg(),
					),
					background: "var(--success)",
					color: "var(--pop)",
					busy: false,
				};
			case "fail":
				return {
					icon: fragment(
						progress({ class: "visually-hidden" }).ariaLabel("Failed"),
						ErrorSvg(),
					),
					background: "var(--fail)",
					color: "var(--pop)",
					busy: false,
				};
		}
		status satisfies never;
	});

	const progressItem = li({
		style: dynamic.derive((dynamic) =>
			[`background-color:${dynamic.background}`, `color:${dynamic.color}`].join(";"),
		),
	})
		.role("status")
		.ariaLive("assertive")
		.ariaAtomic("true")
		.children(
			dynamic.derive((dynamic) => dynamic.icon),
			strong().children(strongMembers),
			smallMembers ? small().children(smallMembers) : null,
		);
	host.element.prepend(progressItem.element);

	return promise;
}

host.use(
	scope(css`
		:scope {
			display: block grid;
			justify-items: end;
			padding: 0;

			--margin: 0.25em;

			position: fixed;
			inset-block-end: var(--margin);
			inset-inline-end: var(--margin);
			margin-inline: auto;

			inline-size: max-content;
			max-inline-size: min(20em, 100%);
			gap: 0.4em;

			z-index: 1;
		}

		li {
			list-style: none;

			display: block grid;
			grid-template-columns: 1.5em 0.4em 1fr;
			grid-template-areas:
				"icon . label"
				"icon . text";
			&:not(:has(small)) {
				grid-template-areas: "icon . label";
			}

			svg {
				grid-area: icon;
			}
			strong {
				grid-area: label;
			}
			small {
				grid-area: text;
			}

			align-items: center;

			padding-inline: 1em;
			padding-block: 0.75em;

			background-color: var(--pop);
			color: var(--base);
			border-radius: var(--radius);
		}
	`),
);
